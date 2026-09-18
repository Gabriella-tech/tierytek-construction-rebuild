import Link from "next/link";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { PageHeader, buttonClass } from "@/components/admin/ui";
import { PAGE_DEFINITIONS } from "@/lib/page-fields";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Pages" };

export default async function PagesAdmin() {
  const rows = await db.select().from(pages);
  const byslug = new Map(rows.map((r) => [r.slug, r]));
  return (
    <>
      <PageHeader title="Pages" description="Edit the headings, copy and images of each public page. Structural layout stays consistent; the words and pictures are yours." />
      <ul className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        {PAGE_DEFINITIONS.map((d) => {
          const row = byslug.get(d.slug);
          return (
            <li key={d.slug} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/pages/${d.slug}`} className="font-semibold text-neutral-900 hover:underline">{d.title}</Link>
                <p className="text-sm text-neutral-500">{d.path} · {d.fields.length} editable fields{row ? ` · updated ${formatDateTime(row.updatedAt)}` : ""}</p>
              </div>
              <div className="flex gap-2">
                <Link href={d.path} target="_blank" className={buttonClass.ghost}>View ↗</Link>
                <Link href={`/admin/pages/${d.slug}`} className={buttonClass.secondary}>Edit</Link>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
