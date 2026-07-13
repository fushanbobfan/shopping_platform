import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function EditProductPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } }
  });
  if (!product) notFound();

  const measurements =
    product.measurements &&
    typeof product.measurements === "object" &&
    !Array.isArray(product.measurements)
      ? (product.measurements as Record<string, string>)
      : {};

  return (
    <div>
      <div className="mb-8 border-b border-black/15 pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Inventory</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em]">Edit piece</h1>
        <p className="mt-2 text-sm text-black/50">{product.name} · Last updated {product.updatedAt.toLocaleDateString("en-US")}</p>
      </div>
      <ProductForm
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          brand: product.brand ?? "",
          description: product.description,
          story: product.story ?? "",
          priceCents: product.priceCents,
          compareAtCents: product.compareAtCents,
          size: product.size ?? "",
          category: product.category ?? "",
          condition: product.condition ?? "",
          color: product.color ?? "",
          material: product.material ?? "",
          measurements,
          featured: product.featured,
          status: product.status,
          images: product.images.map((image) => image.url)
        }}
      />
    </div>
  );
}
