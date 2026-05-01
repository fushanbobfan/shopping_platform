import Link from "next/link";
import { t } from "@/lib/i18n";
import { isAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const signedIn = await isAdmin();

  return (
    <div className="min-h-screen flex flex-col">
      {signedIn && (
        <header className="bg-neutral-900 text-white">
          <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
            <Link href="/admin" className="font-semibold">
              {t.brand} · Admin
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin/products" className="hover:text-brand-200">
                {t.admin.nav.products}
              </Link>
              <Link href="/admin/orders" className="hover:text-brand-200">
                {t.admin.nav.orders}
              </Link>
              <form action="/api/admin/logout" method="post">
                <button className="text-neutral-300 hover:text-white">
                  {t.admin.nav.logout}
                </button>
              </form>
            </nav>
          </div>
        </header>
      )}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
