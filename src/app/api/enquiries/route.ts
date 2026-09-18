/**
 * Public enquiry endpoint used by the Contact and Request-a-Quote forms.
 * Validates input (zod), blocks bots (honeypot), rate-limits per IP, stores an
 * optional attachment privately, and saves the enquiry to the database.
 */
import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { ATTACHMENT_MIME_TYPES, MAX_ATTACHMENT_BYTES, safeFilename } from "@/lib/images";
import { storage } from "@/lib/storage";

export const dynamic = "force-dynamic";

const schema = z.object({
  type: z.enum(["quote", "contact"]),
  name: z.string().trim().min(2, "Please enter your full name.").max(160),
  company: z.string().trim().max(200).default(""),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  phone: z.string().trim().max(60).default(""),
  projectType: z.string().trim().max(120).default(""),
  location: z.string().trim().max(200).default(""),
  budget: z.string().trim().max(120).default(""),
  preferredContact: z.string().trim().max(40).default(""),
  message: z.string().trim().min(10, "Please describe your project or message (at least 10 characters).").max(5000),
});

/* Simple in-memory rate limit: 5 submissions per IP per 10 minutes. */
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > LIMIT;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many submissions. Please try again in a few minutes." }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — real users never fill this hidden field.
  if (String(form.get("website") ?? "").length > 0) return NextResponse.json({ ok: true });

  const raw = Object.fromEntries(
    ["type", "name", "company", "email", "phone", "projectType", "location", "budget", "preferredContact", "message"].map(
      (k) => [k, String(form.get(k) ?? "")],
    ),
  );
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json({ error: "Please correct the highlighted fields.", fieldErrors }, { status: 422 });
  }

  let attachmentKey: string | null = null;
  let attachmentName: string | null = null;
  const attachment = form.get("attachment");
  if (attachment instanceof File && attachment.size > 0) {
    if (!ATTACHMENT_MIME_TYPES.includes(attachment.type)) {
      return NextResponse.json(
        { error: "Attachment must be a PDF, JPG, PNG or WebP file.", fieldErrors: { attachment: "Unsupported file type." } },
        { status: 422 },
      );
    }
    if (attachment.size > MAX_ATTACHMENT_BYTES) {
      return NextResponse.json(
        { error: "Attachment is too large (max 8 MB).", fieldErrors: { attachment: "File larger than 8 MB." } },
        { status: 422 },
      );
    }
    const name = safeFilename(attachment.name);
    attachmentKey = `enquiries/${randomUUID()}-${name}`;
    attachmentName = attachment.name.slice(0, 300);
    await storage.put(attachmentKey, Buffer.from(await attachment.arrayBuffer()), attachment.type);
  }

  await db.insert(enquiries).values({ ...parsed.data, attachmentKey, attachmentName, status: "new" });
  return NextResponse.json({ ok: true });
}
