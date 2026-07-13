"use client";

import { ArrowRight, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/lib/cart-store";

export function AddToCartButton({
  product,
  unavailable
}: {
  product: CartItem;
  unavailable: boolean;
}) {
  const router = useRouter();
  const add = useCart((state) => state.add);
  const alreadyInBag = useCart((state) => state.has(product.productId));

  if (unavailable) {
    return (
      <button type="button" disabled className="button-primary w-full">
        This piece is no longer available
      </button>
    );
  }

  return (
    <button
      type="button"
      className="button-primary w-full"
      onClick={() => {
        if (alreadyInBag) {
          router.push("/bag");
          return;
        }
        add(product);
        router.push("/bag");
      }}
    >
      {alreadyInBag ? (
        <>
          View in bag <ArrowRight size={16} />
        </>
      ) : (
        <>
          Add to bag <ShoppingBag size={16} />
        </>
      )}
    </button>
  );
}
