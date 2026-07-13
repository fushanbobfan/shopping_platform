import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rejectCrossOrigin } from "@/lib/http";
import { productInputSchema } from "@/lib/product-data";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) return crossOrigin;
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = productInputSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { images, measurements, ...data } = parsed.data;
  const duplicate = await prisma.product.findFirst({
    where: { slug: data.slug, NOT: { id } },
    select: { id: true }
  });
  if (duplicate) {
    return NextResponse.json({ error: "slug-exists" }, { status: 409 });
  }

  const current = await prisma.product.findUnique({
    where: { id },
    select: { status: true }
  });
  if (!current) {
    return NextResponse.json({ error: "not-found" }, { status: 404 });
  }
  if (current.status === "RESERVED" && data.status !== "RESERVED") {
    return NextResponse.json({ error: "reserved" }, { status: 409 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: { ...data, measurements: measurements ?? undefined }
    });
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productImage.createMany({
      data: images.map((url, order) => ({
        productId: id,
        url,
        alt: data.name,
        order
      }))
    });
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Context) {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) return crossOrigin;
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { status: true }
  });
  if (!product) {
    return NextResponse.json({ error: "not-found" }, { status: 404 });
  }
  if (product.status === "RESERVED") {
    return NextResponse.json({ error: "reserved" }, { status: 409 });
  }

  await prisma.product.update({
    where: { id },
    data: { status: "HIDDEN" }
  });
  return NextResponse.json({ ok: true });
}
