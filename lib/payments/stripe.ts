import Stripe from "stripe";
import { db } from "@/lib/db";
import { createOrder } from "@/lib/orders/service";
import type {
  PaymentGatewayAdapter,
  GatewayCredentials,
  CanonicalPaymentEvent,
  CheckoutSessionParams,
  CheckoutSessionResult,
} from "@/types/index";
import { PaymentError } from "@/lib/payments/adapter";

// ─── Credential keys used by this adapter ─────────────────────────────────────
// Stored in GatewayCredential rows with these exact key values.
// Falls back to env vars for local dev convenience.

const KEY_SECRET  = "secretKey";      // maps to STRIPE_SECRET_KEY
const KEY_WEBHOOK = "webhookSecret";  // maps to STRIPE_WEBHOOK_SECRET

// ─── StripeAdapter ────────────────────────────────────────────────────────────

export class StripeAdapter implements PaymentGatewayAdapter {
  /** HTTP header Stripe uses to send webhook signatures. */
  readonly signatureHeader = "stripe-signature";

  private readonly credentials: GatewayCredentials;

  /**
   * @param credentials  Map loaded from GatewayCredential rows in the DB.
   *                     Falls back to env vars when keys are absent.
   */
  constructor(credentials: GatewayCredentials = {}) {
    this.credentials = credentials;
  }

  // ── Internal helpers ───────────────────────────────────────────────────────

  private getSecretKey(): string {
    const key =
      this.credentials[KEY_SECRET] ??
      process.env.STRIPE_SECRET_KEY;
    if (!key) throw new PaymentError("Stripe secretKey not configured");
    return key;
  }

  private getWebhookSecret(): string | null {
    return (
      this.credentials[KEY_WEBHOOK] ??
      process.env.STRIPE_WEBHOOK_SECRET ??
      null
    );
  }

  private getClient(): Stripe {
    return new Stripe(this.getSecretKey());
  }

  // ── createCheckoutSession ──────────────────────────────────────────────────

  async createCheckoutSession(
    params: CheckoutSessionParams
  ): Promise<CheckoutSessionResult> {
    const stripe = this.getClient();

    // Load offer + price + course
    const offer = await db.offer.findUnique({
      where: { id: params.offerId },
      include: {
        prices: { where: { id: params.priceId } },
        course: { select: { id: true, title: true, slug: true } },
      },
    });

    if (!offer) throw new PaymentError("Offer not found");
    const price = offer.prices[0];
    if (!price) throw new PaymentError("Price not found");

    // Determine Stripe checkout mode
    const mode: Stripe.Checkout.SessionCreateParams["mode"] =
      offer.type === "SUBSCRIPTION" ? "subscription" : "payment";

    // Create pending Order row first (so we have the orderId for metadata)
    const order = await createOrder({
      userId: params.userId,
      offerId: params.offerId,
      priceId: params.priceId,
      couponId: params.couponId,
      totalAmount: price.amount.toNumber(),
      currency: price.currency,
    });

    // Build line item
    const unitAmount = Math.round(price.amount.toNumber() * 100); // cents
    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: price.currency.toLowerCase(),
        unit_amount: unitAmount,
        product_data: { name: offer.course.title },
        ...(mode === "subscription"
          ? {
              recurring: {
                interval: (price.billingInterval ?? "month") as Stripe.Price.Recurring.Interval,
                interval_count: price.intervalCount ?? 1,
              },
            }
          : {}),
      },
      quantity: 1,
    };

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [lineItem],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        orderId: order.id,
        userId: params.userId,
        offerId: params.offerId,
        priceId: params.priceId,
        courseId: offer.course.id,
      },
      ...(price.trialDays && mode === "subscription"
        ? { subscription_data: { trial_period_days: price.trialDays } }
        : {}),
    });

    if (!session.url) {
      throw new PaymentError("Stripe did not return a checkout URL");
    }

    // Store the Stripe session ID on the order
    await db.order.update({
      where: { id: order.id },
      data: { gatewayOrderId: session.id },
    });

    return { sessionId: session.id, url: session.url };
  }

  // ── verifyWebhookSignature ─────────────────────────────────────────────────

  verifyWebhookSignature(payload: Buffer | string, signature: string): boolean {
    const secret = this.getWebhookSecret();
    if (!secret) return false;

    try {
      const stripe = this.getClient();
      stripe.webhooks.constructEvent(payload, signature, secret);
      return true;
    } catch {
      return false;
    }
  }

  // ── parseWebhookEvent ──────────────────────────────────────────────────────

  parseWebhookEvent(rawEvent: unknown): CanonicalPaymentEvent | null {
    // Pure parsing — no Stripe client needed
    const event = rawEvent as Stripe.Event;

    const base = {
      gatewayEventId: event.id,
      rawEvent,
    };

    switch (event.type) {
      // ── One-time payment completed
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          return null; // Let subscription.created handle it
        }
        return {
          ...base,
          type: "payment.succeeded",
          gatewayOrderId: session.id,
          orderId: session.metadata?.orderId,
          userId: session.metadata?.userId,
          amount: session.amount_total ?? undefined,
          currency: session.currency ?? undefined,
        };
      }

      // ── Async payment failed (e.g. bank transfer)
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          ...base,
          type: "payment.failed",
          gatewayOrderId: session.id,
          orderId: session.metadata?.orderId,
          userId: session.metadata?.userId,
        };
      }

      // ── Subscription created
      case "customer.subscription.created": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any;
        return {
          ...base,
          type: "subscription.started",
          gatewaySubId: sub.id as string,
          currentPeriodEnd: sub.current_period_end
            ? new Date((sub.current_period_end as number) * 1000)
            : undefined,
        };
      }

      // ── Subscription invoice paid (renewal)
      case "invoice.payment_succeeded": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string | undefined;
        if (!subscriptionId) return null; // One-off invoice, skip
        return {
          ...base,
          type: "subscription.renewed",
          gatewaySubId: subscriptionId,
          currentPeriodEnd: invoice.lines?.data?.[0]?.period?.end
            ? new Date((invoice.lines.data[0].period.end as number) * 1000)
            : undefined,
        };
      }

      // ── Refund issued
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        return {
          ...base,
          type: "refund.created",
          gatewayOrderId: charge.payment_intent as string | undefined,
          amount: charge.amount_refunded,
          currency: charge.currency,
        };
      }

      default:
        return null;
    }
  }
}
