"use client";

import { useMemo, useState } from "react";
import { ProductGrid } from "./ProductGrid";
import type { ProductCardData } from "./ProductCard";

export function CollectionBrowser({ products }: { products: ProductCardData[] }) {
  const [category, setCategory] = useState("All");
  const categories = useMemo(
    () => ["All", ...new Set(products.flatMap((product) => (product.category ? [product.category] : [])))],
    [products]
  );
  const visible =
    category === "All"
      ? products
      : products.filter((product) => product.category === category);

  if (products.length === 0) {
    return (
      <div className="border-b hairline py-24 text-center">
        <p className="font-editorial text-4xl">The rack is between drops.</p>
        <p className="mt-3 text-sm text-[var(--muted)]">Check back for the next release.</p>
      </div>
    );
  }

  return (
    <>
      {categories.length > 2 ? (
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2" aria-label="Filter by category">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
              className={`shrink-0 border px-3 py-2 text-[0.66rem] font-bold uppercase tracking-[0.13em] ${
                category === item
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                  : "hairline hover:border-[var(--ink)]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
      <ProductGrid products={visible} />
    </>
  );
}
