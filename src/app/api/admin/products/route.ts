import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  priceCents: z.number().int().nonnegative(),
  size: z.string().max(40).nullable().optional(),
  category: z.string().max(40).nullable().optional(),
  condition: z.string().max(40).nullable().optional(),
  images: z.array(z.string().url()).min(1)
});

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const { images, ...rest } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...rest,
      currency: process.env.NEXT_PUBLIC_CURRENCY ?? "usd",
      images: {
        create: images.map((url, i) => ({ url, order: i }))
      }
    }
  });

  return NextResponse.json({ id: product.id });
}
