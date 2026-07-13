import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { isAdmin } from "@/lib/auth";
import { rejectCrossOrigin } from "@/lib/http";

export const runtime = "nodejs";

const MAX_SOURCE_BYTES = 12 * 1024 * 1024;

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) return crossOrigin;
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no-file" }, { status: 400 });
  }
  if (file.size > MAX_SOURCE_BYTES) {
    return NextResponse.json({ error: "too-large" }, { status: 413 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "not-image" }, { status: 415 });
  }

  try {
    const optimized = await sharp(Buffer.from(await file.arrayBuffer()), {
      failOn: "error"
    })
      .rotate()
      .resize({ width: 2200, height: 2800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 86, effort: 4 })
      .toBuffer();

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const blob = await put(`products/${Date.now()}.webp`, optimized, {
      access: "public",
      addRandomSuffix: true,
      contentType: "image/webp",
      ...(token ? { token } : {})
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Image processing or upload failed", error);
    return NextResponse.json({ error: "invalid-image" }, { status: 422 });
  }
}
