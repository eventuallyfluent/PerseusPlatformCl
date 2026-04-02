import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveAdapter } from "@/lib/payments/registry";
import { storeWebhookEvent, processWebhookEvent } from "@/lib/webhooks/service";

/**
 * Dynamic webhook endpoint — handles ALL payment gateways.
 *
 *   POST /api/webhooks/stripe   → StripeAdapter
 *   POST /api/webhooks/paypal   → PayPalAdapter  (once implemented)
 *   POST /api/webhooks/paddle   → PaddleAdapter  (once implemented)
 *
 * Each gateway adapter declares its own `signatureHeader` property so this
 * route knows which HTTP header carries the signature — no gateway-specific
 * code lives here.
 *
 * To register a new gateway: add a Gateway row to the DB, implement the
 * adapter in lib/payments/<provider>.ts, add a case to lib/payments/registry.ts.
 * This file requires zero changes.
 */
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ gateway: string }> }
) {
  const { gateway: gatewaySlug } = await params;

  // Read raw body — required for signature verification (all gateways)
  const rawBody = await request.arrayBuffer();
  const payload = Buffer.from(rawBody);

  // Resolve adapter + gateway DB record by URL slug
  let adapter: Awaited<ReturnType<typeof resolveAdapter>>["adapter"];
  let gatewayId: string;

  try {
    ({ adapter, gatewayId } = await resolveAdapter(gatewaySlug));
  } catch {
    // Unknown or inactive gateway slug — return 404 to avoid leaking info
    return NextResponse.json({ error: "Gateway not found" }, { status: 404 });
  }

  // Extract signature using the header name declared by the adapter
  const signature = request.headers.get(adapter.signatureHeader) ?? "";

  // Verify signature
  const isValid = adapter.verifyWebhookSignature(payload, signature);
  if (!isValid) {
    console.warn(`[webhook/${gatewaySlug}] Invalid signature`);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  // Parse raw payload
  let rawEvent: unknown;
  try {
    rawEvent = JSON.parse(payload.toString());
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const event = rawEvent as { id: string; type: string };

  // Store event idempotently
  const { event: stored, alreadyProcessed } = await storeWebhookEvent(
    gatewayId,
    event.type,
    rawEvent,
    event.id
  );

  if (alreadyProcessed) {
    return NextResponse.json({ status: "already_processed" });
  }

  // Parse to canonical event shape
  const canonical = adapter.parseWebhookEvent(rawEvent);

  if (canonical) {
    await processWebhookEvent(canonical, gatewayId, stored.id);
  } else {
    // Unrecognised event type — mark processed so it isn't retried
    await db.webhookEvent.update({
      where: { id: stored.id },
      data: { processed: true },
    });
  }

  return NextResponse.json({ received: true });
}
