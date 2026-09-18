"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { galleryItems, insights, media, pages, projects, services, settings } from "@/db/schema";
import { requireActionUser, revalidateSite } from "@/lib/admin-helpers";
import { deleteImageVariants } from "@/lib/images";
import type { ActionState } from "@/lib/types";
import { str, toIntOrNull } from "@/lib/utils";

/** Where is each media item used? (for the "Used in" badges and safe deletion) */
export async function getMediaUsage(): Promise<Map<number, string[]>> {
  const usage = new Map<number, string[]>();
  const add = (id: number | null | undefined, label: string) => {
    if (!id) return;
    usage.set(id, [...(usage.get(id) ?? []), label]);
  };
  const [svc, prj, gal, ins, pgs, sets] = await Promise.all([
    db.select({ imageId: services.imageId, title: services.title }).from(services),
    db.select({ cover: projects.coverImageId, ids: projects.imageIds, title: projects.title }).from(projects),
    db.select({ ids: galleryItems.imageIds, title: galleryItems.title }).from(galleryItems),
    db.select({ imageId: insights.imageId, title: insights.title }).from(insights),
    db.select({ content: pages.content, title: pages.title }).from(pages),
    db.select().from(settings),
  ]);
  svc.forEach((s) => add(s.imageId, `Service: ${s.title}`));
  prj.forEach((p) => { add(p.cover, `Project: ${p.title}`); p.ids.forEach((id) => add(id, `Project: ${p.title}`)); });
  gal.forEach((g) => g.ids.forEach((id) => add(id, `Gallery: ${g.title}`)));
  ins.forEach((i) => add(i.imageId, `Article: ${i.title}`));
  pgs.forEach((p) => Object.entries(p.content).forEach(([k, v]) => { if (k.endsWith("ImageId") || k === "imageId") add(Number(v) || null, `Page: ${p.title}`); }));
  sets.forEach((s) => { if (s.key === "branding") Object.entries(s.value).forEach(([k, v]) => add(Number(v) || null, `Branding: ${k}`)); });
  return usage;
}

export async function updateMedia(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireActionUser();
  if (!auth.ok) return auth.state;
  const id = toIntOrNull(fd.get("id"));
  if (!id) return { error: "Missing media id." };
  await db.update(media).set({ alt: str(fd.get("alt")).slice(0, 300), caption: str(fd.get("caption")).slice(0, 1000) }).where(eq(media.id, id));
  revalidateSite();
  return { ok: true, message: "Saved." };
}

export async function deleteMedia(id: number): Promise<void> {
  if (!(await requireActionUser()).ok) return;
  const usage = await getMediaUsage();
  if (usage.get(id)?.length) return; // still in use — the UI disables the button, this is the safety net
  const [row] = await db.select().from(media).where(eq(media.id, id));
  if (!row) return;
  await db.delete(media).where(eq(media.id, id));
  await deleteImageVariants(row.variants).catch(() => undefined);
  revalidateSite();
}
