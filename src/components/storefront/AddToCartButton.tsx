"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { t } from "@/lib/i18n";
import { useEffect, useState } from "react";

type Props = {
  product: { id: string; name: string; priceCents: number; image?: string };
  soldOut: boolean;
};

export function AddToCartButton({ product, soldOut }: Props) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const has = useCart((s) => s.has);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (soldOut) {
    return (
      <button
        disabled
        className="w-full py-3 rounded-lg bg-neutral-200 text-neutral-500 cursor-not-allowed"
      >
        {t.product.sold}
      </button>
    );
  }

  const already = mounted && has(product.id);

  return (
    <button
      onClick={() => {
        if (already) {
          router.push("/cart");
          return;
        }
        add({
          productId: product.id,
          name: product.name,
          priceCents: product.priceCents,
          image: product.image
        });
        router.push("/cart");
      }}
      className="w-full py-3 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700"
    >
      {already ? t.product.inCart : t.product.addToCart}
    </button>
  );
}
