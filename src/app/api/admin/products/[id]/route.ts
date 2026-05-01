import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  priceCents: z.number().int().nonnegative().optional(),
  size: z.string().max(40).nullable().optional(),
  category: z.string().max(40).nullable().optional(),
  condition: z.string().max(40).nullable().optional(),
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD", "HIDDEN"]).optional(),
  images: z.array(z.string().url()).optional()
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const { images, ...rest } = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id: params.id }, data: rest });
    if (images) {
      await tx.productImage.deleteMany({ where: { productId: params.id } });
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((url, i) => ({
            productId: params.id,
            url,
            order: i
          }))
        });
      }
    }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  // Soft-delete to preserve OrderItem FK
  await prisma.product.update({
    where: { id: params.id },
    data: { status: "HIDDEN" }
  });
  return NextResponse.json({ ok: true });
}
