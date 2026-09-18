import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { insights } from "@/db/schema";
import { ConfirmButton } from "@/components/admin/client";
import { Badge, EmptyState, LinkButton, PageHeader, PublishedBadge, buttonClass } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";
import { deleteInsight, toggleInsightPublished } from "./actions";

export const metadata = { title: "Insights" };

export default async function InsightsAdminPage() {
  const rows = await db.select().from(insights).orderBy(desc(insights.publishedAt), desc(insights.createdAt));
  return (
    <>
      <PageHeader title="Insights & news" description="Articles and company news. Items migrated from the old website are saved as drafts — verify them before publishing." actions={<LinkButton href="/admin/insights/new">New article</LinkButton>} />
      {rows.length === 0 ? (
        <EmptyState title="No articles yet" action={<LinkButton href="/admin/insights/new">Write the first article</LinkButton>} />
      ) : (
        <ul className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          {rows.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/insights/${p.id}`} className="font-semibold text-neutral-900 hover:underline">{p.title}</Link>
                  <PublishedBadge published={p.published} />
                  {p.featured && <Badge tone="orange">Featured</Badge>}
                  {p.category && <Badge tone="blue">{p.category}</Badge>}
                </div>
                <p className="mt-0.5 text-sm text-neutral-500">{formatDate(p.publishedAt ?? p.createdAt)}{p.author ? ` · ${p.author}` : ""}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/insights/${p.slug}`} target="_blank" className={buttonClass.ghost}>{p.published ? "View" : "Preview"} ↗</Link>
                <form action={toggleInsightPublished.bind(null, p.id)}><button className={buttonClass.secondary}>{p.published ? "Unpublish" : "Publish"}</button></form>
                <Link href={`/admin/insights/${p.id}`} className={buttonClass.secondary}>Edit</Link>
                <ConfirmButton action={deleteInsight.bind(null, p.id)} message={`Delete "${p.title}"?`}>Delete</ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
