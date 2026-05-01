import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { t } from "@/lib/i18n";
import { ClearCartOnMount } from "@/components/storefront/ClearCartOnMount";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  let orderId: string | null = null;
  if (sessionId) {
    try {
      await stripe.checkout.sessions.retrieve(sessionId);
      const order = await prisma.order.findUnique({
        where: { stripeSessionId: sessionId }
      });
      orderId = order?.id ?? null;
    } catch {
      // ignore — webhook may not have arrived yet
    }
  }

  return (
    <div className="py-20 text-center max-w-md mx-auto space-y-4">
      <ClearCartOnMount />
      <h1 className="text-2xl font-semibold text-brand-700">
        {t.success.title}
      </h1>
      {orderId && (
        <p className="text-sm text-neutral-600">
          {t.success.orderId}: <span className="font-mono">{orderId}</span>
        </p>
      )}
      <p className="text-neutral-600">{t.success.next}</p>
      <Link
        href="/"
        className="inline-block mt-4 px-6 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700"
      >
        {t.success.backHome}
      </Link>
    </div>
  );
}
