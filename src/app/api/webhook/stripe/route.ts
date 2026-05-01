import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "no-sig" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("webhook verify failed", err);
    return NextResponse.json({ error: "bad-signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCompleted(event.data.object as Stripe.Checkout.Session);
    } else if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      await handleExpired(event.data.object as Stripe.Checkout.Session);
    }
  } catch (err) {
    console.error("webhook handler error", err);
    return NextResponse.json({ error: "handler-failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCompleted(session: Stripe.Checkout.Session) {
  const productIds = (session.metadata?.productIds ?? "")
    .split(",")
    .filter(Boolean);
  if (productIds.length === 0) return;

  const existing = await prisma.order.findUnique({
    where: { stripeSessionId: session.id }
  });
  if (existing && existing.status !== "PENDING") {
    return; // idempotent — already processed
  }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  });
  const ship = session.shipping_details?.address;
  const customer = session.customer_details;

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.upsert({
      where: { stripeSessionId: session.id },
      update: {
        status: "PAID",
        paidAt: new Date(),
        buyerEmail: customer?.email ?? null,
        buyerName:
          session.shipping_details?.name ?? customer?.name ?? null,
        shippingLine1: ship?.line1 ?? null,
        shippingLine2: ship?.line2 ?? null,
        shippingCity: ship?.city ?? null,
        shippingState: ship?.state ?? null,
        shippingPostal: ship?.postal_code ?? null,
        shippingCountry: ship?.country ?? null,
        totalCents: session.amount_total ?? 0,
        currency: session.currency ?? "usd"
      },
      create: {
        stripeSessionId: session.id,
        status: "PAID",
        paidAt: new Date(),
        buyerEmail: customer?.email ?? null,
        buyerName:
          session.shipping_details?.name ?? customer?.name ?? null,
        shippingLine1: ship?.line1 ?? null,
        shippingLine2: ship?.line2 ?? null,
        shippingCity: ship?.city ?? null,
        shippingState: ship?.state ?? null,
        shippingPostal: ship?.postal_code ?? null,
        shippingCountry: ship?.country ?? null,
        totalCents: session.amount_total ?? 0,
        currency: session.currency ?? "usd"
      }
    });

    // Replace items (idempotent)
    await tx.orderItem.deleteMany({ where: { orderId: order.id } });
    await tx.orderItem.createMany({
      data: products.map((p) => ({
        orderId: order.id,
        productId: p.id,
        priceAtPurchase: p.priceCents,
        quantity: 1
      }))
    });

    await tx.product.updateMany({
      where: { id: { in: productIds } },
      data: { status: "SOLD", reservedUntil: null }
    });
  });
}

async function handleExpired(session: Stripe.Checkout.Session) {
  const productIds = (session.metadata?.productIds ?? "")
    .split(",")
    .filter(Boolean);
  if (productIds.length === 0) return;

  await prisma.product.updateMany({
    where: { id: { in: productIds }, status: "RESERVED" },
    data: { status: "AVAILABLE", reservedUntil: null }
  });
}
