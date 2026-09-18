import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { ConfirmButton } from "@/components/admin/client";
import { Badge, EmptyState, LinkButton, PageHeader, PublishedBadge, buttonClass } from "@/components/admin/ui";
import { mediaLite } from "@/lib/admin-helpers";
import { deleteProject, moveProject, toggleProjectFeatured, toggleProjectPublished } from "./actions";

export const metadata = { title: "Projects" };

export default async function ProjectsAdminPage() {
  const rows = await db.select().from(projects).orderBy(asc(projects.sortOrder), desc(projects.createdAt));
  const covers = await mediaLite(rows.map((r) => r.coverImageId));
  const coverById = new Map(covers.map((c) => [c.id, c]));
  return (
    <>
      <PageHeader title="Projects" description="Detailed case studies. Only use information supplied by Tierytek — never invent clients or results." actions={<LinkButton href="/admin/projects/new">Add project</LinkButton>} />
      {rows.length === 0 ? (
        <EmptyState title="No projects yet" body="Project case studies will appear on the public site once published." action={<LinkButton href="/admin/projects/new">Add your first project</LinkButton>} />
      ) : (
        <ul className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          {rows.map((p, i) => {
            const cover = p.coverImageId ? coverById.get(p.coverImageId) : undefined;
            return (
              <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex shrink-0 gap-1">
                  <form action={moveProject.bind(null, p.id, -1)}><button className={buttonClass.ghost} disabled={i === 0} aria-label="Move up">↑</button></form>
                  <form action={moveProject.bind(null, p.id, 1)}><button className={buttonClass.ghost} disabled={i === rows.length - 1} aria-label="Move down">↓</button></form>
                </div>
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded bg-neutral-100">{cover && <img src={cover.thumb} alt="" className="h-full w-full object-cover" />}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/projects/${p.id}`} className="font-semibold text-neutral-900 hover:underline">{p.title}</Link>
                    <PublishedBadge published={p.published} />
                    {p.featured && <Badge tone="orange">Featured</Badge>}
                    {p.category && <Badge tone="blue">{p.category}</Badge>}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-neutral-500">{[p.client, p.location, p.year].filter(Boolean).join(" · ") || "No client/location yet"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/projects/${p.slug}`} target="_blank" className={buttonClass.ghost}>{p.published ? "View" : "Preview"} ↗</Link>
                  <form action={toggleProjectFeatured.bind(null, p.id)}><button className={buttonClass.ghost}>{p.featured ? "Unfeature" : "Feature"}</button></form>
                  <form action={toggleProjectPublished.bind(null, p.id)}><button className={buttonClass.secondary}>{p.published ? "Unpublish" : "Publish"}</button></form>
                  <Link href={`/admin/projects/${p.id}`} className={buttonClass.secondary}>Edit</Link>
                  <ConfirmButton action={deleteProject.bind(null, p.id)} message={`Delete "${p.title}"? Linked gallery items will remain but lose the link.`}>Delete</ConfirmButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
