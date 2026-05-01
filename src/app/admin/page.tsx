import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();

  const [productCount, availableCount, pendingOrders, paidOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: "AVAILABLE" } }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.count({ where: { status: "SHIPPED" } })
    ]);

  const stats = [
    { label: "商品总数", value: productCount },
    { label: "在售商品", value: availableCount },
    { label: "待发货订单", value: pendingOrders },
    { label: "已发货订单", value: paidOrders }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">管理后台</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-sm text-neutral-500">{s.label}</div>
            <div className="text-3xl font-bold text-brand-700 mt-1">
              {s.value}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Link
          href="/admin/products"
          className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700"
        >
          {t.admin.nav.products}
        </Link>
        <Link
          href="/admin/orders"
          className="px-4 py-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-900"
        >
          {t.admin.nav.orders}
        </Link>
      </div>
    </div>
  );
}
