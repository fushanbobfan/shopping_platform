import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { getSession } from "@/lib/auth";

const schema = z.object({ password: z.string().min(1) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) {
    return NextResponse.json(
      { error: "server-misconfigured" },
      { status: 500 }
    );
  }

  const a = Buffer.from(parsed.data.password);
  const b = Buffer.from(expected);
  const ok =
    a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!ok) {
    return NextResponse.json({ error: "wrong-password" }, { status: 401 });
  }

  const session = await getSession();
  session.isAdmin = true;
  await session.save();
  return NextResponse.json({ ok: true });
}
