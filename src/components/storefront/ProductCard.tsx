import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  priceCents: number;
  currency: string;
  size: string | null;
  category: string | null;
  condition: string | null;
  image: string | null;
  searchText: string;
};

export function ProductCard({
  product,
  priority = false
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  return (
    <Link href={`/pieces/${product.slug}`} className="group block focus-visible:outline-offset-4">
      <div className="product-media relative aspect-[4/5] overflow-hidden bg-[var(--paper-deep)]">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Photograph coming soon
          </div>
        )}
        <span className="absolute left-3 top-3 bg-[var(--paper)] px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.13em]">
          One of one
        </span>
      </div>
      <div className="border-b hairline py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[var(--muted)]">
              {product.brand || product.category || "From the archive"}
            </p>
            <h3 className="mt-1 truncate text-sm font-semibold sm:text-base">
              {product.name}
            </h3>
          </div>
          <p className="shrink-0 text-sm font-semibold">
            {formatMoney(product.priceCents, product.currency)}
          </p>
        </div>
        <div className="mt-2 flex gap-2 text-xs text-[var(--muted)]">
          {product.size ? <span>{product.size}</span> : null}
          {product.size && product.condition ? <span>·</span> : null}
          {product.condition ? <span>{product.condition}</span> : null}
        </div>
      </div>
    </Link>
  );
}
