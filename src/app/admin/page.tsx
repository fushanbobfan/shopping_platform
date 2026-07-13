import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();

  const [totalProducts, available, reserved, awaitingShipment, completed, latestOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: "AVAILABLE" } }),
      prisma.product.count({ where: { status: "RESERVED" } }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "SHIPPED"] } },
        _sum: { totalCents: true }
      }),
      prisma.order.findMany({
        where: { status: { in: ["PAID", "SHIPPED"] } },
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: 5
      })
    ]);

  const currency = latestOrders[0]?.currency ?? process.env.NEXT_PUBLIC_CURRENCY ?? "usd";
  const metrics = [
    { label: "Live pieces", value: available.toString(), context: `${totalProducts} total records` },
    { label: "In checkout", value: reserved.toString(), context: "Temporary holds" },
    { label: "To ship", value: awaitingShipment.toString(), context: "Paid orders" },
    { label: "Gross sales", value: formatMoney(completed._sum.totalCents ?? 0, currency), context: "Before Stripe fees" }
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-black/15 pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Store operations</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em]">Overview</h1>
          <p className="mt-2 text-sm text-black/55">Inventory, fulfillment, and recent payment activity.</p>
        </div>
        <Link href="/admin/products/new" className="button-primary"><Plus size={16} /> Add piece</Link>
      </div>

      <dl className="grid border-b border-black/15 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="border-b border-black/15 py-7 sm:border-r sm:px-6 sm:first:pl-0 sm:nth-[2]:border-r-0 xl:border-b-0 xl:nth-[2]:border-r xl:last:border-r-0 xl:last:pr-0">
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-black/45">{metric.label}</dt>
            <dd className="mt-3 text-4xl font-bold tracking-[-0.04em]">{metric.value}</dd>
            <p className="mt-2 text-xs text-black/45">{metric.context}</p>
          </div>
        ))}
      </dl>

      <section className="mt-12">
        <div className="flex items-center justify-between border-b border-black/15 pb-4">
          <div><h2 className="text-lg font-bold">Recent paid orders</h2><p className="mt-1 text-sm text-black/50">Newest payments and fulfillment status.</p></div>
          <Link href="/admin/orders" className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] hover:text-[var(--accent)]">All orders <ArrowRight size={14} /></Link>
        </div>
        {latestOrders.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.1em] text-black/45"><tr><th className="py-3 font-semibold">Order</th><th className="py-3 font-semibold">Buyer</th><th className="py-3 font-semibold">Pieces</th><th className="py-3 font-semibold">Total</th><th className="py-3 text-right font-semibold">Status</th></tr></thead>
              <tbody className="border-t border-black/15">
                {latestOrders.map((order) => (
                  <tr key={order.id} className="border-b border-black/10">
                    <td className="py-4 font-mono text-xs">{order.publicId}</td>
                    <td className="py-4">{order.buyerName || order.buyerEmail || "—"}</td>
                    <td className="py-4">{order.items.length}</td>
                    <td className="py-4 font-semibold">{formatMoney(order.totalCents, order.currency)}</td>
                    <td className="py-4 text-right"><span className={`px-2 py-1 text-xs font-bold uppercase tracking-[0.08em] ${order.status === "PAID" ? "bg-[#f2d79a] text-[#684913]" : "bg-[#cfe1d5] text-[#244a34]"}`}>{order.status === "PAID" ? "To ship" : "Shipped"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="border-b border-black/15 py-12 text-center text-sm text-black/45">No paid orders yet.</p>
        )}
      </section>
    </div>
  );
}
