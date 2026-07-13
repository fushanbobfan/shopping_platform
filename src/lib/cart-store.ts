"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSyncExternalStore } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  size?: string;
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
      add: (item) =>
        set((state) =>
          state.items.some((existing) => existing.productId === item.productId)
            ? state
            : { items: [...state.items, item] }
        ),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId)
        })),
      clear: () => set({ items: [] }),
      has: (productId) =>
        get().items.some((item) => item.productId === productId)
    }),
    {
      name: "mike-archive-bag",
      version: 2,
      partialize: (state) => ({ items: state.items })
    }
  )
);

const subscribeToNothing = () => () => undefined;

export function useClientHydrated() {
  return useSyncExternalStore(subscribeToNothing, () => true, () => false);
}
