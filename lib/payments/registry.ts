import { db } from "@/lib/db";
import type { PaymentGatewayAdapter, GatewayCredentials } from "@/types/index";
import { StripeAdapter } from "@/lib/payments/stripe";

// ─── Adapter factory (slug → instance) ───────────────────────────────────────

/**
 * Instantiates the correct adapter for a given gateway slug,
 * injecting credentials loaded from GatewayCredential rows in the DB.
 *
 * To add a new gateway:
 *   1. Create lib/payments/<provider>.ts implementing PaymentGatewayAdapter
 *   2. Add a case below
 *   3. Insert a Gateway DB row with the matching slug + isActive=true
 *   4. Insert GatewayCredential rows with the provider's required keys
 *
 * No env vars required in production — credentials come from the DB.
 * Adapters fall back to env vars in dev when no DB credentials are present.
 */
function buildAdapter(slug: string, credentials: GatewayCredentials): PaymentGatewayAdapter {
  switch (slug) {
    case "stripe":
      return new StripeAdapter(credentials);
    // case "paypal":
    //   return new PayPalAdapter(credentials);
    // case "paddle":
    //   return new PaddleAdapter(credentials);
    default:
      throw new Error(`Unknown payment gateway slug: "${slug}"`);
  }
}

// ─── DB-backed resolvers ──────────────────────────────────────────────────────

/**
 * Loads a specific gateway by slug + its credentials from the DB,
 * then instantiates the adapter. Used by webhook routes (slug from URL).
 */
export async function resolveAdapter(slug: string): Promise<{
  adapter: PaymentGatewayAdapter;
  gatewayId: string;
  slug: string;
}> {
  const gateway = await db.gateway.findFirst({
    where: { slug, isActive: true },
    include: {
      credentials: { select: { key: true, encryptedValue: true } },
    },
  });

  if (!gateway) {
    throw new Error(`No active gateway found for slug "${slug}"`);
  }

  const credentials: GatewayCredentials = Object.fromEntries(
    gateway.credentials.map((c) => [c.key, c.encryptedValue])
  );

  return { adapter: buildAdapter(gateway.slug, credentials), gatewayId: gateway.id, slug: gateway.slug };
}

/**
 * Resolves whichever gateway is currently active — no slug required.
 * Used by the checkout API: the active gateway is a DB-level config choice.
 * Flip Gateway.isActive in the DB to switch providers with zero code changes.
 */
export async function resolveActiveAdapter(): Promise<{
  adapter: PaymentGatewayAdapter;
  gatewayId: string;
  slug: string;
}> {
  const gateway = await db.gateway.findFirst({
    where: { isActive: true },
    include: {
      credentials: { select: { key: true, encryptedValue: true } },
    },
    orderBy: { createdAt: "asc" }, // deterministic if multiple active rows exist
  });

  if (!gateway) {
    throw new Error("No active payment gateway configured");
  }

  const credentials: GatewayCredentials = Object.fromEntries(
    gateway.credentials.map((c) => [c.key, c.encryptedValue])
  );

  return { adapter: buildAdapter(gateway.slug, credentials), gatewayId: gateway.id, slug: gateway.slug };
}

/**
 * Synchronous factory — for use where DB access is unavailable (tests, scripts).
 * Credentials must be supplied by the caller.
 */
export function getAdapter(slug: string, credentials: GatewayCredentials = {}): PaymentGatewayAdapter {
  return buildAdapter(slug, credentials);
}
