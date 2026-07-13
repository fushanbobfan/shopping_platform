import Link from "next/link";
import { CartButton } from "@/components/storefront/CartButton";
import { siteConfig } from "@/lib/site";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 h-[var(--header-height)] border-b hairline bg-[color:rgba(241,237,228,0.92)] backdrop-blur-md">
        <div className="page-shell flex h-full items-center justify-between gap-6">
          <Link
            href="/"
            aria-label={`${siteConfig.name} home`}
            className="text-[0.92rem] font-black tracking-[-0.035em]"
          >
            {siteConfig.name}
          </Link>
          <nav className="flex items-center gap-5 text-[0.68rem] font-bold uppercase tracking-[0.14em] sm:gap-8">
            <Link href="/#collection" className="hidden hover:text-[var(--accent)] sm:block">
              Shop the edit
            </Link>
            <Link href="/#about" className="hidden hover:text-[var(--accent)] md:block">
              About
            </Link>
            <CartButton />
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t hairline py-12">
        <div className="page-shell grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="font-editorial text-4xl sm:text-5xl">Wear it next.</p>
            <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
              One wardrobe, released slowly. Every piece is photographed, described,
              packed, and shipped by {siteConfig.owner}.
            </p>
          </div>
          <div className="flex items-center gap-5 text-xs font-bold uppercase tracking-[0.14em]">
            {siteConfig.email ? (
              <a href={`mailto:${siteConfig.email}`} className="hover:text-[var(--accent)]">
                Email
              </a>
            ) : null}
            {siteConfig.instagramUrl ? (
              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="hover:text-[var(--accent)]"
              >
                Instagram
              </a>
            ) : null}
            <span className="text-[var(--muted)]">© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
