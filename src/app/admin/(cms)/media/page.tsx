import { desc, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { ConfirmButton } from "@/components/admin/client";
import { Badge, EmptyState, PageHeader, inputClass } from "@/components/admin/ui";
import { imageSource } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { deleteMedia, getMediaUsage, updateMedia } from "./actions";
import { MediaEditForm, UploadZone } from "./MediaTools";

export const metadata = { title: "Media Library" };

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ q?: string; missing?: string }> }) {
  const { q = "", missing } = await searchParams;
  const rows = await db
    .select()
    .from(media)
    .where(q ? or(ilike(media.filename, `%${q}%`), ilike(media.alt, `%${q}%`), ilike(media.caption, `%${q}%`)) : undefined)
    .orderBy(desc(media.createdAt))
    .limit(200);
  const usage = await getMediaUsage();
  const list = missing ? rows.filter((r) => !r.alt) : rows;
  const missingCount = rows.filter((r) => !r.alt).length;

  return (
    <>
      <PageHeader title="Media Library" description="All uploaded images. Add meaningful alt text to every image — it is used on the public site and by search engines." />
      <UploadZone />
      <form className="mb-4 flex flex-wrap items-center gap-2" method="get">
        <input type="search" name="q" defaultValue={q} placeholder="Search file name, alt text, caption…" className={`${inputClass} max-w-sm`} />
        <button className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50">Search</button>
        {missingCount > 0 && (
          <a href={missing ? "/admin/media" : "/admin/media?missing=1"} className="ml-auto text-sm font-medium text-amber-700 hover:underline">{missing ? "Show all" : `${missingCount} without alt text →`}</a>
        )}
      </form>
      {list.length === 0 ? (
        <EmptyState title={q ? "No images match your search" : "No images uploaded yet"} body="Upload images above; they become available in every image picker." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((m) => {
            const s = imageSource(m);
            const used = usage.get(m.id) ?? [];
            return (
              <li key={m.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
                <a href={s.original} target="_blank" rel="noreferrer" className="block bg-neutral-100"><img src={s.thumb} alt={m.alt || m.filename} className="aspect-[4/3] w-full object-cover" loading="lazy" /></a>
                <div className="space-y-3 p-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                    <span className="truncate font-medium text-neutral-800" title={m.filename}>{m.filename}</span>
                    <span>{m.width}×{m.height}</span>
                    <span>{Math.round(m.size / 1024)} KB</span>
                    <span>{formatDate(m.createdAt, { dateStyle: "medium" })}</span>
                    {!m.alt && <Badge tone="orange">No alt text</Badge>}
                  </div>
                  {used.length > 0 ? (
                    <p className="text-xs text-neutral-600"><span className="font-medium">Used in:</span> {Array.from(new Set(used)).slice(0, 4).join(", ")}{used.length > 4 ? ` +${used.length - 4} more` : ""}</p>
                  ) : (
                    <p className="text-xs text-neutral-400">Not used anywhere yet.</p>
                  )}
                  <MediaEditForm id={m.id} alt={m.alt} caption={m.caption} action={updateMedia} />
                  <div className="flex justify-end">
                    {used.length ? (
                      <span className="text-xs text-neutral-400" title="Remove it from the content listed above first.">In use — cannot delete</span>
                    ) : (
                      <ConfirmButton action={deleteMedia.bind(null, m.id)} message={`Permanently delete ${m.filename}?`}>Delete</ConfirmButton>
                    )}
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
