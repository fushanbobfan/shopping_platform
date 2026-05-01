import Link from "next/link";
import Image from "next/image";
import { formatMoney } from "@/lib/money";

type Props = {
  product: {
    id: string;
    name: string;
    priceCents: number;
    currency: string;
    size: string | null;
    images: { url: string }[];
  };
};

export function ProductCard({ product }: Props) {
  const image = product.images[0]?.url;
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-[4/5] bg-brand-100">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-[1.02] transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            无图
          </div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <div className="text-sm truncate">{product.name}</div>
        <div className="flex items-baseline justify-between">
          <span className="text-brand-700 font-semibold">
            {formatMoney(product.priceCents, product.currency)}
          </span>
          {product.size && (
            <span className="text-xs text-neutral-500">{product.size}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
