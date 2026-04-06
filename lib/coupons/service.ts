/**
 * Coupon validation & redemption service.
 *
 * SCP-equivalent logic:
 * - Coupon codes have an offerId (offer-scoped), optional expiry, and optional maxUses cap
 * - validateCoupon checks all constraints and returns the discount amount
 * - redeemCoupon increments usedCount atomically — called inside completeOrder
 */
import { db } from "@/lib/db";
import type { Decimal } from "@prisma/client/runtime/library";

export type CouponValidationResult =
  | { valid: true; coupon: { id: string; code: string; discountPercent: Decimal }; discountedAmount: number }
  | { valid: false; error: string };

/**
 * Validates a coupon code for an offer and price.
 * Returns the discounted price in the same unit as `originalAmountCents`.
 */
export async function validateCoupon(
  code: string,
  offerId: string,
  originalAmountCents: number
): Promise<CouponValidationResult> {
  const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });

  if (!coupon) return { valid: false, error: "Coupon code not found." };
  if (coupon.offerId !== offerId) return { valid: false, error: "Coupon is not valid for this offer." };

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, error: "This coupon has expired." };
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "This coupon has reached its usage limit." };
  }

  const discountMultiplier = 1 - Number(coupon.discountPercent) / 100;
  const discountedAmount = Math.round(originalAmountCents * discountMultiplier);

  return { valid: true, coupon, discountedAmount };
}

/**
 * Increments the usedCount for a coupon after a successful purchase.
 * Should be called inside the completeOrder transaction.
 */
export async function redeemCoupon(couponId: string): Promise<void> {
  await db.coupon.update({
    where: { id: couponId },
    data: { usedCount: { increment: 1 } },
  });
}
