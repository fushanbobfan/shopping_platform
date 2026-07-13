import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminPassword, loginFingerprint } from "@/lib/admin-password";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getClientIp, rejectCrossOrigin } from "@/lib/http";

const loginSchema = z.object({ password: z.string().min(1).max(300) });
const WINDOW_MS = 15 * 60_000;
const MAX_FAILURES = 5;

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const now = new Date();
  const fingerprint = loginFingerprint(getClientIp(request));
  const attempt = await prisma.adminLoginAttempt.findUnique({
    where: { fingerprint }
  });

  if (attempt?.lockedUntil && attempt.lockedUntil > now) {
    return NextResponse.json(
      { error: "locked", retryAfter: Math.ceil((attempt.lockedUntil.getTime() - now.getTime()) / 1000) },
      { status: 429 }
    );
  }

  if (!verifyAdminPassword(parsed.data.password)) {
    const withinWindow =
      attempt && now.getTime() - attempt.windowStart.getTime() < WINDOW_MS;
    const failures = withinWindow ? attempt.failures + 1 : 1;
    await prisma.adminLoginAttempt.upsert({
      where: { fingerprint },
      create: {
        fingerprint,
        failures,
        windowStart: now,
        lockedUntil:
          failures >= MAX_FAILURES ? new Date(now.getTime() + WINDOW_MS) : null
      },
      update: {
        failures,
        windowStart: withinWindow ? attempt.windowStart : now,
        lockedUntil:
          failures >= MAX_FAILURES ? new Date(now.getTime() + WINDOW_MS) : null
      }
    });
    return NextResponse.json({ error: "wrong-password" }, { status: 401 });
  }

  await prisma.adminLoginAttempt.deleteMany({ where: { fingerprint } });
  const session = await getSession();
  session.isAdmin = true;
  session.authenticatedAt = Date.now();
  await session.save();
  return NextResponse.json({ ok: true });
}
