import { db } from "@/lib/db";
import { completeOrder, failOrder, refundOrder } from "@/lib/orders/service";
import { getEmailAdapter } from "@/lib/email";
import type { CanonicalPaymentEvent } from "@/types/index";

/**
 * Persists a raw webhook event to the database.
 * Idempotent: if an event with the same gatewayEventId already exists,
 * returns the existing record with alreadyProcessed=true.
 */
export async function storeWebhookEvent(
  gatewayId: string,
  eventType: string,
  rawPayload: unknown,
  gatewayEventId: string
): Promise<{ event: { id: string; processed: boolean }; alreadyProcessed: boolean }> {
  // Check if we've already stored this event (idempotency via gatewayEventId)
  // WebhookEvent doesn't have a unique on gatewayEventId in schema, so we use findFirst
  const existing = await db.webhookEvent.findFirst({
    where: {
      gatewayId,
      // Store gatewayEventId in eventType field with a prefix for lookups
      // OR we query by rawPayload — simplest: store eventId in the payload
    },
  });

  // Since WebhookEvent.id is internal, we store the gateway event ID inside rawPayload
  // and check for duplicates by eventType + a unique key in the payload
  const payload = rawPayload as Record<string, unknown>;
  const eventId = (payload?.id as string) ?? gatewayEventId;

  const existingByEventId = await db.webhookEvent.findFirst({
    where: {
      gatewayId,
      eventType,
      // Check if we already have this event by looking for the ID in rawPayload
    },
    select: { id: true, processed: true },
  });

  // Simple idempotency: check by gatewayId + eventType + the gateway event ID
  // We embed gatewayEventId in eventType as "stripe:evt_xxx" pattern
  const uniqueEventType = `${eventType}:${eventId}`;

  const existingEvent = await db.webhookEvent.findFirst({
    where: { gatewayId, eventType: uniqueEventType },
    select: { id: true, processed: true },
  });

  if (existingEvent) {
    return { event: existingEvent, alreadyProcessed: existingEvent.processed };
  }

  const event = await db.webhookEvent.create({
    data: {
      gatewayId,
      eventType: uniqueEventType,
      rawPayload: rawPayload as object,
      processed: false,
    },
    select: { id: true, processed: true },
  });

  return { event, alreadyProcessed: false };
}

/**
 * Routes a canonical payment event to the appropriate business logic handler.
 * Marks the WebhookEvent as processed on success.
 */
export async function processWebhookEvent(
  event: CanonicalPaymentEvent,
  gatewayId: string,
  webhookEventId: string
) {
  try {
    switch (event.type) {
      case "payment.succeeded": {
        if (!event.orderId) break;
        await completeOrder(event.orderId, {
          gatewayId,
          gatewayPaymentId: event.gatewayOrderId ?? event.gatewayEventId,
          amount: event.amount ?? 0,
          currency: event.currency ?? "usd",
          rawEvent: event.rawEvent,
        });

        // Send enrollment confirmation + receipt — non-blocking, never fails the webhook
        sendPostPurchaseEmails(event.orderId, event.amount ?? 0, event.currency ?? "usd").catch(
          (err) => console.error("[email] Post-purchase email failed:", err)
        );
        break;
      }

      case "payment.failed": {
        if (!event.orderId) break;
        await failOrder(event.orderId);
        break;
      }

      case "subscription.started": {
        if (!event.gatewaySubId || !event.userId) break;
        // Find offer via metadata or subscription lookup (best-effort)
        // For now, upsert a minimal subscription record
        const existingSub = await db.subscription.findFirst({
          where: { gatewaySubId: event.gatewaySubId },
        });

        if (!existingSub && event.userId) {
          // We need offerId — for now log and skip if unavailable
          // Full linking done when order metadata carries offerId
          const order = event.orderId
            ? await db.order.findUnique({ where: { id: event.orderId }, select: { offerId: true } })
            : null;

          if (order?.offerId) {
            await db.subscription.create({
              data: {
                userId: event.userId,
                offerId: order.offerId,
                gatewayId,
                gatewaySubId: event.gatewaySubId,
                status: "ACTIVE",
                currentPeriodEnd: event.currentPeriodEnd ?? null,
              },
            });
          }
        }
        break;
      }

      case "subscription.renewed": {
        if (!event.gatewaySubId) break;
        await db.subscription.updateMany({
          where: { gatewaySubId: event.gatewaySubId },
          data: {
            status: "ACTIVE",
            currentPeriodEnd: event.currentPeriodEnd ?? undefined,
          },
        });
        break;
      }

      case "subscription.cancelled": {
        // SCP logic: when a subscription is cancelled/deleted, revoke enrollment
        if (!event.gatewaySubId) break;
        await db.subscription.updateMany({
          where: { gatewaySubId: event.gatewaySubId },
          data: { status: "CANCELLED" },
        });

        // Find the subscription to get userId + offerId → courseId
        const cancelledSub = await db.subscription.findFirst({
          where: { gatewaySubId: event.gatewaySubId },
          include: { offer: { select: { courseId: true } } },
        });
        if (cancelledSub) {
          // Remove enrollment so student loses access on cancellation
          await db.enrollment.deleteMany({
            where: {
              userId: cancelledSub.userId,
              courseId: cancelledSub.offer.courseId,
            },
          });
        }
        break;
      }

      case "subscription.past_due": {
        if (!event.gatewaySubId) break;
        await db.subscription.updateMany({
          where: { gatewaySubId: event.gatewaySubId },
          data: { status: "PAST_DUE" },
        });
        break;
      }

      case "refund.created": {
        // event.gatewayOrderId carries the gateway's PaymentIntent/charge ID.
        // Resolve to our internal orderId via the Payment table.
        const gatewayPaymentId = event.gatewayOrderId ?? event.orderId;
        if (!gatewayPaymentId) break;

        const payment = await db.payment.findFirst({
          where: { gatewayPaymentId },
          select: { orderId: true },
        });

        if (!payment) {
          console.warn(`[webhook] refund.created: no payment found for gatewayPaymentId=${gatewayPaymentId}`);
          break;
        }

        await refundOrder(payment.orderId);
        break;
      }
    }

    // Mark webhook event as processed
    await db.webhookEvent.update({
      where: { id: webhookEventId },
      data: { processed: true },
    });
  } catch (err) {
    // Log but don't re-throw — webhook handler should always return 200
    console.error(`[webhook] Failed to process ${event.type}:`, err);
  }
}

// ─── Post-purchase email helper ───────────────────────────────────────────────

async function sendPostPurchaseEmails(
  orderId: string,
  amountCents: number,
  currency: string
): Promise<void> {
  // Resolve order → user → course details
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      offer: {
        include: {
          course: {
            select: {
              title: true,
              slug: true,
              instructor: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!order) return;

  const user = await db.user.findUnique({
    where: { id: order.userId },
    select: { email: true, name: true },
  });

  // userId "guest" has no DB user — skip email gracefully
  if (!user?.email) return;

  const course = order.offer.course;
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);

  const email = getEmailAdapter();

  await Promise.all([
    email.sendEnrollmentConfirmation({
      to: user.email,
      studentName: user.name ?? null,
      courseTitle: course.title,
      courseSlug: course.slug,
      instructorName: course.instructor.name,
    }),
    email.sendPurchaseReceipt({
      to: user.email,
      studentName: user.name ?? null,
      courseTitle: course.title,
      amountPaid: formattedAmount,
      currency: currency.toUpperCase(),
      orderId,
    }),
  ]);
}
