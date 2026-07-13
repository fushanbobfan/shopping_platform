"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { matchesCatalogQuery } from "@/lib/catalog-search";
import { ProductGrid } from "./ProductGrid";
import type { ProductCardData } from "./ProductCard";

export function CollectionBrowser({ products }: { products: ProductCardData[] }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const categories = useMemo(
    () => [
      "All",
      ...new Set(
        products.flatMap((product) =>
          product.category ? [product.category] : []
        )
      )
    ],
    [products]
  );
  const visible = useMemo(
    () =>
      products.filter(
        (product) =>
          (category === "All" || product.category === category) &&
          matchesCatalogQuery(product, query)
      ),
    [category, products, query]
  );

  if (products.length === 0) {
    return (
      <div className="border-b hairline py-24 text-center">
        <p className="font-editorial text-4xl">The rack is between drops.</p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Check back for the next release.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-9 border-b hairline pb-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            aria-label="Filter by category"
          >
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
          <label className="relative block w-full md:w-72">
            <span className="sr-only">Search the collection</span>
            <Search
              aria-hidden="true"
              size={16}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search pieces"
              className="w-full border-b hairline bg-transparent py-2.5 pl-7 pr-8 text-sm outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--ink)]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X size={15} />
              </button>
            ) : null}
          </label>
        </div>
        <p
          className="mt-4 text-xs text-[var(--muted)]"
          role="status"
          aria-live="polite"
        >
          {visible.length} {visible.length === 1 ? "piece" : "pieces"}
          {query.trim() ? ` matching “${query.trim()}”` : " available"}
        </p>
      </div>
      {visible.length > 0 ? (
        <ProductGrid products={visible} />
      ) : (
        <div className="border-b hairline py-20 text-center">
          <p className="font-editorial text-4xl">Nothing on this rack matches.</p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Try another keyword or clear the current category.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory("All");
              setQuery("");
            }}
            className="mt-6 text-xs font-bold uppercase tracking-[0.13em] underline underline-offset-4"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
