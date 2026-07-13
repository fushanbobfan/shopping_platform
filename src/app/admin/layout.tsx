import Link from "next/link";
import { ArrowUpRight, Boxes, LayoutDashboard, LogOut, PackageCheck } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { siteConfig } from "@/lib/site";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const signedIn = await isAdmin();

  if (!signedIn) {
    return <main className="min-h-screen bg-[#e9e6df]">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#e9e6df]">
      <header className="border-b border-black/15 bg-[#171714] text-white">
        <div className="mx-auto flex min-h-16 max-w-[92rem] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <Link href="/admin" className="font-black tracking-[-0.03em]">
            {siteConfig.name} <span className="ml-2 text-xs font-normal text-white/55">Studio</span>
          </Link>
          <nav className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.1em]">
            <Link href="/admin" className="flex items-center gap-2 px-3 py-2 hover:bg-white/10"><LayoutDashboard size={15} /> Overview</Link>
            <Link href="/admin/products" className="flex items-center gap-2 px-3 py-2 hover:bg-white/10"><Boxes size={15} /> Pieces</Link>
            <Link href="/admin/orders" className="flex items-center gap-2 px-3 py-2 hover:bg-white/10"><PackageCheck size={15} /> Orders</Link>
            <Link href="/" target="_blank" className="hidden items-center gap-1 px-3 py-2 text-white/65 hover:text-white sm:flex">Store <ArrowUpRight size={14} /></Link>
            <form action="/api/admin/logout" method="post">
              <button className="flex items-center gap-2 px-3 py-2 text-white/65 hover:text-white"><LogOut size={15} /><span className="hidden sm:inline">Sign out</span></button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[92rem] px-4 py-8 sm:px-8 sm:py-12">{children}</main>
    </div>
  );
}
