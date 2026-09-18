/**
 * Streams stored files. Media keys are UUID-based and immutable → long cache.
 * Enquiry attachments (enquiries/…) are private and require an admin session.
 */
import { type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { assertSafeKey, storage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ key: string[] }> }) {
  const { key: parts } = await ctx.params;
  let key: string;
  try {
    key = assertSafeKey(parts.join("/"));
  } catch {
    return new Response("Not found", { status: 404 });
  }
  const isPrivate = key.startsWith("enquiries/");
  if (isPrivate && !(await getSession())) return new Response("Unauthorized", { status: 401 });

  const file = await storage.get(key);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.body), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Length": String(file.size),
      "Cache-Control": isPrivate ? "private, no-store" : "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      ...(isPrivate ? { "Content-Disposition": `inline; filename="${key.split("/").pop()}"` } : {}),
    },
  });
}
