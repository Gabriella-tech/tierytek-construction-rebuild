/**
 * Image processing: validates uploads, auto-rotates, and generates responsive
 * WebP variants (thumb / medium / large) so the public site never has to load
 * a full-resolution original.
 */
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import type { MediaVariants } from "@/db/schema";
import { storage } from "@/lib/storage";

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB
export const ATTACHMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
export const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024; // 8 MB

const VARIANT_WIDTHS = { thumb: 640, medium: 1280, large: 2000 } as const;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export type ProcessedImage = {
  key: string;
  width: number;
  height: number;
  variants: MediaVariants;
};

export async function processAndStoreImage(buffer: Buffer, mimeType: string): Promise<ProcessedImage> {
  if (!IMAGE_MIME_TYPES.includes(mimeType)) throw new Error("Unsupported image type");
  const id = randomUUID();
  const baseKey = `media/${id}`;
  const ext = EXT_BY_MIME[mimeType] ?? "bin";

  const image = sharp(buffer, { animated: false }).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height) throw new Error("Could not read image dimensions");

  const originalKey = `${baseKey}/original.${ext}`;
  await storage.put(originalKey, buffer, mimeType);
  const variants: MediaVariants = { original: { key: originalKey, width, height } };

  // Animated GIFs are stored as-is (variants would lose animation).
  if (mimeType === "image/gif") return { key: baseKey, width, height, variants };

  for (const [name, targetWidth] of Object.entries(VARIANT_WIDTHS) as Array<
    [keyof typeof VARIANT_WIDTHS, number]
  >) {
    const { data, info } = await sharp(buffer)
      .rotate()
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: name === "thumb" ? 78 : 82 })
      .toBuffer({ resolveWithObject: true });
    const key = `${baseKey}/${name}.webp`;
    await storage.put(key, data, "image/webp");
    variants[name] = { key, width: info.width, height: info.height };
  }
  return { key: baseKey, width, height, variants };
}

export async function deleteImageVariants(variants: MediaVariants): Promise<void> {
  await Promise.all(Object.values(variants).map((v) => (v ? storage.remove(v.key) : Promise.resolve())));
}

export function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120) || "file";
}
