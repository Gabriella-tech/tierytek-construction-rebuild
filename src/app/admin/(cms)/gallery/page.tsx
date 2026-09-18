import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { galleryItems } from "@/db/schema";
import { ConfirmButton } from "@/components/admin/client";
import { Badge, EmptyState, LinkButton, PageHeader, PublishedBadge, buttonClass } from "@/components/admin/ui";
import { mediaLite } from "@/lib/admin-helpers";
import { GALLERY_CATEGORIES } from "@/lib/constants";
import { deleteGalleryItem, moveGalleryItem, toggleGalleryFeatured, toggleGalleryPublished } from "./actions";

export const metadata = { title: "Gallery" };

export default async function GalleryAdminPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const rows = await db
    .select()
    .from(galleryItems)
    .where(category ? eq(galleryItems.category, category) : undefined)
    .orderBy(asc(galleryItems.sortOrder), desc(galleryItems.createdAt));
  const thumbs = await mediaLite(rows.map((r) => r.imageIds[0]));
  const thumbById = new Map(thumbs.map((t) => [t.id, t]));

  return (
    <>
      <PageHeader title="Gallery" description="A visual board of completed work. Each item can hold several images and can optionally link to a detailed project." actions={<LinkButton href="/admin/gallery/new">Add gallery item</LinkButton>} />
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/gallery" className={`rounded-full px-3 py-1 ${!category ? "bg-neutral-900 text-white" : "bg-white ring-1 ring-neutral-300 hover:bg-neutral-100"}`}>All</Link>
        {GALLERY_CATEGORIES.map((c) => (
          <Link key={c} href={`/admin/gallery?category=${encodeURIComponent(c)}`} className={`rounded-full px-3 py-1 ${category === c ? "bg-neutral-900 text-white" : "bg-white ring-1 ring-neutral-300 hover:bg-neutral-100"}`}>{c}</Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No gallery items" body="Upload photos of completed work to build the public gallery." action={<LinkButton href="/admin/gallery/new">Add gallery item</LinkButton>} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((g, i) => {
            const thumb = thumbById.get(g.imageIds[0]);
            return (
              <li key={g.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
                <Link href={`/admin/gallery/${g.id}`} className="block aspect-[4/3] bg-neutral-100">{thumb && <img src={thumb.thumb} alt={thumb.alt || g.title} className="h-full w-full object-cover" loading="lazy" />}</Link>
                <div className="p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/gallery/${g.id}`} className="font-semibold text-neutral-900 hover:underline">{g.title}</Link>
                    <PublishedBadge published={g.published} />
                    {g.featured && <Badge tone="orange">Featured</Badge>}
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-500">{[g.category, g.client, g.location, g.year].filter(Boolean).join(" · ")} · {g.imageIds.length} image{g.imageIds.length === 1 ? "" : "s"}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <form action={moveGalleryItem.bind(null, g.id, -1)}><button className={buttonClass.ghost} disabled={i === 0} aria-label="Move earlier">↑</button></form>
                    <form action={moveGalleryItem.bind(null, g.id, 1)}><button className={buttonClass.ghost} disabled={i === rows.length - 1} aria-label="Move later">↓</button></form>
                    <form action={toggleGalleryFeatured.bind(null, g.id)}><button className={buttonClass.ghost}>{g.featured ? "Unfeature" : "Feature"}</button></form>
                    <form action={toggleGalleryPublished.bind(null, g.id)}><button className={buttonClass.secondary}>{g.published ? "Unpublish" : "Publish"}</button></form>
                    <Link href={`/admin/gallery/${g.id}`} className={buttonClass.secondary}>Edit</Link>
                    <ConfirmButton action={deleteGalleryItem.bind(null, g.id)} message={`Delete "${g.title}" from the gallery? Images stay in the Media Library.`}>Delete</ConfirmButton>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
