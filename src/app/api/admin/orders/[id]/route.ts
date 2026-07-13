import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rejectCrossOrigin } from "@/lib/http";

const fulfillmentSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("SHIPPED"),
    carrier: z.string().trim().max(80).optional(),
    trackingNumber: z.string().trim().max(160).optional()
  }),
  z.object({ status: z.literal("CANCELLED") })
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) return crossOrigin;
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = fulfillmentSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "not-found" }, { status: 404 });
  }

  if (parsed.data.status === "SHIPPED") {
    if (order.status !== "PAID") {
      return NextResponse.json({ error: "invalid-transition" }, { status: 409 });
    }
    await prisma.order.update({
      where: { id },
      data: {
        status: "SHIPPED",
        shippedAt: new Date(),
        carrier: parsed.data.carrier || null,
        trackingNumber: parsed.data.trackingNumber || null
      }
    });
  } else {
    if (order.status !== "PENDING") {
      return NextResponse.json({ error: "invalid-transition" }, { status: 409 });
    }
    await prisma.$transaction([
      prisma.product.updateMany({
        where: { reservedByOrderId: id, status: "RESERVED" },
        data: {
          status: "AVAILABLE",
          reservedUntil: null,
          reservedByOrderId: null
        }
      }),
      prisma.order.update({ where: { id }, data: { status: "CANCELLED" } })
    ]);
  }

  return NextResponse.json({ ok: true });
}
