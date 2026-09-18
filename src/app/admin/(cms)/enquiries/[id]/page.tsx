import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ENQUIRY_STATUSES, enquiries } from "@/db/schema";
import { ActionForm } from "@/components/admin/ActionForm";
import { ConfirmButton } from "@/components/admin/client";
import { Badge, Card, Field, PageHeader, STATUS_TONE, Select, Textarea } from "@/components/admin/ui";
import { fileUrl } from "@/lib/storage";
import { ENQUIRY_STATUS_LABELS, formatDateTime, telHref } from "@/lib/utils";
import { deleteEnquiry, updateEnquiry } from "../actions";

export const metadata = { title: "Enquiry" };

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e] = await db.select().from(enquiries).where(eq(enquiries.id, Number(id))).limit(1);
  if (!e) notFound();
  const rows: Array<[string, string]> = [
    ["Type", e.type === "contact" ? "Contact message" : "Quote request"],
    ["Company", e.company],
    ["Project type", e.projectType],
    ["Location", e.location],
    ["Estimated budget", e.budget],
    ["Preferred contact", e.preferredContact],
    ["Submitted", formatDateTime(e.createdAt)],
    ["Last updated", formatDateTime(e.updatedAt)],
  ];

  return (
    <>
      <PageHeader title={e.name} description={e.company || undefined} actions={<Link href="/admin/enquiries" className="text-sm font-medium text-neutral-600 hover:underline">← All enquiries</Link>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Message">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">{e.message}</p>
            {e.attachmentKey && (
              <p className="mt-4 text-sm"><span className="font-medium">Attachment:</span> <a href={fileUrl(e.attachmentKey)} target="_blank" rel="noreferrer" className="text-brand underline">{e.attachmentName || "Download"}</a></p>
            )}
          </Card>
          <Card title="Details">
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <div><dt className="text-xs uppercase tracking-wide text-neutral-500">Email</dt><dd className="text-sm"><a href={`mailto:${e.email}`} className="text-brand underline">{e.email}</a></dd></div>
              <div><dt className="text-xs uppercase tracking-wide text-neutral-500">Phone</dt><dd className="text-sm">{e.phone ? <a href={telHref(e.phone)} className="text-brand underline">{e.phone}</a> : "—"}</dd></div>
              {rows.map(([k, v]) => (<div key={k}><dt className="text-xs uppercase tracking-wide text-neutral-500">{k}</dt><dd className="text-sm text-neutral-800">{v || "—"}</dd></div>))}
            </dl>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Status & notes">
            <p className="mb-3"><Badge tone={STATUS_TONE[e.status]}>{ENQUIRY_STATUS_LABELS[e.status]}</Badge></p>
            <ActionForm action={updateEnquiry} submitLabel="Update enquiry">
              <input type="hidden" name="id" value={e.id} />
              <Field label="Status" htmlFor="status"><Select id="status" name="status" defaultValue={e.status}>{ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{ENQUIRY_STATUS_LABELS[s]}</option>)}</Select></Field>
              <Field label="Internal notes" htmlFor="notes" hint="Never shown to the visitor."><Textarea id="notes" name="notes" rows={6} defaultValue={e.notes} /></Field>
            </ActionForm>
          </Card>
          <Card title="Danger zone">
            <ConfirmButton action={deleteEnquiry.bind(null, e.id)} message="Delete this enquiry permanently?">Delete enquiry</ConfirmButton>
          </Card>
        </div>
      </div>
    </>
  );
}
