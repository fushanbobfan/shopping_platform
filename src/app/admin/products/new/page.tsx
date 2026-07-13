import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/auth";

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <div>
      <div className="mb-8 border-b border-black/15 pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Inventory</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em]">Add a piece</h1>
        <p className="mt-2 text-sm text-black/50">Create a draft or publish it directly to the store.</p>
      </div>
      <ProductForm />
    </div>
  );
}
