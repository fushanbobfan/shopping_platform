import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { t } from "@/lib/i18n";
import { MarkShippedButton } from "@/components/admin/MarkShippedButton";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  PENDING: t.admin.orders.pending,
  PAID: t.admin.orders.paid,
  SHIPPED: t.admin.orders.shipped,
  CANCELLED: t.admin.orders.cancelled
};

export default async function AdminOrders() {
  await requireAdmin();
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t.admin.orders.title}</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="bg-white rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <div className="text-sm text-neutral-500">
                  订单 <span className="font-mono">{o.id}</span>
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {new Date(o.createdAt).toLocaleString("zh-CN")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    "text-xs px-2 py-1 rounded-full " +
                    (o.status === "PAID"
                      ? "bg-amber-100 text-amber-800"
                      : o.status === "SHIPPED"
                        ? "bg-green-100 text-green-800"
                        : o.status === "CANCELLED"
                          ? "bg-neutral-200 text-neutral-700"
                          : "bg-neutral-100 text-neutral-600")
                  }
                >
                  {statusLabels[o.status]}
                </span>
                {o.status === "PAID" && <MarkShippedButton id={o.id} />}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-neutral-500 mb-1">买家</div>
                <div>{o.buyerName ?? "—"}</div>
                <div className="text-neutral-600">{o.buyerEmail ?? "—"}</div>
              </div>
              <div>
                <div className="text-neutral-500 mb-1">收货地址</div>
                <div className="text-neutral-700 leading-relaxed">
                  {[
                    o.shippingLine1,
                    o.shippingLine2,
                    o.shippingCity,
                    o.shippingState,
                    o.shippingPostal,
                    o.shippingCountry
                  ]
                    .filter(Boolean)
                    .join(" / ") || "—"}
                </div>
              </div>
            </div>

            <ul className="border-t border-brand-200 pt-3 text-sm divide-y divide-brand-100">
              {o.items.map((it) => (
                <li
                  key={it.id}
                  className="flex justify-between py-1.5"
                >
                  <span className="truncate pr-2">{it.product.name}</span>
                  <span className="text-brand-700 font-medium">
                    {formatMoney(it.priceAtPurchase, o.currency)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-end text-base">
              <span className="text-neutral-500 mr-2">合计</span>
              <span className="font-bold text-brand-700">
                {formatMoney(o.totalCents, o.currency)}
              </span>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="p-12 text-center text-neutral-500 bg-white rounded-xl">
            暂无订单
          </div>
        )}
      </div>
    </div>
  );
}
