"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole, X } from "lucide-react";
import { useCart, useClientHydrated } from "@/lib/cart-store";
import { formatMoney } from "@/lib/money";
import { siteConfig } from "@/lib/site";

export default function BagPage() {
  const items = useCart((state) => state.items);
  const remove = useCart((state) => state.remove);
  const hydrated = useClientHydrated();

  if (!hydrated) {
    return <div className="page-shell min-h-[55svh] py-16" aria-busy="true" />;
  }

  if (items.length === 0) {
    return (
      <div className="page-shell flex min-h-[65svh] flex-col items-center justify-center py-16 text-center">
        <p className="eyebrow text-[var(--accent)]">Your bag</p>
        <h1 className="font-editorial mt-4 text-6xl sm:text-8xl">Still room for one.</h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-[var(--muted)]">
          Nothing is held until checkout begins, so take another look at the current edit.
        </p>
        <Link href="/#collection" className="button-primary mt-8">
          Shop the archive <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const total = items.reduce((sum, item) => sum + item.priceCents, 0);
  const checkoutTotal = total + siteConfig.shippingCents;
  const currency = items[0].currency;

  return (
    <div className="page-shell py-10 sm:py-16">
      <Link
        href="/#collection"
        className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] hover:text-[var(--accent)]"
      >
        <ArrowLeft size={14} /> Keep browsing
      </Link>
      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-20">
        <section>
          <div className="flex items-end justify-between border-b hairline pb-5">
            <h1 className="font-editorial text-6xl sm:text-7xl">Your bag</h1>
            <p className="eyebrow text-[var(--muted)]">{items.length} {items.length === 1 ? "piece" : "pieces"}</p>
          </div>
          <ul>
            {items.map((item) => (
              <li key={item.productId} className="grid grid-cols-[7rem_1fr_auto] gap-4 border-b hairline py-5 sm:grid-cols-[9rem_1fr_auto] sm:gap-6">
                <Link href={`/pieces/${item.slug}`} className="relative aspect-[4/5] overflow-hidden bg-[var(--paper-deep)]">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill sizes="144px" className="object-cover" />
                  ) : null}
                </Link>
                <div className="py-1">
                  <Link href={`/pieces/${item.slug}`} className="font-semibold hover:text-[var(--accent)]">
                    {item.name}
                  </Link>
                  {item.size ? <p className="mt-2 text-sm text-[var(--muted)]">Size {item.size}</p> : null}
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">One of one</p>
                </div>
                <div className="flex flex-col items-end justify-between py-1">
                  <p className="font-semibold">{formatMoney(item.priceCents, item.currency)}</p>
                  <button
                    type="button"
                    onClick={() => remove(item.productId)}
                    className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--accent)]"
                    aria-label={`Remove ${item.name} from bag`}
                  >
                    <X size={13} /> Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow text-[var(--accent)]">Order summary</p>
          <div className="mt-5 border-y hairline py-5 text-sm">
            <div className="flex justify-between"><span>Pieces</span><span>{formatMoney(total, currency)}</span></div>
            <div className="mt-3 flex justify-between text-[var(--muted)]"><span>Shipping</span><span>{siteConfig.shippingCents === 0 ? "Complimentary" : formatMoney(siteConfig.shippingCents, currency)}</span></div>
          </div>
          <div className="flex items-end justify-between py-6">
            <span className="font-editorial text-2xl">Total</span>
            <span className="text-2xl font-bold">{formatMoney(checkoutTotal, currency)}</span>
          </div>
          <Link href="/checkout" className="button-primary w-full">
            Continue to checkout <ArrowRight size={16} />
          </Link>
          <p className="mt-4 flex gap-2 text-xs leading-5 text-[var(--muted)]">
            <LockKeyhole size={14} className="mt-0.5 shrink-0" />
            Availability and prices are verified again before Stripe opens. Starting checkout holds these pieces for 30 minutes.
          </p>
        </aside>
      </div>
    </div>
  );
}
