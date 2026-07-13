import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  expireCheckoutSession,
  fulfillCheckoutSession
} from "@/lib/fulfillment";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: "missing-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      secret
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "invalid-signature" }, { status: 400 });
  }

  try {
    const eventRecord = { id: event.id, type: event.type };
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await fulfillCheckoutSession(
        event.data.object as Stripe.Checkout.Session,
        eventRecord
      );
    } else if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      await expireCheckoutSession(
        event.data.object as Stripe.Checkout.Session,
        eventRecord
      );
    }
  } catch (error) {
    console.error("Stripe webhook processing failed", error);
    return NextResponse.json({ error: "processing-failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
