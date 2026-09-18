/**
 * Storage adapter for uploaded files.
 *
 *  - Local driver (default): writes to UPLOAD_DIR (./uploads) and serves files
 *    through /api/media/file/[...key].
 *  - S3 driver: enabled when S3_BUCKET is set. Works with AWS S3, Cloudflare R2,
 *    Supabase Storage (S3 endpoint), DigitalOcean Spaces, MinIO.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

export type StoredObject = { body: Buffer; contentType: string; size: number };

export interface StorageDriver {
  readonly kind: "local" | "s3";
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<StoredObject | null>;
  remove(key: string): Promise<void>;
  publicUrl(key: string): string;
}

const SAFE_KEY = /^[a-zA-Z0-9][a-zA-Z0-9/_\-.]*$/;

export function assertSafeKey(key: string): string {
  if (!SAFE_KEY.test(key) || key.includes("..") || key.includes("//")) {
    throw new Error("Invalid storage key");
  }
  return key;
}

function streamedUrl(key: string) {
  return `/api/media/file/${key}`;
}

function createLocalDriver(): StorageDriver {
  const root = path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.UPLOAD_DIR || "uploads");
  const resolve = (key: string) => path.join(root, assertSafeKey(key));
  return {
    kind: "local",
    async put(key, body) {
      const file = resolve(key);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, body);
    },
    async get(key) {
      try {
        const file = resolve(key);
        const body = await fs.readFile(file);
        return { body, contentType: guessContentType(key), size: body.byteLength };
      } catch {
        return null;
      }
    },
    async remove(key) {
      try {
        await fs.unlink(resolve(key));
      } catch {
        /* already gone */
      }
    },
    publicUrl: streamedUrl,
  };
}

function createS3Driver(): StorageDriver {
  const bucket = process.env.S3_BUCKET as string;
  const publicBase = (process.env.S3_PUBLIC_URL || "").replace(/\/$/, "");
  type S3Module = typeof import("@aws-sdk/client-s3");
  let clientPromise: Promise<{ mod: S3Module; client: InstanceType<S3Module["S3Client"]> }> | null = null;
  const getClient = () => {
    clientPromise ??= import("@aws-sdk/client-s3").then((mod) => ({
      mod,
      client: new mod.S3Client({
        region: process.env.S3_REGION || "auto",
        endpoint: process.env.S3_ENDPOINT || undefined,
        forcePathStyle: !!process.env.S3_ENDPOINT,
        credentials:
          process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
            ? {
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
              }
            : undefined,
      }),
    }));
    return clientPromise;
  };
  return {
    kind: "s3",
    async put(key, body, contentType) {
      const { mod, client } = await getClient();
      await client.send(
        new mod.PutObjectCommand({
          Bucket: bucket,
          Key: assertSafeKey(key),
          Body: body,
          ContentType: contentType,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
    },
    async get(key) {
      const { mod, client } = await getClient();
      try {
        const res = await client.send(new mod.GetObjectCommand({ Bucket: bucket, Key: assertSafeKey(key) }));
        const bytes = await res.Body?.transformToByteArray();
        if (!bytes) return null;
        const body = Buffer.from(bytes);
        return { body, contentType: res.ContentType || guessContentType(key), size: body.byteLength };
      } catch {
        return null;
      }
    },
    async remove(key) {
      const { mod, client } = await getClient();
      await client.send(new mod.DeleteObjectCommand({ Bucket: bucket, Key: assertSafeKey(key) }));
    },
    publicUrl(key) {
      // Private uploads (enquiry attachments) are always streamed through the app.
      if (!publicBase || key.startsWith("enquiries/")) return streamedUrl(key);
      return `${publicBase}/${key}`;
    },
  };
}

export function guessContentType(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    avif: "image/avif",
    svg: "image/svg+xml",
    pdf: "application/pdf",
  };
  return (ext && map[ext]) || "application/octet-stream";
}

const globalForStorage = globalThis as typeof globalThis & { __ttStorage?: StorageDriver };
export const storage: StorageDriver =
  globalForStorage.__ttStorage ?? (process.env.S3_BUCKET ? createS3Driver() : createLocalDriver());
globalForStorage.__ttStorage = storage;

export function fileUrl(key: string): string {
  return storage.publicUrl(key);
}
