import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { statusLabels } from "@/lib/product-data";

export const dynamic = "force-dynamic";

const statusStyles = {
  AVAILABLE: "bg-[#cfe1d5] text-[#244a34]",
  RESERVED: "bg-[#f2d79a] text-[#684913]",
  SOLD: "bg-[#d7d4ce] text-[#4f4c46]",
  HIDDEN: "bg-[#eee9df] text-[#6e685f]"
} as const;

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await prisma.product.findMany({
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-black/15 pb-6">
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Inventory</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.035em]">Pieces</h1><p className="mt-2 text-sm text-black/50">Publish, price, and archive Mike&apos;s wardrobe.</p></div>
        <Link href="/admin/products/new" className="button-primary"><Plus size={16} /> Add piece</Link>
      </div>

      {products.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.1em] text-black/45"><tr><th className="w-24 py-3 font-semibold">Image</th><th className="py-3 font-semibold">Piece</th><th className="py-3 font-semibold">Price</th><th className="py-3 font-semibold">Status</th><th className="py-3 font-semibold">Updated</th><th className="py-3 text-right font-semibold">Actions</th></tr></thead>
            <tbody className="border-t border-black/15">
              {products.map((product) => (
                <tr key={product.id} className="border-b border-black/10 align-middle">
                  <td className="py-3"><div className="relative aspect-[4/5] w-16 overflow-hidden bg-black/5">{product.images[0] ? <Image src={product.images[0].url} alt="" fill sizes="64px" className="object-cover" /> : null}</div></td>
                  <td className="py-3"><p className="font-semibold">{product.name}</p><p className="mt-1 text-xs text-black/45">{product.brand || "No brand"} · {product.size || "No size"}</p></td>
                  <td className="py-3 font-semibold">{formatMoney(product.priceCents, product.currency)}</td>
                  <td className="py-3"><span className={`px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] ${statusStyles[product.status]}`}>{statusLabels[product.status]}</span></td>
                  <td className="py-3 text-black/50">{product.updatedAt.toLocaleDateString("en-US")}</td>
                  <td className="py-3"><div className="flex justify-end gap-3 text-xs font-bold uppercase tracking-[0.08em]"><Link href={`/admin/products/${product.id}`} className="hover:text-[var(--accent)]">Edit</Link>{product.status !== "HIDDEN" ? <Link href={`/pieces/${product.slug}`} target="_blank" className="flex items-center gap-1 hover:text-[var(--accent)]">View <ArrowUpRight size={12} /></Link> : null}<DeleteProductButton id={product.id} disabled={product.status === "RESERVED"} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border-b border-black/15 py-20 text-center"><p className="text-sm text-black/45">No pieces yet.</p><Link href="/admin/products/new" className="button-primary mt-5"><Plus size={16} /> Add the first one</Link></div>
      )}
    </div>
  );
}
