"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-store";
import { formatMoney } from "@/lib/money";
import { t } from "@/lib/i18n";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, remove } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-neutral-500">{t.cart.empty}</p>
        <Link href="/" className="text-brand-600 hover:underline">
          {t.cart.continueShopping}
        </Link>
      </div>
    );
  }

  const total = items.reduce((sum, i) => sum + i.priceCents, 0);
  const currency =
    (process.env.NEXT_PUBLIC_CURRENCY as string | undefined) ?? "usd";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">{t.cart.title}</h1>
      <ul className="divide-y divide-brand-200 bg-white rounded-xl">
        {items.map((item) => (
          <li key={item.productId} className="flex gap-3 p-3 items-center">
            <div className="relative w-16 h-20 bg-brand-100 rounded overflow-hidden shrink-0">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${item.productId}`}
                className="text-sm truncate block hover:text-brand-600"
              >
                {item.name}
              </Link>
              <div className="text-brand-700 text-sm font-medium mt-1">
                {formatMoney(item.priceCents, currency)}
              </div>
            </div>
            <button
              onClick={() => remove(item.productId)}
              className="text-xs text-neutral-500 hover:text-red-600"
            >
              {t.cart.remove}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between bg-white rounded-xl p-4">
        <span className="text-neutral-600">{t.cart.total}</span>
        <span className="text-2xl font-bold text-brand-700">
          {formatMoney(total, currency)}
        </span>
      </div>
      <Link
        href="/checkout"
        className="mt-4 block w-full py-3 rounded-lg bg-brand-600 text-white text-center font-medium hover:bg-brand-700"
      >
        {t.cart.checkout}
      </Link>
    </div>
  );
}
