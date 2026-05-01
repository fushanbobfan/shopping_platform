import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no-file" }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "too-large" }, { status: 413 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "not-image" }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const key = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "blob-not-configured" },
      { status: 500 }
    );
  }

  const { url } = await put(key, file, {
    access: "public",
    token,
    contentType: file.type
  });

  return NextResponse.json({ url });
}
