import { FulfillmentForm } from "@/components/admin/FulfillmentForm";
import { CancelReservationButton } from "@/components/admin/CancelReservationButton";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

const statusLabels = {
  PENDING: "Checkout open",
  PAID: "To ship",
  SHIPPED: "Shipped",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
  REFUNDED: "Refunded"
} as const;

const statusStyles = {
  PENDING: "bg-[#eee9df] text-[#6e685f]",
  PAID: "bg-[#f2d79a] text-[#684913]",
  SHIPPED: "bg-[#cfe1d5] text-[#244a34]",
  CANCELLED: "bg-[#ddd9d1] text-[#5b5750]",
  EXPIRED: "bg-[#ddd9d1] text-[#5b5750]",
  REFUNDED: "bg-[#e7cfc8] text-[#743426]"
} as const;

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <div className="border-b border-black/15 pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Fulfillment</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em]">Orders</h1>
        <p className="mt-2 text-sm text-black/50">Payment, buyer address, and shipment details in one place.</p>
      </div>

      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <article key={order.id} className="border border-black/15 bg-white/45 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3"><h2 className="font-mono text-sm font-bold">{order.publicId}</h2><span className={`px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] ${statusStyles[order.status]}`}>{statusLabels[order.status]}</span></div>
                <p className="mt-2 text-xs text-black/45">Created {order.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
              <p className="text-xl font-bold">{formatMoney(order.totalCents, order.currency)}</p>
            </div>

            <div className="mt-6 grid gap-6 border-t border-black/10 pt-5 md:grid-cols-[0.8fr_1.2fr]">
              <div><p className="text-xs font-bold uppercase tracking-[0.1em] text-black/45">Buyer</p><p className="mt-2 text-sm font-semibold">{order.buyerName || "—"}</p><p className="mt-1 text-sm text-black/55">{order.buyerEmail || "—"}</p></div>
              <div><p className="text-xs font-bold uppercase tracking-[0.1em] text-black/45">Ship to</p><address className="mt-2 text-sm not-italic leading-6 text-black/65">{[order.shippingLine1, order.shippingLine2, [order.shippingCity, order.shippingState, order.shippingPostal].filter(Boolean).join(", "), order.shippingCountry].filter(Boolean).map((line) => <span key={line} className="block">{line}</span>)}</address></div>
            </div>

            <ul className="mt-5 border-t border-black/10 pt-3 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-6 py-1.5"><span>{item.nameAtPurchase}</span><span className="shrink-0 font-semibold">{formatMoney(item.priceAtPurchase, order.currency)}</span></li>
              ))}
            </ul>

            {order.status === "PAID" ? <FulfillmentForm orderId={order.id} /> : null}
            {order.status === "PENDING" ? <CancelReservationButton orderId={order.id} /> : null}
            {order.status === "SHIPPED" && (order.carrier || order.trackingNumber) ? <p className="mt-4 border-t border-black/10 pt-4 text-xs text-black/55">{order.carrier || "Carrier not set"}{order.trackingNumber ? <> · <span className="font-mono">{order.trackingNumber}</span></> : null}</p> : null}
          </article>
        ))}
        {orders.length === 0 ? <p className="border-b border-black/15 py-20 text-center text-sm text-black/45">No orders yet.</p> : null}
      </div>
    </div>
  );
}
