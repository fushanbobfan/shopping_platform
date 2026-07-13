"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";

export function CartButton() {
  const count = useCart((state) => state.items.length);

  return (
    <Link href="/bag" className="group flex items-center gap-2 hover:text-[var(--accent)]">
      <ShoppingBag size={16} strokeWidth={1.8} aria-hidden="true" />
      <span>Bag</span>
      <span
        className="inline-flex min-w-5 items-center justify-center border hairline px-1 py-0.5 text-[0.6rem] group-hover:border-[var(--accent)]"
        aria-label={`${count} items in bag`}
        suppressHydrationWarning
      >
        {count}
      </span>
    </Link>
  );
}
