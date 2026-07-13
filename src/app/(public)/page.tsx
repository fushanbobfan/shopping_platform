import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, PackageCheck, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { siteConfig } from "@/lib/site";
import { CollectionBrowser } from "@/components/storefront/CollectionBrowser";

export const dynamic = "force-dynamic";

const fallbackHero =
  "https://images.unsplash.com/photo-1685883785814-42d0b197ae64?auto=format&fit=crop&w=2200&q=90";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { status: "AVAILABLE" },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
  });

  const hero = products.find((product) => product.featured) ?? products[0];
  const storyPiece = products[1] ?? hero;
  const serialized = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    priceCents: product.priceCents,
    currency: product.currency,
    size: product.size,
    category: product.category,
    condition: product.condition,
    image: product.images[0]?.url ?? null
  }));

  return (
    <>
      <section className="relative isolate min-h-[calc(100svh-var(--header-height))] overflow-hidden bg-[#5c554c] text-white">
        <Image
          src={hero?.images[0]?.url ?? fallbackHero}
          alt={hero ? hero.name : "A curated rack of clothing from Mike's wardrobe"}
          fill
          priority
          loading="eager"
          sizes="100vw"
          className="hero-image -z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,10,9,0.72)_0%,rgba(10,10,9,0.28)_54%,rgba(10,10,9,0.08)_100%)]" />
        <div className="page-shell flex min-h-[calc(100svh-var(--header-height))] flex-col justify-between py-8 sm:py-12">
          <div className="hero-enter flex items-center justify-between gap-4">
            <span className="eyebrow">Personal wardrobe sale · {siteConfig.location}</span>
            <span className="eyebrow hidden sm:block">Edition 01 / Ongoing</span>
          </div>

          <div className="hero-enter-delay max-w-4xl pb-5">
            <h1 className="font-editorial max-w-[11ch] text-[clamp(3.8rem,9vw,8.5rem)] leading-[0.84]">
              Collected slowly. Released one piece at a time.
            </h1>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="#collection" className="button-primary bg-white! text-black! hover:bg-[var(--accent)]! hover:text-white!">
                Shop the edit <ArrowDownRight size={16} />
              </Link>
              {hero ? (
                <Link href={`/pieces/${hero.slug}`} className="button-secondary">
                  Featured · {formatMoney(hero.priceCents, hero.currency)}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell grid border-b hairline py-14 md:grid-cols-[1fr_1.35fr] md:gap-16 md:py-24">
        <p className="eyebrow text-[var(--accent)]">One owner. One of each.</p>
        <div className="scroll-reveal mt-8 md:mt-0">
          <p className="font-editorial max-w-4xl text-4xl leading-[1.03] sm:text-6xl">
            This is {siteConfig.owner}&apos;s actual closet, not anonymous inventory.
            Every mark, measurement, and memory is disclosed before you buy.
          </p>
          <div className="mt-10 grid gap-6 border-t hairline pt-6 text-sm leading-6 text-[var(--muted)] sm:grid-cols-2">
            <p className="flex gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-[var(--accent)]" size={19} />
              Secure Stripe checkout with prices and availability re-checked on the server.
            </p>
            <p className="flex gap-3">
              <PackageCheck className="mt-0.5 shrink-0 text-[var(--accent)]" size={19} />
              {siteConfig.shippingNote} Reused packaging whenever it is clean and sturdy.
            </p>
          </div>
        </div>
      </section>

      <section id="collection" className="page-shell scroll-mt-24 py-16 sm:py-24">
        <div className="mb-10 flex items-end justify-between gap-6 border-b hairline pb-5">
          <div>
            <p className="eyebrow text-[var(--accent)]">Available now</p>
            <h2 className="font-editorial mt-3 text-5xl sm:text-7xl">The current edit</h2>
          </div>
          <p className="hidden max-w-xs text-right text-sm leading-6 text-[var(--muted)] md:block">
            When a piece sells, it leaves the archive for good.
          </p>
        </div>
        <CollectionBrowser products={serialized} />
      </section>

      <section id="about" className="scroll-mt-24 border-y hairline bg-[var(--ink)] text-[var(--paper)]">
        <div className="grid min-h-[70svh] lg:grid-cols-2">
          <div className="relative min-h-[55svh] overflow-hidden lg:min-h-full">
            <Image
              src={storyPiece?.images[0]?.url ?? fallbackHero}
              alt={storyPiece?.name ?? "Clothing from the archive"}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex items-center px-6 py-16 sm:px-12 lg:px-20">
            <div className="scroll-reveal max-w-xl">
              <p className="eyebrow text-[#e2785f]">Why this archive exists</p>
              <h2 className="font-editorial mt-6 text-5xl leading-[0.95] sm:text-7xl">
                Good clothes deserve a second chapter.
              </h2>
              <p className="mt-8 max-w-lg text-base leading-7 text-[#c8c2b6]">
                Tastes change and closets get crowded. This shop gives the pieces Mike
                still respects a direct route to someone who will actually wear them.
              </p>
              <Link href="#collection" className="button-secondary mt-10">
                Find your piece <ArrowDownRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
