import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { t } from "@/lib/i18n";
import { ImageCarousel } from "@/components/storefront/ImageCarousel";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { order: "asc" } } }
  });

  if (!product || product.status === "HIDDEN") {
    notFound();
  }

  const now = new Date();
  const soldOut =
    product.status === "SOLD" ||
    (product.status === "RESERVED" &&
      product.reservedUntil &&
      product.reservedUntil > now);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <ImageCarousel
        images={product.images.map((i) => i.url)}
        alt={product.name}
      />
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <div className="text-3xl text-brand-700 font-bold">
          {formatMoney(product.priceCents, product.currency)}
        </div>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          {product.size && (
            <>
              <dt className="text-neutral-500">{t.product.size}</dt>
              <dd>{product.size}</dd>
            </>
          )}
          {product.category && (
            <>
              <dt className="text-neutral-500">{t.product.category}</dt>
              <dd>{product.category}</dd>
            </>
          )}
          {product.condition && (
            <>
              <dt className="text-neutral-500">{t.product.condition}</dt>
              <dd>{product.condition}</dd>
            </>
          )}
        </dl>
        <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
          {product.description}
        </p>
        <AddToCartButton
          product={{
            id: product.id,
            name: product.name,
            priceCents: product.priceCents,
            image: product.images[0]?.url
          }}
          soldOut={Boolean(soldOut)}
        />
      </div>
    </div>
  );
}
