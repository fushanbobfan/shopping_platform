import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { t } from "@/lib/i18n";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  AVAILABLE: "在售",
  RESERVED: "结账中",
  SOLD: "已售出",
  HIDDEN: "已下架"
};

export default async function AdminProducts() {
  await requireAdmin();
  const products = await prisma.product.findMany({
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t.admin.products.title}</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700"
        >
          {t.admin.products.new}
        </Link>
      </div>
      <div className="bg-white rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 text-neutral-600">
            <tr>
              <th className="text-left p-3 w-20">图</th>
              <th className="text-left p-3">名称</th>
              <th className="text-left p-3">价格</th>
              <th className="text-left p-3">尺码</th>
              <th className="text-left p-3">状态</th>
              <th className="text-right p-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-200">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-3">
                  <div className="relative w-14 h-14 bg-brand-100 rounded overflow-hidden">
                    {p.images[0] && (
                      <Image
                        src={p.images[0].url}
                        alt={p.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                </td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{formatMoney(p.priceCents, p.currency)}</td>
                <td className="p-3">{p.size ?? "—"}</td>
                <td className="p-3">{statusLabels[p.status] ?? p.status}</td>
                <td className="p-3 text-right space-x-2">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-brand-600 hover:underline"
                  >
                    编辑
                  </Link>
                  <DeleteProductButton id={p.id} />
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-500">
                  还没有商品，点右上角上架第一件。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
