import Link from "next/link";
import type { Metadata } from "next";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { GalleryBoard, type GalleryBoardItem } from "@/components/site/GalleryBoard";
import { CtaBand, PublicEmptyState, Section, SectionHeading } from "@/components/site/primitives";
import { pageMetadata } from "@/lib/page-meta";
import { getMediaByIds, getPage, getPublishedGallery, pickImages } from "@/lib/queries";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("gallery", "/gallery", "Gallery — Completed Steel Construction, Roofing & Renovation Work");
}

export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ category?: string; project?: string }> }) {
  const { category, project: projectSlug } = await searchParams;
  const [page, all] = await Promise.all([getPage("gallery"), getPublishedGallery()]);
  const c = page.content;
  const projectIds = Array.from(new Set(all.map((g) => g.projectId).filter((v): v is number => !!v)));
  const linkedProjects = projectIds.length ? await db.select({ id: projects.id, slug: projects.slug, title: projects.title }).from(projects).where(inArray(projects.id, projectIds)) : [];
  const projectById = new Map(linkedProjects.map((p) => [p.id, p]));
  const activeProject = projectSlug ? linkedProjects.find((p) => p.slug === projectSlug) ?? (await db.select({ id: projects.id, slug: projects.slug, title: projects.title }).from(projects).where(eq(projects.slug, projectSlug)))[0] : undefined;

  const categories = Array.from(new Set(all.map((g) => g.category).filter(Boolean)));
  const filtered = all.filter((g) => (!category || g.category === category) && (!activeProject || g.projectId === activeProject.id));
  const mediaMap = await getMediaByIds(filtered.flatMap((g) => g.imageIds));
  const items: GalleryBoardItem[] = filtered
    .map((g) => ({
      id: g.id, title: g.title, category: g.category, client: g.client, projectName: g.projectName, location: g.location, year: g.year, caption: g.caption, description: g.description,
      projectSlug: g.projectId ? projectById.get(g.projectId)?.slug ?? null : null,
      images: pickImages(g.imageIds, mediaMap, g.title),
    }))
    .filter((g) => g.images.length > 0);

  return (
    <>
      <Section className="pb-10 sm:pb-12 lg:pb-12">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Gallery", path: "/gallery" }]} />
        <SectionHeading as="h1" eyebrow={c.eyebrow} title={c.heading} body={c.intro} className="mt-8" />
        {activeProject && (
          <p className="mt-6 text-sm text-ink/70">Showing gallery entries for <Link href={`/projects/${activeProject.slug}`} className="font-semibold text-brand underline underline-offset-4">{activeProject.title}</Link>. <Link href="/gallery" className="underline underline-offset-4">Show all</Link></p>
        )}
        {categories.length > 1 && !activeProject && (
          <nav aria-label="Filter by category" className="mt-10 flex flex-wrap gap-2">
            <Link href="/gallery" className={cn("border px-3 py-1.5 text-sm font-medium", !category ? "border-ink bg-ink text-white" : "border-ink/15 hover:border-brand hover:text-brand")} aria-current={!category ? "page" : undefined}>All</Link>
            {categories.map((cat) => (
              <Link key={cat} href={`/gallery?category=${encodeURIComponent(cat)}`} className={cn("border px-3 py-1.5 text-sm font-medium", category === cat ? "border-ink bg-ink text-white" : "border-ink/15 hover:border-brand hover:text-brand")} aria-current={category === cat ? "page" : undefined}>{cat}</Link>
            ))}
          </nav>
        )}
      </Section>
      <Section tone="surface" className="pt-0 sm:pt-0 lg:pt-0">
        <div className="pt-12">
          {items.length === 0 ? (
            <PublicEmptyState title={category || activeProject ? "No gallery items match this filter." : "No gallery items have been published yet."} body={category || activeProject ? "Try another category." : "Photographs of completed work will appear here as they are published."} cta={category || activeProject ? { href: "/gallery", label: "View the full gallery" } : { href: "/services", label: "Explore our services" }} />
          ) : (
            <>
              <p className="mb-6 text-sm text-ink/50">{items.length} {items.length === 1 ? "entry" : "entries"}{category ? ` in ${category}` : ""}. Select an image to view it full screen.</p>
              <GalleryBoard items={items} />
            </>
          )}
        </div>
      </Section>
      <CtaBand heading="Like what you see?" body="Tell us about your project and we will take it from there." />
    </>
  );
}
