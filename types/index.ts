// ─── Sales Page Payload Types ─────────────────────────────────────────────────
// These types define the canonical shape of a generated sales page payload.
// Stored in GeneratedPage.payload (Json). Consumed by the public sales page UI.

export type SalesPageHero = {
  title: string;
  subtitle: string | null;
  thumbnailUrl: string | null;
};

export type SalesPageVideo = { url: string } | null;

export type SalesPageDescription = { body: string } | null;

export type SalesPageOutcomes = { items: string[] };

export type SalesPageAudience = { items: string[] };

export type SalesPageIncludes = { items: string[] };

export type SalesPageLesson = {
  title: string;
  type: string; // VIDEO | TEXT | DOWNLOAD | MIXED
  isPreview: boolean;
  drip_days: number | null;
};

export type SalesPageModule = {
  title: string;
  lessonCount: number;
  lessons: SalesPageLesson[];
};

export type SalesPageCurriculum = { modules: SalesPageModule[] };

export type SalesPageInstructor = {
  name: string;
  bio: string | null;
  avatar: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
};

export type SalesPageTestimonial = {
  name: string;
  role: string | null;
  avatar: string | null;
  body: string;
  rating: number | null;
};

export type SalesPageTestimonials = { items: SalesPageTestimonial[] };

export type SalesPageFAQItem = { question: string; answer: string };

export type SalesPageFAQ = { items: SalesPageFAQItem[] };

export type SalesPagePrice = {
  id: string;
  amount: string; // Decimal serialized as string
  currency: string;
  isDefault: boolean;
  billingInterval: string | null;
  trialDays: number | null;
};

export type SalesPageOffer = {
  id: string;
  name: string;
  type: string; // ONE_TIME | SUBSCRIPTION | PAYMENT_PLAN
  prices: SalesPagePrice[];
};

export type SalesPageCTA = { offers: SalesPageOffer[] };

export type GeneratedSalesPagePayload = {
  hero: SalesPageHero;
  video: SalesPageVideo;
  description: SalesPageDescription;
  outcomes: SalesPageOutcomes;
  audience: SalesPageAudience;
  includes: SalesPageIncludes;
  curriculum: SalesPageCurriculum;
  instructor: SalesPageInstructor;
  testimonials: SalesPageTestimonials;
  faq: SalesPageFAQ;
  cta: SalesPageCTA;
};

// ─── Payment System Types ─────────────────────────────────────────────────────

/**
 * Canonical payment event types — provider-agnostic.
 * All payment gateways must map their events to one of these.
 */
export type CanonicalEventType =
  | "payment.succeeded"
  | "payment.failed"
  | "subscription.started"
  | "subscription.renewed"
  | "refund.created";

/**
 * Normalised payment event. Produced by adapter.parseWebhookEvent().
 * Business logic only ever sees this shape — never raw Stripe/etc. objects.
 */
export type CanonicalPaymentEvent = {
  type: CanonicalEventType;
  gatewayEventId: string;       // Provider event ID (used for idempotency)
  gatewayOrderId?: string;      // Provider session / payment_intent ID
  gatewaySubId?: string;        // Provider subscription ID
  orderId?: string;             // Perseus Order.id (stored in metadata)
  userId?: string;              // Perseus User.id (stored in metadata)
  amount?: number;              // Amount in smallest currency unit (cents)
  currency?: string;
  currentPeriodEnd?: Date;      // Subscription billing period end
  rawEvent: unknown;            // Original provider payload (stored verbatim)
};

export type CheckoutSessionParams = {
  offerId: string;
  priceId: string;
  userId: string;
  couponId?: string;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutSessionResult = {
  sessionId: string;
  url: string;
};

/**
 * Credentials loaded from GatewayCredential rows in the DB.
 * Keyed by the GatewayCredential.key field (e.g. "secretKey", "webhookSecret").
 * Adapters receive this map in their constructor — they never read process.env directly.
 * Falls back to env vars only when the map is empty (dev convenience).
 */
export type GatewayCredentials = Record<string, string>;

/**
 * Every payment gateway adapter must implement this interface.
 * No gateway-specific code ever leaks outside the adapter file.
 * Credentials are injected via the constructor — the adapter is env-agnostic.
 */
export interface PaymentGatewayAdapter {
  createCheckoutSession(
    params: CheckoutSessionParams
  ): Promise<CheckoutSessionResult>;
  verifyWebhookSignature(
    payload: Buffer | string,
    signature: string
  ): boolean;
  parseWebhookEvent(rawEvent: unknown): CanonicalPaymentEvent | null;
  /**
   * The HTTP header name this gateway uses to send the webhook signature.
   * e.g. "stripe-signature", "paypal-transmission-sig"
   * The dynamic webhook route reads this to extract the right header.
   */
  readonly signatureHeader: string;
}

// ─── Course With Relations ─────────────────────────────────────────────────────
// The shape returned by getCourse() / getCourseBySlug() in lib/courses/service.ts

import type { Prisma } from "@prisma/client";

export type CourseWithRelations = Prisma.CourseGetPayload<{
  include: {
    instructor: true;
    modules: {
      include: {
        lessons: true;
      };
    };
    faqs: true;
    testimonials: true;
    offers: {
      include: {
        prices: true;
      };
    };
  };
}>;
