import Link from "next/link";
import { t } from "@/lib/i18n";
import { CartButton } from "@/components/storefront/CartButton";

export default function PublicLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 backdrop-blur bg-brand-50/80 border-b border-brand-200">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-brand-700">
              {t.brand}
            </span>
            <span className="text-xs text-neutral-500 hidden sm:inline">
              {t.tagline}
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="hover:text-brand-600">
              {t.nav.home}
            </Link>
            <CartButton />
          </nav>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-brand-200 py-6 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {t.brand}
      </footer>
    </div>
  );
}
