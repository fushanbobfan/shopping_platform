import { prisma } from "@/lib/db";
import { t } from "@/lib/i18n";
import { ProductGrid } from "@/components/storefront/ProductGrid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const now = new Date();
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { status: "AVAILABLE" },
        { status: "RESERVED", reservedUntil: { lt: now } }
      ]
    },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" }
  });

  if (products.length === 0) {
    return (
      <div className="py-20 text-center text-neutral-500">{t.home.empty}</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6 text-brand-700">
        {t.tagline}
      </h1>
      <ProductGrid products={products} />
    </div>
  );
}
