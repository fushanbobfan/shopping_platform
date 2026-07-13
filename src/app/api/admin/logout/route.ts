import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { rejectCrossOrigin } from "@/lib/http";

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) return crossOrigin;
  const session = await getSession();
  session.destroy();
  return NextResponse.redirect(
    new URL("/admin/login", process.env.APP_URL ?? new URL(request.url).origin),
    { status: 303 }
  );
}
