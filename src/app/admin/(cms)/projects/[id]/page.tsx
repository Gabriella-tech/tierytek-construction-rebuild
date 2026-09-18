import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projectServices, projects, services } from "@/db/schema";
import { ActionForm } from "@/components/admin/ActionForm";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Alert, Card, Checkbox, Field, FormGrid, Input, PageHeader, Select, Textarea } from "@/components/admin/ui";
import { mediaLite } from "@/lib/admin-helpers";
import { PROJECT_CATEGORIES } from "@/lib/constants";
import { saveProject } from "../actions";

export const metadata = { title: "Edit project" };

export default async function ProjectEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const { created } = await searchParams;
  const isNew = id === "new";
  const project = isNew ? null : (await db.select().from(projects).where(eq(projects.id, Number(id))).limit(1))[0];
  if (!isNew && !project) notFound();
  const [allServices, related, cover, gallery] = await Promise.all([
    db.select({ id: services.id, title: services.title }).from(services).orderBy(asc(services.sortOrder)),
    project ? db.select({ serviceId: projectServices.serviceId }).from(projectServices).where(eq(projectServices.projectId, project.id)) : [],
    mediaLite([project?.coverImageId]),
    mediaLite(project?.imageIds ?? []),
  ]);
  const relatedIds = new Set(related.map((r) => r.serviceId));
  const text = (name: keyof NonNullable<typeof project>, label: string, rows = 5, hint?: string) => (
    <Field label={label} htmlFor={String(name)} hint={hint}><Textarea id={String(name)} name={String(name)} rows={rows} defaultValue={(project?.[name] as string) ?? ""} /></Field>
  );

  return (
    <>
      <PageHeader title={isNew ? "Add project" : `Edit: ${project!.title}`} description="Tell the story of a real project: scope, challenge, solution and results. Leave fields empty rather than guessing." />
      {created && <div className="mb-4"><Alert tone="green">Project created. You can keep editing below.</Alert></div>}
      <ActionForm action={saveProject} submitLabel={isNew ? "Create project" : "Save changes"} cancelHref="/admin/projects">
        {project && <input type="hidden" name="id" value={project.id} />}
        <Card title="Project details">
          <div className="space-y-5">
            <FormGrid>
              <Field label="Project title" htmlFor="title" required><Input id="title" name="title" defaultValue={project?.title ?? ""} required /></Field>
              <Field label="URL slug" htmlFor="slug" hint="Leave blank to generate from the title."><Input id="slug" name="slug" defaultValue={project?.slug ?? ""} /></Field>
              <Field label="Client" htmlFor="client" hint="Leave blank if not confirmed, or 'Confidential' if agreed with the client."><Input id="client" name="client" defaultValue={project?.client ?? ""} /></Field>
              <Field label="Location" htmlFor="location"><Input id="location" name="location" defaultValue={project?.location ?? ""} placeholder="e.g. Lekki, Lagos" /></Field>
              <Field label="Category" htmlFor="category">
                <Select id="category" name="category" defaultValue={project?.category ?? ""}><option value="">— select —</option>{PROJECT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
              </Field>
              <Field label="Completion year / date" htmlFor="year"><Input id="year" name="year" defaultValue={project?.year ?? ""} placeholder="e.g. 2024" /></Field>
            </FormGrid>
            <Field label="Short summary" htmlFor="excerpt" hint="One or two sentences for listings (max 400 characters)."><Textarea id="excerpt" name="excerpt" rows={2} defaultValue={project?.excerpt ?? ""} maxLength={400} /></Field>
            {text("overview", "Project overview", 6, "Formatting: '## Heading', '- bullet', **bold**, blank line between paragraphs.")}
            {text("scope", "Scope of work", 5)}
            {text("challenge", "Challenge", 4)}
            {text("solution", "Solution", 5)}
            {text("results", "Results", 4)}
          </div>
        </Card>
        <Card title="Images & video" description="Upload genuine photographs of this project. The first image is used as the cover unless a specific cover is chosen.">
          <div className="space-y-5">
            <MediaPicker name="coverImageId" label="Cover image" initial={cover} />
            <MediaPicker name="imageIds" label="Project images" multiple initial={gallery} hint="Drag & drop several images at once. Use the arrows to reorder." />
            <Field label="Video link (optional)" htmlFor="videoUrl" hint="A YouTube or Vimeo link."><Input id="videoUrl" name="videoUrl" type="url" defaultValue={project?.videoUrl ?? ""} placeholder="https://" /></Field>
          </div>
        </Card>
        <Card title="Related services">
          <div className="grid gap-2 sm:grid-cols-2">
            {allServices.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="serviceIds" value={s.id} defaultChecked={relatedIds.has(s.id)} className="h-4 w-4 rounded border-neutral-300 text-brand" /> {s.title}</label>
            ))}
          </div>
        </Card>
        <Card title="Publishing & SEO">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Checkbox name="published" label="Published" hint="Requires at least one image." defaultChecked={project?.published ?? false} />
              <Checkbox name="featured" label="Featured on homepage" defaultChecked={project?.featured ?? false} />
            </div>
            <FormGrid>
              <Field label="SEO title" htmlFor="seoTitle"><Input id="seoTitle" name="seoTitle" defaultValue={project?.seoTitle ?? ""} maxLength={200} /></Field>
              <Field label="Meta description" htmlFor="seoDescription"><Textarea id="seoDescription" name="seoDescription" rows={3} defaultValue={project?.seoDescription ?? ""} maxLength={320} /></Field>
            </FormGrid>
          </div>
        </Card>
      </ActionForm>
    </>
  );
}
