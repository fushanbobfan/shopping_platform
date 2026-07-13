import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function LegacyProductPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { slug: true }
  });
  if (!product) notFound();
  redirect(`/pieces/${product.slug}`);
}
