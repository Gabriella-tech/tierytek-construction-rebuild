/**
 * Media library API (admin only; also guarded by proxy.ts).
 *  GET  /api/admin/media?q=&limit=&offset=   → list images
 *  POST /api/admin/media  (multipart, field "files")  → upload one or many images
 */
import { NextResponse, type NextRequest } from "next/server";
import { desc, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { authorize } from "@/lib/auth";
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES, processAndStoreImage, safeFilename } from "@/lib/images";
import { imageSource } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await authorize())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 48), 200);
  const offset = Math.max(Number(req.nextUrl.searchParams.get("offset") ?? 0), 0);
  const where = q ? or(ilike(media.filename, `%${q}%`), ilike(media.alt, `%${q}%`), ilike(media.caption, `%${q}%`)) : undefined;
  const [rows, [{ count }]] = await Promise.all([
    db.select().from(media).where(where).orderBy(desc(media.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(media).where(where),
  ]);
  return NextResponse.json({
    total: count,
    items: rows.map((m) => ({ ...imageSource(m), filename: m.filename, createdAt: m.createdAt })),
  });
}

export async function POST(req: NextRequest) {
  if (!(await authorize())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return NextResponse.json({ error: "No files received." }, { status: 400 });
  if (files.length > 20) return NextResponse.json({ error: "Upload at most 20 images at a time." }, { status: 400 });

  const uploaded = [];
  const errors: string[] = [];
  for (const file of files) {
    if (!IMAGE_MIME_TYPES.includes(file.type)) {
      errors.push(`${file.name}: unsupported type (${file.type || "unknown"}). Use JPG, PNG, WebP, AVIF or GIF.`);
      continue;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      errors.push(`${file.name}: larger than ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} MB.`);
      continue;
    }
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const processed = await processAndStoreImage(buffer, file.type);
      const [row] = await db
        .insert(media)
        .values({
          key: processed.key,
          filename: safeFilename(file.name),
          mimeType: file.type,
          size: file.size,
          width: processed.width,
          height: processed.height,
          alt: String(form.get("alt") ?? "").trim().slice(0, 300),
          variants: processed.variants,
        })
        .returning();
      uploaded.push({ ...imageSource(row), filename: row.filename, createdAt: row.createdAt });
    } catch (err) {
      console.error("[media upload]", err);
      errors.push(`${file.name}: could not be processed.`);
    }
  }
  const status = uploaded.length ? 200 : 400;
  return NextResponse.json({ items: uploaded, errors }, { status });
}
