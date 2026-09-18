/**
 * Read-side data access for the public website and admin screens.
 */
import { cache } from "react";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  galleryItems,
  insights,
  media,
  pages,
  projectServices,
  projects,
  services,
  type GalleryItem,
  type Insight,
  type Media,
  type Project,
  type Service,
} from "@/db/schema";
import { fileUrl } from "@/lib/storage";
import { getPageDefinition } from "@/lib/page-fields";

/* ------------------------------ Media ------------------------------ */

export type ImageSource = {
  id: number;
  src: string;
  srcSet: string;
  thumb: string;
  large: string;
  original: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
};

/** Plain, serialisable image props (safe to pass to client components). */
export function imageSource(m: Media, altFallback = ""): ImageSource {
  const v = m.variants;
  const medium = v.medium ?? v.original;
  const parts: string[] = [];
  if (v.thumb) parts.push(`${fileUrl(v.thumb.key)} ${v.thumb.width}w`);
  if (v.medium) parts.push(`${fileUrl(v.medium.key)} ${v.medium.width}w`);
  if (v.large) parts.push(`${fileUrl(v.large.key)} ${v.large.width}w`);
  if (!parts.length) parts.push(`${fileUrl(v.original.key)} ${v.original.width}w`);
  return {
    id: m.id,
    src: fileUrl(medium.key),
    srcSet: parts.join(", "),
    thumb: fileUrl((v.thumb ?? medium).key),
    large: fileUrl((v.large ?? v.original).key),
    original: fileUrl(v.original.key),
    width: medium.width,
    height: medium.height,
    alt: m.alt || altFallback,
    caption: m.caption,
  };
}

export async function getMediaByIds(ids: Array<number | null | undefined>): Promise<Map<number, Media>> {
  const clean = Array.from(new Set(ids.filter((i): i is number => typeof i === "number" && i > 0)));
  if (!clean.length) return new Map();
  const rows = await db.select().from(media).where(inArray(media.id, clean));
  return new Map(rows.map((r) => [r.id, r]));
}

export async function getMediaById(id: number | null | undefined): Promise<Media | null> {
  if (!id) return null;
  const [row] = await db.select().from(media).where(eq(media.id, id)).limit(1);
  return row ?? null;
}

export async function getImage(id: number | null | undefined, alt = ""): Promise<ImageSource | null> {
  const m = await getMediaById(id);
  return m ? imageSource(m, alt) : null;
}

/** Resolve an ordered list of media IDs into image sources (missing IDs skipped). */
export function pickImages(ids: number[], map: Map<number, Media>, alt = ""): ImageSource[] {
  return ids.map((id) => map.get(id)).filter((m): m is Media => !!m).map((m) => imageSource(m, alt));
}

/* ------------------------------ Pages ------------------------------ */

export type PageContent = {
  slug: string;
  title: string;
  content: Record<string, string>;
  seoTitle: string;
  seoDescription: string;
};

export const getPage = cache(async (slug: string): Promise<PageContent> => {
  const def = getPageDefinition(slug);
  const [row] = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
  return {
    slug,
    title: row?.title ?? def?.title ?? slug,
    content: { ...(def?.defaults ?? {}), ...(row?.content ?? {}) },
    seoTitle: row?.seoTitle ?? "",
    seoDescription: row?.seoDescription ?? "",
  };
});

/* ----------------------------- Services ---------------------------- */

export const getPublishedServices = cache(async (): Promise<Service[]> =>
  db.select().from(services).where(eq(services.published, true)).orderBy(asc(services.sortOrder), asc(services.title)),
);

export async function getServiceBySlug(slug: string, includeDrafts = false): Promise<Service | null> {
  const [row] = await db
    .select()
    .from(services)
    .where(includeDrafts ? eq(services.slug, slug) : and(eq(services.slug, slug), eq(services.published, true)))
    .limit(1);
  return row ?? null;
}

export async function getServiceProjects(serviceId: number): Promise<Project[]> {
  const rows = await db
    .select({ project: projects })
    .from(projectServices)
    .innerJoin(projects, eq(projectServices.projectId, projects.id))
    .where(and(eq(projectServices.serviceId, serviceId), eq(projects.published, true)))
    .orderBy(asc(projects.sortOrder), desc(projects.createdAt));
  return rows.map((r) => r.project);
}

/* ----------------------------- Projects ---------------------------- */

export async function getPublishedProjects(opts: { featuredOnly?: boolean; limit?: number } = {}): Promise<Project[]> {
  const where = opts.featuredOnly
    ? and(eq(projects.published, true), eq(projects.featured, true))
    : eq(projects.published, true);
  const q = db.select().from(projects).where(where).orderBy(asc(projects.sortOrder), desc(projects.createdAt));
  return opts.limit ? q.limit(opts.limit) : q;
}

export async function getProjectBySlug(slug: string, includeDrafts = false): Promise<Project | null> {
  const [row] = await db
    .select()
    .from(projects)
    .where(includeDrafts ? eq(projects.slug, slug) : and(eq(projects.slug, slug), eq(projects.published, true)))
    .limit(1);
  return row ?? null;
}

export async function getProjectServices(projectId: number): Promise<Service[]> {
  const rows = await db
    .select({ service: services })
    .from(projectServices)
    .innerJoin(services, eq(projectServices.serviceId, services.id))
    .where(and(eq(projectServices.projectId, projectId), eq(services.published, true)))
    .orderBy(asc(services.sortOrder));
  return rows.map((r) => r.service);
}

/* ------------------------------ Gallery ---------------------------- */

export async function getPublishedGallery(opts: { featuredOnly?: boolean; limit?: number } = {}): Promise<GalleryItem[]> {
  const where = opts.featuredOnly
    ? and(eq(galleryItems.published, true), eq(galleryItems.featured, true))
    : eq(galleryItems.published, true);
  const q = db.select().from(galleryItems).where(where).orderBy(asc(galleryItems.sortOrder), desc(galleryItems.createdAt));
  return opts.limit ? q.limit(opts.limit) : q;
}

export async function getGalleryForProject(projectId: number): Promise<GalleryItem[]> {
  return db
    .select()
    .from(galleryItems)
    .where(and(eq(galleryItems.projectId, projectId), eq(galleryItems.published, true)))
    .orderBy(asc(galleryItems.sortOrder));
}

/* ------------------------------ Insights --------------------------- */

export async function getPublishedInsights(opts: { limit?: number } = {}): Promise<Insight[]> {
  const q = db
    .select()
    .from(insights)
    .where(eq(insights.published, true))
    .orderBy(desc(insights.publishedAt), desc(insights.createdAt));
  return opts.limit ? q.limit(opts.limit) : q;
}

export async function getInsightBySlug(slug: string, includeDrafts = false): Promise<Insight | null> {
  const [row] = await db
    .select()
    .from(insights)
    .where(includeDrafts ? eq(insights.slug, slug) : and(eq(insights.slug, slug), eq(insights.published, true)))
    .limit(1);
  return row ?? null;
}
