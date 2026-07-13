import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { rejectCrossOrigin } from "@/lib/http";
import {
  checkoutExpiresAt,
  makePublicOrderId,
  reservationExpiresAt,
  uniqueProductIds
} from "@/lib/orders";
import { allowedShippingCountries, stripe } from "@/lib/stripe";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  items: z.array(z.object({ productId: z.string().min(1).max(100) })).min(1).max(20)
});

async function reserveProducts(ids: string[], now: Date) {
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { images: { orderBy: { order: "asc" }, take: 1 } }
  });

  if (
    products.length !== ids.length ||
    products.some((product) => product.status !== "AVAILABLE")
  ) {
    throw new Error("sold");
  }

  const currencies = new Set(products.map((product) => product.currency));
  if (currencies.size !== 1) throw new Error("mixed-currency");

  const subtotalCents = products.reduce(
    (sum, product) => sum + product.priceCents,
    0
  );
  const shippingCents = siteConfig.shippingCents;
  const totalCents = subtotalCents + shippingCents;
  const expiresAt = reservationExpiresAt(now);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const order = await tx.order.create({
            data: {
              publicId: makePublicOrderId(now),
              status: "PENDING",
              shippingCents,
              totalCents,
              currency: products[0].currency,
              expiresAt,
              items: {
                create: products.map((product) => ({
                  productId: product.id,
                  nameAtPurchase: product.name,
                  imageAtPurchase: product.images[0]?.url ?? null,
                  priceAtPurchase: product.priceCents
                }))
              }
            }
          });

          for (const product of products) {
            const reserved = await tx.product.updateMany({
              where: { id: product.id, status: "AVAILABLE" },
              data: {
                status: "RESERVED",
                reservedUntil: expiresAt,
                reservedByOrderId: order.id
              }
            });
            if (reserved.count !== 1) throw new Error("sold");
          }

          return { order, products };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034" &&
        attempt < 2
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("reservation-failed");
}

async function cancelReservation(orderId: string) {
  await prisma.$transaction([
    prisma.product.updateMany({
      where: { reservedByOrderId: orderId, status: "RESERVED" },
      data: {
        status: "AVAILABLE",
        reservedUntil: null,
        reservedByOrderId: null
      }
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" }
    })
  ]);
}

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const ids = uniqueProductIds(parsed.data.items.map((item) => item.productId));
  if (ids.length !== parsed.data.items.length) {
    return NextResponse.json({ error: "duplicate" }, { status: 400 });
  }

  let reservation: Awaited<ReturnType<typeof reserveProducts>>;
  const now = new Date();
  try {
    reservation = await reserveProducts(ids, now);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "reservation-failed";
    const status = reason === "sold" ? 409 : 500;
    return NextResponse.json({ error: reason }, { status });
  }

  const baseUrl = process.env.APP_URL || new URL(request.url).origin;
  const lineItems = reservation.products.map((product) => ({
    price_data: {
      currency: product.currency,
      unit_amount: product.priceCents,
      product_data: {
        name: product.name,
        description: product.description.slice(0, 200),
        images: product.images[0] ? [product.images[0].url] : undefined,
        metadata: { productId: product.id }
      }
    },
    quantity: 1
  }));

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card"],
        line_items: lineItems,
        client_reference_id: reservation.order.id,
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/bag`,
        customer_creation: "always",
        billing_address_collection: "auto",
        shipping_address_collection: {
          allowed_countries: allowedShippingCountries()
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: {
                amount: siteConfig.shippingCents,
                currency: reservation.order.currency
              },
              display_name:
                siteConfig.shippingCents === 0
                  ? "Complimentary shipping"
                  : "Standard shipping",
              delivery_estimate: {
                minimum: { unit: "business_day", value: 2 },
                maximum: { unit: "business_day", value: 5 }
              }
            }
          }
        ],
        expires_at: Math.floor(checkoutExpiresAt(now).getTime() / 1000),
        metadata: { orderId: reservation.order.id },
        custom_text: {
          submit: {
            message: "Each piece is one of one. Your order is confirmed after payment."
          }
        }
      },
      { idempotencyKey: reservation.order.id }
    );

    if (!session.url) throw new Error("missing-checkout-url");

    await prisma.order.update({
      where: { id: reservation.order.id },
      data: { stripeSessionId: session.id }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout creation failed", error);
    await cancelReservation(reservation.order.id).catch((releaseError) =>
      console.error("Reservation cleanup failed", releaseError)
    );
    return NextResponse.json({ error: "stripe-failed" }, { status: 502 });
  }
}
