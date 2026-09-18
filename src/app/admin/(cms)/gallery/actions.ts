"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { galleryItems } from "@/db/schema";
import { moveItem, nextSortOrder, parseIdList, requireActionUser, revalidateSite } from "@/lib/admin-helpers";
import type { ActionState } from "@/lib/types";
import { str, toIntOrNull } from "@/lib/utils";

export async function saveGalleryItem(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireActionUser();
  if (!auth.ok) return auth.state;
  const id = toIntOrNull(fd.get("id"));
  const title = str(fd.get("title"));
  const imageIds = parseIdList(fd.get("imageIds"));
  const fieldErrors: Record<string, string> = {};
  if (title.length < 2) fieldErrors.title = "Title is required.";
  if (!imageIds.length) fieldErrors.images = "Upload or choose at least one image.";
  if (Object.keys(fieldErrors).length) return { error: "Please correct the highlighted fields.", fieldErrors };

  const values = {
    title,
    client: str(fd.get("client")),
    projectName: str(fd.get("projectName")),
    location: str(fd.get("location")),
    category: str(fd.get("category")),
    description: str(fd.get("description")),
    caption: str(fd.get("caption")).slice(0, 500),
    year: str(fd.get("year")).slice(0, 40),
    imageIds,
    projectId: toIntOrNull(fd.get("projectId")),
    featured: fd.get("featured") === "1",
    published: fd.get("published") === "1",
    updatedAt: new Date(),
  };
  let itemId = id;
  if (id) await db.update(galleryItems).set(values).where(eq(galleryItems.id, id));
  else {
    const [row] = await db.insert(galleryItems).values({ ...values, sortOrder: await nextSortOrder("gallery_items") }).returning({ id: galleryItems.id });
    itemId = row.id;
  }
  revalidateSite();
  if (!id) redirect(`/admin/gallery/${itemId}?created=1`);
  return { ok: true, message: "Gallery item saved." };
}

export async function deleteGalleryItem(id: number): Promise<void> {
  if (!(await requireActionUser()).ok) return;
  await db.delete(galleryItems).where(eq(galleryItems.id, id));
  revalidateSite();
  redirect("/admin/gallery");
}
export async function toggleGalleryPublished(id: number): Promise<void> {
  if (!(await requireActionUser()).ok) return;
  const [row] = await db.select({ published: galleryItems.published }).from(galleryItems).where(eq(galleryItems.id, id));
  if (row) await db.update(galleryItems).set({ published: !row.published, updatedAt: new Date() }).where(eq(galleryItems.id, id));
  revalidateSite();
}
export async function toggleGalleryFeatured(id: number): Promise<void> {
  if (!(await requireActionUser()).ok) return;
  const [row] = await db.select({ featured: galleryItems.featured }).from(galleryItems).where(eq(galleryItems.id, id));
  if (row) await db.update(galleryItems).set({ featured: !row.featured, updatedAt: new Date() }).where(eq(galleryItems.id, id));
  revalidateSite();
}
export async function moveGalleryItem(id: number, dir: -1 | 1): Promise<void> {
  if (!(await requireActionUser()).ok) return;
  await moveItem("gallery_items", id, dir);
  revalidateSite();
}
