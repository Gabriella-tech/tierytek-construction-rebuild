"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projectServices, services } from "@/db/schema";
import { moveItem, nextSortOrder, parseIdList, requireActionUser, revalidateSite, uniqueSlug } from "@/lib/admin-helpers";
import type { ActionState } from "@/lib/types";
import { parseLines, slugify, str, toIntOrNull } from "@/lib/utils";

export async function saveService(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireActionUser();
  if (!auth.ok) return auth.state;

  const id = toIntOrNull(fd.get("id"));
  const title = str(fd.get("title"));
  const fieldErrors: Record<string, string> = {};
  if (title.length < 2) fieldErrors.title = "Title is required.";
  const excerpt = str(fd.get("excerpt"));
  if (excerpt.length > 400) fieldErrors.excerpt = "Keep the summary under 400 characters.";
  if (Object.keys(fieldErrors).length) return { error: "Please correct the highlighted fields.", fieldErrors };

  const slug = await uniqueSlug("services", slugify(str(fd.get("slug")) || title), id);
  const values = {
    title,
    slug,
    excerpt,
    content: str(fd.get("content")),
    capabilities: parseLines(str(fd.get("capabilities"))),
    category: str(fd.get("category")),
    imageId: parseIdList(fd.get("imageId"))[0] ?? null,
    published: fd.get("published") === "1",
    seoTitle: str(fd.get("seoTitle")).slice(0, 200),
    seoDescription: str(fd.get("seoDescription")).slice(0, 320),
    updatedAt: new Date(),
  };
  const relatedProjects = fd.getAll("projectIds").map(Number).filter((n) => Number.isInteger(n) && n > 0);

  let serviceId = id;
  if (id) {
    await db.update(services).set(values).where(eq(services.id, id));
  } else {
    const [row] = await db.insert(services).values({ ...values, sortOrder: await nextSortOrder("services") }).returning({ id: services.id });
    serviceId = row.id;
  }
  await db.delete(projectServices).where(eq(projectServices.serviceId, serviceId!));
  if (relatedProjects.length) {
    await db.insert(projectServices).values(relatedProjects.map((projectId) => ({ projectId, serviceId: serviceId! }))).onConflictDoNothing();
  }
  revalidateSite();
  if (!id) redirect(`/admin/services/${serviceId}?created=1`);
  return { ok: true, message: "Service saved." };
}

export async function deleteService(id: number): Promise<void> {
  if (!(await requireActionUser()).ok) return;
  await db.delete(services).where(eq(services.id, id));
  revalidateSite();
  redirect("/admin/services");
}

export async function toggleServicePublished(id: number): Promise<void> {
  if (!(await requireActionUser()).ok) return;
  const [row] = await db.select({ published: services.published }).from(services).where(eq(services.id, id));
  if (row) await db.update(services).set({ published: !row.published, updatedAt: new Date() }).where(eq(services.id, id));
  revalidateSite();
}

export async function moveService(id: number, dir: -1 | 1): Promise<void> {
  if (!(await requireActionUser()).ok) return;
  await moveItem("services", id, dir);
  revalidateSite();
}
