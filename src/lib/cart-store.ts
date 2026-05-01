"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  name: string;
  priceCents: number;
  image?: string;
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (productId: string) => void;
  clear: () => void;
  has: (productId: string) => boolean;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        if (get().items.find((i) => i.productId === item.productId)) return;
        set({ items: [...get().items, item] });
      },
      remove: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      clear: () => set({ items: [] }),
      has: (productId) => !!get().items.find((i) => i.productId === productId)
    }),
    { name: "shop-cart" }
  )
);
