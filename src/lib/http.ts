import { NextResponse } from "next/server";

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const requestUrl = new URL(request.url);
    const allowed = new Set([requestUrl.origin]);
    if (process.env.APP_URL) allowed.add(new URL(process.env.APP_URL).origin);
    return allowed.has(new URL(origin).origin);
  } catch {
    return false;
  }
}

export function rejectCrossOrigin(request: Request) {
  return isSameOrigin(request)
    ? null
    : NextResponse.json({ error: "cross-origin" }, { status: 403 });
}

export function getClientIp(request: Request) {
  return (
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for")?.split(",")[0] ??
    "local"
  ).trim();
}
