import { requireAdmin } from "@/lib/auth";
import { ProductForm } from "@/components/admin/ProductForm";
import { t } from "@/lib/i18n";

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">{t.admin.products.new}</h1>
      <ProductForm />
    </div>
  );
}
