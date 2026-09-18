"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { insights } from "@/db/schema";
import { parseIdList, requireActionUser, revalidateSite, uniqueSlug } from "@/lib/admin-helpers";
import type { ActionState } from "@/lib/types";
import { slugify, str, toIntOrNull } from "@/lib/utils";

export async function saveInsight(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireActionUser();
  if (!auth.ok) return auth.state;
  const id = toIntOrNull(fd.get("id"));
  const title = str(fd.get("title"));
  const fieldErrors: Record<string, string> = {};
  if (title.length < 2) fieldErrors.title = "Title is required.";
  const content = str(fd.get("content"));
  const published = fd.get("published") === "1";
  if (published && content.length < 40) fieldErrors.content = "Add the article body before publishing.";
  if (Object.keys(fieldErrors).length) return { error: "Please correct the highlighted fields.", fieldErrors };

  const dateRaw = str(fd.get("publishedAt"));
  const publishedAt = dateRaw ? new Date(dateRaw) : new Date();
  const slug = await uniqueSlug("insights", slugify(str(fd.get("slug")) || title), id);
  const values = {
    title, slug,
    excerpt: str(fd.get("excerpt")).slice(0, 400),
    content,
    imageId: parseIdList(fd.get("imageId"))[0] ?? null,
    category: str(fd.get("category")),
    tags: str(fd.get("tags")).split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20),
    author: str(fd.get("author")).slice(0, 120),
    featured: fd.get("featured") === "1",
    published,
    publishedAt: Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
    seoTitle: str(fd.get("seoTitle")).slice(0, 200),
    seoDescription: str(fd.get("seoDescription")).slice(0, 320),
    updatedAt: new Date(),
  };
  let postId = id;
  if (id) await db.update(insights).set(values).where(eq(insights.id, id));
  else {
    const [row] = await db.insert(insights).values(values).returning({ id: insights.id });
    postId = row.id;
  }
  revalidateSite();
  if (!id) redirect(`/admin/insights/${postId}?created=1`);
  return { ok: true, message: "Article saved." };
}

export async function deleteInsight(id: number): Promise<void> {
  if (!(await requireActionUser()).ok) return;
  await db.delete(insights).where(eq(insights.id, id));
  revalidateSite();
  redirect("/admin/insights");
}
export async function toggleInsightPublished(id: number): Promise<void> {
  if (!(await requireActionUser()).ok) return;
  const [row] = await db.select({ published: insights.published }).from(insights).where(eq(insights.id, id));
  if (row) await db.update(insights).set({ published: !row.published, updatedAt: new Date() }).where(eq(insights.id, id));
  revalidateSite();
}
