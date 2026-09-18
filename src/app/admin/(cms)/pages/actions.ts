"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { parseIdList, requireActionUser, revalidateSite } from "@/lib/admin-helpers";
import { getPageDefinition } from "@/lib/page-fields";
import type { ActionState } from "@/lib/types";
import { str } from "@/lib/utils";

export async function savePage(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireActionUser();
  if (!auth.ok) return auth.state;
  const slug = str(fd.get("slug"));
  const def = getPageDefinition(slug);
  if (!def) return { error: "Unknown page." };
  const content: Record<string, string> = {};
  for (const field of def.fields) {
    const raw = fd.get(field.key);
    content[field.key] = field.type === "image" ? String(parseIdList(raw)[0] ?? "") : typeof raw === "string" ? raw.trim() : "";
  }
  const values = {
    title: str(fd.get("title")) || def.title,
    content,
    seoTitle: str(fd.get("seoTitle")).slice(0, 200),
    seoDescription: str(fd.get("seoDescription")).slice(0, 320),
    updatedAt: new Date(),
  };
  const [existing] = await db.select({ id: pages.id }).from(pages).where(eq(pages.slug, slug));
  if (existing) await db.update(pages).set(values).where(eq(pages.slug, slug));
  else await db.insert(pages).values({ slug, ...values, published: true });
  revalidateSite();
  return { ok: true, message: "Page saved. Changes are live." };
}
