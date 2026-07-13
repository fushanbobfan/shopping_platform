import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { status: "AVAILABLE" },
    select: { slug: true, updatedAt: true }
  });
  return [
    { url: absoluteUrl(), lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...products.map((product) => ({
      url: absoluteUrl(`/pieces/${product.slug}`),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8
    }))
  ];
}
