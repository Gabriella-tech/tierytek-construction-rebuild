import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projectServices, projects, services } from "@/db/schema";
import { ActionForm } from "@/components/admin/ActionForm";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Alert, Card, Field, FormGrid, Input, PageHeader, Select, Textarea, Checkbox } from "@/components/admin/ui";
import { mediaLite } from "@/lib/admin-helpers";
import { saveService } from "../actions";

export const metadata = { title: "Edit service" };

export default async function ServiceEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const { created } = await searchParams;
  const isNew = id === "new";
  const service = isNew ? null : (await db.select().from(services).where(eq(services.id, Number(id))).limit(1))[0];
  if (!isNew && !service) notFound();

  const [allProjects, related, image] = await Promise.all([
    db.select({ id: projects.id, title: projects.title }).from(projects).orderBy(asc(projects.title)),
    service ? db.select({ projectId: projectServices.projectId }).from(projectServices).where(eq(projectServices.serviceId, service.id)) : [],
    mediaLite([service?.imageId]),
  ]);
  const relatedIds = new Set(related.map((r) => r.projectId));

  return (
    <>
      <PageHeader title={isNew ? "Add service" : `Edit: ${service!.title}`} description="Service pages target search terms naturally — describe what Tierytek actually does." />
      {created && <div className="mb-4"><Alert tone="green">Service created. You can keep editing below.</Alert></div>}
      <ActionForm action={saveService} submitLabel={isNew ? "Create service" : "Save changes"} cancelHref="/admin/services">
        {service && <input type="hidden" name="id" value={service.id} />}
        <Card title="Service details">
          <div className="space-y-5">
            <FormGrid>
              <Field label="Title" htmlFor="title" required><Input id="title" name="title" defaultValue={service?.title ?? ""} required /></Field>
              <Field label="URL slug" htmlFor="slug" hint="Leave blank to generate from the title."><Input id="slug" name="slug" defaultValue={service?.slug ?? ""} placeholder="steel-construction" /></Field>
              <Field label="Category" htmlFor="category">
                <Select id="category" name="category" defaultValue={service?.category ?? ""}>
                  <option value="">— none —</option>
                  {["Structural", "Building", "Design & Engineering", "Support"].map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
            </FormGrid>
            <Field label="Short summary" htmlFor="excerpt" hint="Shown on the Services page and homepage (max 400 characters)."><Textarea id="excerpt" name="excerpt" rows={3} defaultValue={service?.excerpt ?? ""} /></Field>
            <Field label="Capabilities" htmlFor="capabilities" hint="One per line."><Textarea id="capabilities" name="capabilities" rows={5} defaultValue={service?.capabilities.join("\n") ?? ""} /></Field>
            <Field label="Detailed description" htmlFor="content" hint="Formatting: '## Heading', '### Sub-heading', '- bullet', **bold**, blank line between paragraphs."><Textarea id="content" name="content" rows={14} defaultValue={service?.content ?? ""} /></Field>
            <MediaPicker name="imageId" label="Service image" initial={image} hint="Use a genuine Tierytek photo when available." />
          </div>
        </Card>
        <Card title="Related projects" description="Published projects linked here appear on the service page.">
          {allProjects.length === 0 ? (
            <p className="text-sm text-neutral-500">No projects yet — add projects first and link them here.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {allProjects.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="projectIds" value={p.id} defaultChecked={relatedIds.has(p.id)} className="h-4 w-4 rounded border-neutral-300 text-brand" /> {p.title}</label>
              ))}
            </div>
          )}
        </Card>
        <Card title="Publishing & SEO">
          <div className="space-y-5">
            <Checkbox name="published" label="Published" hint="Visible to visitors when checked." defaultChecked={service?.published ?? false} />
            <FormGrid>
              <Field label="SEO title" htmlFor="seoTitle" hint="Defaults to the service title."><Input id="seoTitle" name="seoTitle" defaultValue={service?.seoTitle ?? ""} maxLength={200} /></Field>
              <Field label="Meta description" htmlFor="seoDescription" hint="Up to ~160 characters."><Textarea id="seoDescription" name="seoDescription" rows={3} defaultValue={service?.seoDescription ?? ""} maxLength={320} /></Field>
            </FormGrid>
          </div>
        </Card>
      </ActionForm>
    </>
  );
}

