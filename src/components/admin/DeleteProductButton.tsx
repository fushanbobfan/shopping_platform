"use client";

import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();

  async function del() {
    if (!confirm(t.admin.products.confirmDelete)) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <button onClick={del} className="text-red-600 hover:underline">
      {t.admin.products.delete}
    </button>
  );
}
