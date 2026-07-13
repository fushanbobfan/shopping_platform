"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, useClientHydrated } from "@/lib/cart-store";
import { formatMoney } from "@/lib/money";
import { siteConfig } from "@/lib/site";

const errorMessages: Record<string, string> = {
  sold: "One of these pieces was just reserved or sold. Return to your bag and refresh the item before trying again.",
  duplicate: "Your bag contains a duplicate item. Remove it and try again.",
  "mixed-currency": "These items cannot be checked out together.",
  "stripe-failed": "Stripe could not open checkout. Your pieces were released; please try again."
};

export default function CheckoutPage() {
  const items = useCart((state) => state.items);
  const router = useRouter();
  const hydrated = useClientHydrated();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (hydrated && items.length === 0) router.replace("/bag");
  }, [hydrated, items.length, router]);

  if (!hydrated || items.length === 0) {
    return <div className="page-shell min-h-[60svh] py-16" aria-busy="true" />;
  }

  const total = items.reduce((sum, item) => sum + item.priceCents, 0);
  const checkoutTotal = total + siteConfig.shippingCents;
  const currency = items[0].currency;

  async function beginCheckout() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.productId }))
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.url) {
        setError(errorMessages[data.error] || "Checkout could not be started. Please try again.");
        setLoading(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Checkout could not be started. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="page-shell py-10 sm:py-16">
      <Link href="/bag" className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] hover:text-[var(--accent)]">
        <ArrowLeft size={14} /> Back to bag
      </Link>
      <div className="mx-auto mt-10 max-w-3xl">
        <p className="eyebrow text-[var(--accent)]">Final review</p>
        <h1 className="font-editorial mt-4 text-6xl sm:text-8xl">Ready when you are.</h1>
        <p className="mt-5 max-w-xl text-sm leading-6 text-[var(--muted)]">
          Stripe will collect payment and your shipping address on the next screen. The server—not your browser—sets the final price.
        </p>

        <ul className="mt-10 border-t hairline">
          {items.map((item) => (
            <li key={item.productId} className="grid grid-cols-[4rem_1fr_auto] items-center gap-4 border-b hairline py-4">
              <div className="relative aspect-[4/5] overflow-hidden bg-[var(--paper-deep)]">
                {item.image ? <Image src={item.image} alt="" fill sizes="64px" className="object-cover" /> : null}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{item.name}</p>
                {item.size ? <p className="mt-1 text-xs text-[var(--muted)]">Size {item.size}</p> : null}
              </div>
              <p className="font-semibold">{formatMoney(item.priceCents, item.currency)}</p>
            </li>
          ))}
        </ul>

        <div className="border-b hairline py-6 text-sm">
          <div className="flex justify-between"><span>Pieces</span><span>{formatMoney(total, currency)}</span></div>
          <div className="mt-3 flex justify-between text-[var(--muted)]"><span>Shipping</span><span>{siteConfig.shippingCents === 0 ? "Complimentary" : formatMoney(siteConfig.shippingCents, currency)}</span></div>
        </div>
        <div className="flex items-end justify-between py-7">
          <p className="font-editorial text-2xl">Total</p>
          <p className="text-3xl font-bold">{formatMoney(checkoutTotal, currency)}</p>
        </div>

        {error ? <div role="alert" className="mb-4 border border-[#b63e28] bg-[#f5ded7] p-4 text-sm leading-6 text-[#792615]">{error}</div> : null}

        <button type="button" onClick={beginCheckout} disabled={loading} className="button-primary w-full">
          {loading ? "Reserving your pieces…" : <>Open secure checkout <ArrowRight size={16} /></>}
        </button>
        <p className="mt-4 flex justify-center gap-2 text-center text-xs text-[var(--muted)]">
          <LockKeyhole size={14} /> Payment details never touch this website.
        </p>
      </div>
    </div>
  );
}
