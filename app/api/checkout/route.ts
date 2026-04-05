import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { resolveActiveAdapter } from "@/lib/payments/registry";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const CheckoutSchema = z.object({
  offerId: z.string().min(1),
  priceId: z.string().min(1),
  couponId: z.string().optional(),
});

/**
 * POST /api/checkout
 * Body: { offerId, priceId, couponId? }
 * userId is ALWAYS read from the server session — never trusted from the client.
 * Returns: { sessionId, url } — redirect URL from the active payment gateway.
 */
export async function POST(request: NextRequest) {
  try {
    // Require authenticated session — userId must come from the server
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { offerId, priceId, couponId } = parsed.data;

    // Validate offer + price exist before touching the payment gateway
    const offer = await db.offer.findUnique({
      where: { id: offerId },
      include: { course: { select: { slug: true } } },
    });
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const price = await db.price.findUnique({ where: { id: priceId } });
    if (!price || price.offerId !== offerId) {
      return NextResponse.json({ error: "Price not found for this offer" }, { status: 404 });
    }

    // Resolve the active gateway — no slug hardcoded
    const { adapter } = await resolveActiveAdapter();

    const origin =
      request.headers.get("origin") ??
      process.env.NEXT_PUBLIC_BASE_URL ??
      "http://localhost:3000";

    const result = await adapter.createCheckoutSession({
      offerId,
      priceId,
      userId,
      couponId,
      successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/course/${offer.course.slug}`,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
