import { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";

function orderIdFromSession(session: Stripe.Checkout.Session) {
  return session.metadata?.orderId || session.client_reference_id || null;
}

export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session,
  stripeEvent?: { id: string; type: string }
) {
  const orderId = orderIdFromSession(session);
  if (!orderId || session.payment_status === "unpaid") return null;

  const shipping = session.collected_information?.shipping_details;
  const customer = session.customer_details;

  return prisma.$transaction(
    async (tx) => {
      if (stripeEvent) {
        try {
          await tx.stripeEvent.create({ data: stripeEvent });
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            return tx.order.findUnique({ where: { id: orderId } });
          }
          throw error;
        }
      }

      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });
      if (!order) return null;
      if (["PAID", "SHIPPED", "REFUNDED"].includes(order.status)) return order;

      const sold = await tx.product.updateMany({
        where: {
          id: { in: order.items.map((item) => item.productId) },
          reservedByOrderId: order.id,
          status: "RESERVED"
        },
        data: {
          status: "SOLD",
          reservedUntil: null,
          reservedByOrderId: null
        }
      });

      if (sold.count !== order.items.length) {
        throw new Error(`Inventory mismatch while fulfilling ${order.publicId}`);
      }

      return tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
          stripeSessionId: session.id,
          buyerEmail: customer?.email ?? null,
          buyerName: shipping?.name ?? customer?.name ?? null,
          shippingLine1: shipping?.address?.line1 ?? null,
          shippingLine2: shipping?.address?.line2 ?? null,
          shippingCity: shipping?.address?.city ?? null,
          shippingState: shipping?.address?.state ?? null,
          shippingPostal: shipping?.address?.postal_code ?? null,
          shippingCountry: shipping?.address?.country ?? null,
          totalCents: session.amount_total ?? order.totalCents,
          currency: session.currency ?? order.currency
        }
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
}

export async function expireCheckoutSession(
  session: Stripe.Checkout.Session,
  stripeEvent: { id: string; type: string }
) {
  const orderId = orderIdFromSession(session);
  if (!orderId) return null;

  return prisma.$transaction(async (tx) => {
    try {
      await tx.stripeEvent.create({ data: stripeEvent });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return null;
      }
      throw error;
    }

    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || order.status !== "PENDING") return order;

    await tx.product.updateMany({
      where: { reservedByOrderId: order.id, status: "RESERVED" },
      data: {
        status: "AVAILABLE",
        reservedUntil: null,
        reservedByOrderId: null
      }
    });

    return tx.order.update({
      where: { id: order.id },
      data: { status: "EXPIRED" }
    });
  });
}
