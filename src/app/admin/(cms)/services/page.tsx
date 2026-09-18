import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";
import { ConfirmButton } from "@/components/admin/client";
import { Badge, EmptyState, LinkButton, PageHeader, PublishedBadge, buttonClass } from "@/components/admin/ui";
import { deleteService, moveService, toggleServicePublished } from "./actions";

export const metadata = { title: "Services" };

export default async function ServicesAdminPage() {
  const rows = await db.select().from(services).orderBy(asc(services.sortOrder), asc(services.title));
  return (
    <>
      <PageHeader title="Services" description="The services shown on the website. Drag order is controlled with the arrows; unpublished services are hidden from visitors." actions={<LinkButton href="/admin/services/new">Add service</LinkButton>} />
      {rows.length === 0 ? (
        <EmptyState title="No services yet" action={<LinkButton href="/admin/services/new">Add your first service</LinkButton>} />
      ) : (
        <ul className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          {rows.map((s, i) => (
            <li key={s.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex shrink-0 gap-1">
                <form action={moveService.bind(null, s.id, -1)}><button className={buttonClass.ghost} disabled={i === 0} aria-label={`Move ${s.title} up`}>↑</button></form>
                <form action={moveService.bind(null, s.id, 1)}><button className={buttonClass.ghost} disabled={i === rows.length - 1} aria-label={`Move ${s.title} down`}>↓</button></form>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/services/${s.id}`} className="font-semibold text-neutral-900 hover:underline">{s.title}</Link>
                  <PublishedBadge published={s.published} />
                  {s.category && <Badge tone="blue">{s.category}</Badge>}
                </div>
                <p className="mt-0.5 truncate text-sm text-neutral-500">/services/{s.slug}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/services/${s.slug}`} target="_blank" className={buttonClass.ghost}>{s.published ? "View" : "Preview"} ↗</Link>
                <form action={toggleServicePublished.bind(null, s.id)}><button className={buttonClass.secondary}>{s.published ? "Unpublish" : "Publish"}</button></form>
                <Link href={`/admin/services/${s.id}`} className={buttonClass.secondary}>Edit</Link>
                <ConfirmButton action={deleteService.bind(null, s.id)} message={`Delete "${s.title}"? This cannot be undone.`}>Delete</ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
