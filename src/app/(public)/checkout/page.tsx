"use client";

import { useCart } from "@/lib/cart-store";
import { formatMoney } from "@/lib/money";
import { t } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    if (typeof window !== "undefined") router.replace("/cart");
    return null;
  }

  const total = items.reduce((sum, i) => sum + i.priceCents, 0);
  const currency =
    (process.env.NEXT_PUBLIC_CURRENCY as string | undefined) ?? "usd";

  async function pay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId }))
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error === "sold" ? t.checkout.sold : t.checkout.error);
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError(t.checkout.error);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">{t.checkout.title}</h1>
      <p className="text-sm text-neutral-600">{t.checkout.review}</p>

      <ul className="bg-white rounded-xl divide-y divide-brand-200">
        {items.map((i) => (
          <li
            key={i.productId}
            className="flex items-center justify-between p-3 text-sm"
          >
            <span className="truncate pr-2">{i.name}</span>
            <span className="text-brand-700 font-medium">
              {formatMoney(i.priceCents, currency)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between bg-white rounded-xl p-4">
        <span className="text-neutral-600">{t.cart.total}</span>
        <span className="text-2xl font-bold text-brand-700">
          {formatMoney(total, currency)}
        </span>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <button
        onClick={pay}
        disabled={loading}
        className="w-full py-3 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? t.checkout.creating : t.checkout.pay}
      </button>
    </div>
  );
}
