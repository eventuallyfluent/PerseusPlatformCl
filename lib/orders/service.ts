import { db } from "@/lib/db";

export type CreateOrderInput = {
  userId: string;
  offerId: string;
  priceId: string;
  couponId?: string;
  totalAmount: number;
  currency: string;
};

export type CompleteOrderInput = {
  gatewayId: string;
  gatewayPaymentId: string;
  amount: number;
  currency: string;
  rawEvent?: unknown;
};

/**
 * Creates a PENDING order. Called before the user is sent to checkout.
 */
export async function createOrder(data: CreateOrderInput) {
  return db.order.create({
    data: {
      userId: data.userId,
      offerId: data.offerId,
      priceId: data.priceId,
      couponId: data.couponId ?? null,
      totalAmount: data.totalAmount,
      currency: data.currency,
      status: "PENDING",
    },
  });
}

/**
 * Completes an order after successful payment:
 * 1. Marks Order as COMPLETED
 * 2. Upserts a Payment record (SUCCEEDED)
 * 3. Upserts an Enrollment for the buyer
 */
export async function completeOrder(
  orderId: string,
  details: CompleteOrderInput
) {
  // Load order to get userId and courseId via offer
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { offer: { select: { courseId: true } } },
  });

  if (!order) throw new Error(`Order not found: ${orderId}`);
  if (order.status === "COMPLETED") return order; // Idempotent

  const courseId = order.offer.courseId;

  await db.$transaction(async (tx) => {
    // 1. Update order status
    await tx.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
    });

    // 2. Upsert Payment
    await tx.payment.upsert({
      where: { orderId },
      update: {
        status: "SUCCEEDED",
        rawEvent: details.rawEvent ? (details.rawEvent as object) : undefined,
      },
      create: {
        orderId,
        gatewayId: details.gatewayId,
        gatewayPaymentId: details.gatewayPaymentId,
        status: "SUCCEEDED",
        amount: details.amount / 100, // Convert cents to decimal
        currency: details.currency,
        rawEvent: details.rawEvent ? (details.rawEvent as object) : undefined,
      },
    });

    // 3. Upsert Enrollment
    await tx.enrollment.upsert({
      where: { userId_courseId: { userId: order.userId, courseId } },
      update: { enrolledAt: new Date() },
      create: {
        userId: order.userId,
        courseId,
        orderId,
      },
    });
  });

  return db.order.findUnique({ where: { id: orderId } });
}

/**
 * Marks an order and its payment as FAILED.
 */
export async function failOrder(orderId: string) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "PENDING") return;

  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { status: "FAILED" } }),
    db.payment.updateMany({
      where: { orderId },
      data: { status: "FAILED" },
    }),
  ]);
}

/**
 * Marks an order and its payment as REFUNDED.
 */
export async function refundOrder(orderId: string) {
  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { status: "REFUNDED" } }),
    db.payment.updateMany({
      where: { orderId },
      data: { status: "REFUNDED" },
    }),
  ]);
}
