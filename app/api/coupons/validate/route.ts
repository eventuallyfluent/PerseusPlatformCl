import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validateCoupon } from "@/lib/coupons/service";

export const dynamic = "force-dynamic";

// GET /api/coupons/validate?code=SAVE20&offerId=xxx&amount=4999
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const offerId = searchParams.get("offerId");
  const amount = parseInt(searchParams.get("amount") ?? "0", 10);

  if (!code || !offerId || !amount) {
    return NextResponse.json({ error: "code, offerId, and amount are required" }, { status: 400 });
  }

  const result = await validateCoupon(code, offerId, amount);
  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.error }, { status: 200 });
  }

  return NextResponse.json({
    valid: true,
    couponId: result.coupon.id,
    discountPercent: Number(result.coupon.discountPercent),
    discountedAmount: result.discountedAmount,
  });
}
