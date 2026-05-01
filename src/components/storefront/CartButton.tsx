"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { t } from "@/lib/i18n";
import { useEffect, useState } from "react";

export function CartButton() {
  const count = useCart((s) => s.items.length);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Link
      href="/cart"
      className="relative px-3 py-1.5 rounded-full bg-brand-600 text-white text-xs hover:bg-brand-700"
    >
      {t.nav.cart}
      {mounted && count > 0 && (
        <span className="ml-1 inline-flex items-center justify-center min-w-4 h-4 text-[10px] rounded-full bg-white text-brand-700 px-1">
          {count}
        </span>
      )}
    </Link>
  );
}
