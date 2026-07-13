import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rejectCrossOrigin } from "@/lib/http";
import { productInputSchema } from "@/lib/product-data";

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) return crossOrigin;
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = productInputSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { images, measurements, status, ...data } = parsed.data;
  const duplicate = await prisma.product.findUnique({
    where: { slug: data.slug },
    select: { id: true }
  });
  if (duplicate) {
    return NextResponse.json({ error: "slug-exists" }, { status: 409 });
  }

  const product = await prisma.product.create({
    data: {
      ...data,
      measurements: measurements ?? undefined,
      currency: process.env.NEXT_PUBLIC_CURRENCY ?? "usd",
      status: status === "AVAILABLE" ? "AVAILABLE" : "HIDDEN",
      images: {
        create: images.map((url, order) => ({
          url,
          alt: data.name,
          order
        }))
      }
    }
  });

  return NextResponse.json({ id: product.id, slug: product.slug });
}
