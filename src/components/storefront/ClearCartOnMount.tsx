"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";

export function ClearCartOnMount({ enabled = true }: { enabled?: boolean }) {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    if (enabled) clear();
  }, [clear, enabled]);
  return null;
}
