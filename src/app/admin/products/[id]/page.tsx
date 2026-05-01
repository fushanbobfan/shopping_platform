import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { t } from "@/lib/i18n";

export default async function EditProductPage({
  params
}: {
  params: { id: string };
}) {
  await requireAdmin();
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { order: "asc" } } }
  });
  if (!product) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">{t.admin.products.edit}</h1>
      <ProductForm
        initial={{
          id: product.id,
          name: product.name,
          description: product.description,
          priceCents: product.priceCents,
          size: product.size ?? "",
          category: product.category ?? "",
          condition: product.condition ?? "",
          status: product.status,
          images: product.images.map((i) => i.url)
        }}
      />
    </div>
  );
}
