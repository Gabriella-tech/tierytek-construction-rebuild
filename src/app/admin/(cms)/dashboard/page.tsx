import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { enquiries, galleryItems, insights, media, projects, services } from "@/db/schema";
import { Badge, Card, EmptyState, LinkButton, PageHeader } from "@/components/admin/ui";
import { imageSource } from "@/lib/queries";
import { ENQUIRY_STATUS_LABELS, formatDateTime } from "@/lib/utils";

async function count(table: typeof projects | typeof services | typeof galleryItems | typeof insights, published?: boolean) {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(table)
    .where(published === undefined ? undefined : eq(table.published, published));
  return row?.n ?? 0;
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams;
  const [pubProjects, draftProjects, pubGallery, draftGallery, pubServices, pubInsights, draftInsights, newEnquiries, recentEnquiries, recentMedia] =
    await Promise.all([
      count(projects, true),
      count(projects, false),
      count(galleryItems, true),
      count(galleryItems, false),
      count(services, true),
      count(insights, true),
      count(insights, false),
      db.select({ n: sql<number>`count(*)::int` }).from(enquiries).where(eq(enquiries.status, "new")).then((r) => r[0]?.n ?? 0),
      db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(6),
      db.select().from(media).orderBy(desc(media.createdAt)).limit(8),
    ]);

  const stats = [
    { label: "Published projects", value: pubProjects, sub: `${draftProjects} draft`, href: "/admin/projects" },
    { label: "Gallery items", value: pubGallery, sub: `${draftGallery} draft`, href: "/admin/gallery" },
    { label: "Published services", value: pubServices, href: "/admin/services" },
    { label: "Published insights", value: pubInsights, sub: `${draftInsights} draft`, href: "/admin/insights" },
    { label: "New enquiries", value: newEnquiries, href: "/admin/enquiries?status=new", highlight: newEnquiries > 0 },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Live overview of your website content and enquiries." actions={<><LinkButton href="/admin/gallery/new">Add gallery item</LinkButton><LinkButton href="/admin/projects/new" variant="secondary">Add project</LinkButton></>} />
      {denied && <p className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-inset ring-amber-600/20">That area requires administrator rights.</p>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`rounded-lg border bg-white p-4 shadow-sm transition hover:border-neutral-400 ${s.highlight ? "border-brand" : "border-neutral-200"}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{s.label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-neutral-900">{s.value}</p>
            {s.sub && <p className="text-xs text-neutral-500">{s.sub}</p>}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Recent enquiries" className="lg:col-span-2">
          {recentEnquiries.length === 0 ? (
            <EmptyState title="No enquiries yet" body="Submissions from the Contact and Request a Quote forms will appear here." />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {recentEnquiries.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/enquiries/${e.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 hover:bg-neutral-50">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-neutral-900">{e.name}{e.company ? ` · ${e.company}` : ""}</span>
                      <span className="block truncate text-xs text-neutral-500">{e.projectType || (e.type === "contact" ? "Contact message" : "Quote request")} · {formatDateTime(e.createdAt)}</span>
                    </span>
                    <Badge tone={e.status === "new" ? "orange" : e.status === "won" ? "green" : "gray"}>{ENQUIRY_STATUS_LABELS[e.status]}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Recent media">
          {recentMedia.length === 0 ? (
            <EmptyState title="No uploads yet" action={<LinkButton href="/admin/media" variant="secondary">Open Media Library</LinkButton>} />
          ) : (
            <ul className="grid grid-cols-4 gap-2">
              {recentMedia.map((m) => {
                const s = imageSource(m);
                return (
                  <li key={m.id}>
                    <Link href="/admin/media"><img src={s.thumb} alt={m.alt || m.filename} className="aspect-square w-full rounded object-cover" loading="lazy" /></Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
