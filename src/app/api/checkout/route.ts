import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { stripe, allowedShippingCountries } from "@/lib/stripe";

export const runtime = "nodejs";

const schema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1) }))
    .min(1)
    .max(50)
});

const RESERVATION_MINUTES = 15;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const now = new Date();
  const ids = parsed.data.items.map((i) => i.productId);

  // Load and validate availability
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { images: { orderBy: { order: "asc" }, take: 1 } }
  });
  if (products.length !== ids.length) {
    return NextResponse.json({ error: "sold" }, { status: 409 });
  }
  const unavailable = products.find(
    (p) =>
      p.status === "SOLD" ||
      p.status === "HIDDEN" ||
      (p.status === "RESERVED" &&
        p.reservedUntil &&
        p.reservedUntil > now)
  );
  if (unavailable) {
    return NextResponse.json({ error: "sold" }, { status: 409 });
  }

  const currency = products[0].currency;
  const reservedUntil = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);

  // Reserve atomically: only flip rows still AVAILABLE or expired-RESERVED
  try {
    await prisma.$transaction(async (tx) => {
      for (const p of products) {
        const updated = await tx.product.updateMany({
          where: {
            id: p.id,
            OR: [
              { status: "AVAILABLE" },
              { status: "RESERVED", reservedUntil: { lt: now } }
            ]
          },
          data: { status: "RESERVED", reservedUntil }
        });
        if (updated.count === 0) {
          throw new Error("sold");
        }
      }
    });
  } catch (err) {
    if (err instanceof Error && err.message === "sold") {
      return NextResponse.json({ error: "sold" }, { status: 409 });
    }
    throw err;
  }

  // Build Stripe line items from DB-authoritative prices
  const lineItems = products.map((p) => ({
    price_data: {
      currency,
      unit_amount: p.priceCents,
      product_data: {
        name: p.name,
        description: p.description.slice(0, 200),
        images: p.images[0] ? [p.images[0].url] : undefined,
        metadata: { productId: p.id }
      }
    },
    quantity: 1
  }));

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    req.headers.get("origin") ??
    "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      customer_creation: "always",
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: allowedShippingCountries()
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      metadata: {
        productIds: products.map((p) => p.id).join(",")
      }
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("stripe error", err);
    // Release reservations if Stripe failed
    await prisma.product
      .updateMany({
        where: {
          id: { in: ids },
          status: "RESERVED",
          reservedUntil: { equals: reservedUntil }
        },
        data: { status: "AVAILABLE", reservedUntil: null }
      })
      .catch(() => {});
    return NextResponse.json({ error: "stripe-failed" }, { status: 500 });
  }
}
