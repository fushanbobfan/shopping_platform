import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { ClearCartOnMount } from "@/components/storefront/ClearCartOnMount";
import { prisma } from "@/lib/db";
import { fulfillCheckoutSession } from "@/lib/fulfillment";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  let order: Awaited<ReturnType<typeof prisma.order.findUnique>> = null;

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== "unpaid") {
        await fulfillCheckoutSession(session);
      }
      order = await prisma.order.findUnique({ where: { stripeSessionId: sessionId } });
    } catch (error) {
      console.error("Could not confirm checkout return", error);
    }
  }

  const confirmed = order?.status === "PAID" || order?.status === "SHIPPED";

  return (
    <div className="page-shell flex min-h-[72svh] items-center justify-center py-16">
      <ClearCartOnMount enabled={confirmed} />
      <div className="max-w-2xl text-center">
        <span className={`mx-auto grid size-14 place-items-center rounded-full ${confirmed ? "bg-[var(--success)] text-white" : "bg-[var(--paper-deep)]"}`}>
          {confirmed ? <Check size={24} /> : <span className="font-editorial text-2xl">…</span>}
        </span>
        <p className="eyebrow mt-8 text-[var(--accent)]">{confirmed ? "Order confirmed" : "Payment received"}</p>
        <h1 className="font-editorial mt-4 text-6xl leading-[0.94] sm:text-8xl">
          {confirmed ? "It’s yours now." : "We’re confirming your order."}
        </h1>
        {order ? (
          <p className="mt-6 text-sm text-[var(--muted)]">
            Order <span className="font-mono font-semibold text-[var(--ink)]">{order.publicId}</span>
          </p>
        ) : null}
        <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-[var(--muted)]">
          {confirmed
            ? "Stripe will email your receipt. Mike will pack the piece and follow up with shipping details."
            : "This can take a few seconds. Your payment is safe; do not submit it again. Stripe will email your receipt once confirmed."}
        </p>
        <Link href="/" className="button-primary mt-9">
          Return to the archive <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
