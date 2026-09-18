import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { ENQUIRY_STATUSES, enquiries, type EnquiryStatus } from "@/db/schema";
import { Badge, EmptyState, PageHeader, STATUS_TONE } from "@/components/admin/ui";
import { ENQUIRY_STATUS_LABELS, formatDateTime } from "@/lib/utils";

export const metadata = { title: "Enquiries" };

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = ENQUIRY_STATUSES.includes(status as EnquiryStatus) ? (status as EnquiryStatus) : undefined;
  const [rows, counts] = await Promise.all([
    db.select().from(enquiries).where(filter ? eq(enquiries.status, filter) : undefined).orderBy(desc(enquiries.createdAt)).limit(300),
    db.select({ status: enquiries.status, n: sql<number>`count(*)::int` }).from(enquiries).groupBy(enquiries.status),
  ]);
  const countBy = new Map(counts.map((c) => [c.status, c.n]));
  const total = counts.reduce((a, c) => a + c.n, 0);

  return (
    <>
      <PageHeader title="Enquiries" description="Quote requests and contact messages submitted through the website." />
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/enquiries" className={`rounded-full px-3 py-1 ${!filter ? "bg-neutral-900 text-white" : "bg-white ring-1 ring-neutral-300 hover:bg-neutral-100"}`}>All ({total})</Link>
        {ENQUIRY_STATUSES.map((s) => (
          <Link key={s} href={`/admin/enquiries?status=${s}`} className={`rounded-full px-3 py-1 ${filter === s ? "bg-neutral-900 text-white" : "bg-white ring-1 ring-neutral-300 hover:bg-neutral-100"}`}>{ENQUIRY_STATUS_LABELS[s]} ({countBy.get(s) ?? 0})</Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No enquiries" body="New submissions from the Contact and Request a Quote forms will be listed here." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Project</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.map((e) => (
                <tr key={e.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3"><Link href={`/admin/enquiries/${e.id}`} className="font-medium text-neutral-900 hover:underline">{e.name}</Link>{e.company && <span className="block text-xs text-neutral-500">{e.company}</span>}</td>
                  <td className="px-4 py-3 text-neutral-700">{e.projectType || (e.type === "contact" ? "Contact message" : "Quote request")}{e.location && <span className="block text-xs text-neutral-500">{e.location}</span>}</td>
                  <td className="px-4 py-3 text-neutral-700"><span className="block">{e.email}</span><span className="text-xs text-neutral-500">{e.phone}</span></td>
                  <td className="px-4 py-3 text-neutral-600">{formatDateTime(e.createdAt)}</td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONE[e.status]}>{ENQUIRY_STATUS_LABELS[e.status]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
