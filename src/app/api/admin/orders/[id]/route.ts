import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

const schema = z.object({
  status: z.enum(["PAID", "SHIPPED", "CANCELLED"])
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const data: {
    status: "PAID" | "SHIPPED" | "CANCELLED";
    shippedAt?: Date;
  } = { status: parsed.data.status };
  if (parsed.data.status === "SHIPPED") data.shippedAt = new Date();

  await prisma.order.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true });
}
