import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, PackageCheck, ShieldCheck } from "lucide-react";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";
import { ImageCarousel } from "@/components/storefront/ImageCarousel";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { siteConfig } from "@/lib/site";

const getProduct = cache((slug: string) =>
  prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: "asc" } } }
  })
);

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || product.status === "HIDDEN") return {};
  return {
    title: product.name,
    description: product.description.slice(0, 155),
    openGraph: {
      title: `${product.name} — ${siteConfig.name}`,
      description: product.description.slice(0, 155),
      images: product.images[0] ? [{ url: product.images[0].url }] : []
    }
  };
}

export default async function PiecePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || product.status === "HIDDEN") notFound();

  const unavailable = product.status !== "AVAILABLE";
  const measurements =
    product.measurements && typeof product.measurements === "object"
      ? (product.measurements as Record<string, string>)
      : {};

  return (
    <div className="page-shell py-6 sm:py-10">
      <Link
        href="/#collection"
        className="mb-6 inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] hover:text-[var(--accent)]"
      >
        <ArrowLeft size={14} /> Back to the edit
      </Link>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)] lg:gap-16">
        <ImageCarousel images={product.images} alt={product.name} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow text-[var(--accent)]">
            {product.brand || "From Mike's archive"}
          </p>
          <h1 className="font-editorial mt-4 text-5xl leading-[0.94] sm:text-7xl lg:text-6xl xl:text-7xl">
            {product.name}
          </h1>
          <div className="mt-6 flex items-baseline gap-3">
            <p className="text-xl font-bold">
              {formatMoney(product.priceCents, product.currency)}
            </p>
            {product.compareAtCents ? (
              <p className="text-sm text-[var(--muted)] line-through">
                {formatMoney(product.compareAtCents, product.currency)} retail
              </p>
            ) : null}
          </div>

          <dl className="mt-8 border-y hairline text-sm">
            {[
              ["Size", product.size],
              ["Condition", product.condition],
              ["Color", product.color],
              ["Material", product.material]
            ].map(([label, value]) =>
              value ? (
                <div key={label} className="grid grid-cols-[7rem_1fr] border-b hairline py-3 last:border-b-0">
                  <dt className="text-[var(--muted)]">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ) : null
            )}
          </dl>

          <p className="mt-8 text-[0.95rem] leading-7 text-[#3e3d38]">
            {product.description}
          </p>

          {Object.keys(measurements).length > 0 ? (
            <div className="mt-8">
              <h2 className="eyebrow">Measurements</h2>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {Object.entries(measurements).map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b hairline py-2 capitalize">
                    <dt className="text-[var(--muted)]">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-2 text-xs text-[var(--muted)]">Measured flat. Allow ±0.5 in.</p>
            </div>
          ) : null}

          {product.story ? (
            <div className="mt-8 border-l-2 border-[var(--accent)] pl-4">
              <p className="eyebrow text-[var(--accent)]">From Mike</p>
              <p className="font-editorial mt-2 text-xl leading-7">“{product.story}”</p>
            </div>
          ) : null}

          <div className="mt-9">
            <AddToCartButton
              unavailable={unavailable}
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.priceCents,
                currency: product.currency,
                size: product.size ?? undefined,
                image: product.images[0]?.url
              }}
            />
          </div>

          <ul className="mt-6 space-y-3 text-xs leading-5 text-[var(--muted)]">
            <li className="flex gap-2"><Check size={15} className="shrink-0 text-[var(--success)]" /> One item available; checkout temporarily reserves it.</li>
            <li className="flex gap-2"><ShieldCheck size={15} className="shrink-0 text-[var(--success)]" /> Secure payment handled by Stripe.</li>
            <li className="flex gap-2"><PackageCheck size={15} className="shrink-0 text-[var(--success)]" /> {siteConfig.shippingNote}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
