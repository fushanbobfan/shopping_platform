import { ProductCard } from "./ProductCard";

type ProductWithImage = {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  size: string | null;
  images: { url: string }[];
};

export function ProductGrid({ products }: { products: ProductWithImage[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
