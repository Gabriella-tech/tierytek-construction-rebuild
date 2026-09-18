"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projectServices, projects } from "@/db/schema";
import { moveItem, nextSortOrder, parseIdList, requireActionUser, revalidateSite, uniqueSlug } from "@/lib/admin-helpers";
import type { ActionState } from "@/lib/types";
import { isSafeHref, slugify, str, toIntOrNull } from "@/lib/utils";

export async function saveProject(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireActionUser();
  if (!auth.ok) return auth.state;
  const id = toIntOrNull(fd.get("id"));
  const title = str(fd.get("title"));
  const fieldErrors: Record<string, string> = {};
  if (title.length < 2) fieldErrors.title = "Title is required.";
  const videoUrl = str(fd.get("videoUrl"));
  if (videoUrl && !/^https:\/\//.test(videoUrl)) fieldErrors.videoUrl = "Enter a full https:// video link (e.g. YouTube or Vimeo).";
  const imageIds = parseIdList(fd.get("imageIds"));
  const coverImageId = parseIdList(fd.get("coverImageId"))[0] ?? imageIds[0] ?? null;
  const published = fd.get("published") === "1";
  if (published && !coverImageId) fieldErrors.coverImage = "Add at least one image before publishing a project.";
  if (Object.keys(fieldErrors).length) return { error: "Please correct the highlighted fields.", fieldErrors };

  const slug = await uniqueSlug("projects", slugify(str(fd.get("slug")) || title), id);
  const values = {
    title, slug,
    client: str(fd.get("client")),
    location: str(fd.get("location")),
    category: str(fd.get("category")),
    year: str(fd.get("year")).slice(0, 40),
    excerpt: str(fd.get("excerpt")).slice(0, 400),
    overview: str(fd.get("overview")),
    scope: str(fd.get("scope")),
    challenge: str(fd.get("challenge")),
    solution: str(fd.get("solution")),
    results: str(fd.get("results")),
    coverImageId, imageIds,
    videoUrl: isSafeHref(videoUrl) ? videoUrl : "",
    featured: fd.get("featured") === "1",
    published,
    seoTitle: str(fd.get("seoTitle")).slice(0, 200),
    seoDescription: str(fd.get("seoDescription")).slice(0, 320),
    updatedAt: new Date(),
  };
  const serviceIds = fd.getAll("serviceIds").map(Number).filter((n) => Number.isInteger(n) && n > 0);

  let projectId = id;
  if (id) await db.update(projects).set(values).where(eq(projects.id, id));
  else {
    const [row] = await db.insert(projects).values({ ...values, sortOrder: await nextSortOrder("projects") }).returning({ id: projects.id });
    projectId = row.id;
  }
  await db.delete(projectServices).where(eq(projectServices.projectId, projectId!));
  if (serviceIds.length) await db.insert(projectServices).values(serviceIds.map((serviceId) => ({ projectId: projectId!, serviceId }))).onConflictDoNothing();
  revalidateSite();
  if (!id) redirect(`/admin/projects/${projectId}?created=1`);
  return { ok: true, message: "Project saved." };
}

export async function deleteProject(id: number): Promise<void> {
  if (!(await requireActionUser()).ok) return;
  await db.delete(projects).where(eq(projects.id, id));
  revalidateSite();
  redirect("/admin/projects");
}
export async function toggleProjectPublished(id: number): Promise<void> {
  if (!(await requireActionUser()).ok) return;
  const [row] = await db.select({ published: projects.published, cover: projects.coverImageId }).from(projects).where(eq(projects.id, id));
  if (row && (row.published || row.cover)) await db.update(projects).set({ published: !row.published, updatedAt: new Date() }).where(eq(projects.id, id));
  revalidateSite();
}
export async function toggleProjectFeatured(id: number): Promise<void> {
  if (!(await requireActionUser()).ok) return;
  const [row] = await db.select({ featured: projects.featured }).from(projects).where(eq(projects.id, id));
  if (row) await db.update(projects).set({ featured: !row.featured, updatedAt: new Date() }).where(eq(projects.id, id));
  revalidateSite();
}
export async function moveProject(id: number, dir: -1 | 1): Promise<void> {
  if (!(await requireActionUser()).ok) return;
  await moveItem("projects", id, dir);
  revalidateSite();
}
