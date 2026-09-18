import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { galleryItems, projects } from "@/db/schema";
import { ActionForm } from "@/components/admin/ActionForm";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Alert, Card, Checkbox, Field, FormGrid, Input, PageHeader, Select, Textarea } from "@/components/admin/ui";
import { mediaLite } from "@/lib/admin-helpers";
import { GALLERY_CATEGORIES } from "@/lib/constants";
import { saveGalleryItem } from "../actions";

export const metadata = { title: "Edit gallery item" };

export default async function GalleryEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const { created } = await searchParams;
  const isNew = id === "new";
  const item = isNew ? null : (await db.select().from(galleryItems).where(eq(galleryItems.id, Number(id))).limit(1))[0];
  if (!isNew && !item) notFound();
  const [allProjects, images] = await Promise.all([
    db.select({ id: projects.id, title: projects.title }).from(projects).orderBy(asc(projects.title)),
    mediaLite(item?.imageIds ?? []),
  ]);

  return (
    <>
      <PageHeader title={isNew ? "Add gallery item" : `Edit: ${item!.title}`} description="Step 1: upload images. Step 2: describe the work. Step 3: publish." />
      {created && <div className="mb-4"><Alert tone="green">Gallery item created. Publish it when ready.</Alert></div>}
      <ActionForm action={saveGalleryItem} submitLabel={isNew ? "Create gallery item" : "Save changes"} cancelHref="/admin/gallery">
        {item && <input type="hidden" name="id" value={item.id} />}
        <Card title="1. Images" description="Upload one or many photos of the completed work. Alt text for each image is edited in the Media Library.">
          <MediaPicker name="imageIds" label="Images" multiple initial={images} />
          <p className="mt-2 text-xs text-neutral-500">Tip: after uploading, open the <Link href="/admin/media" className="text-brand underline">Media Library</Link> to add descriptive alt text (e.g. “Steel portal frame warehouse, Ikeja”).</p>
        </Card>
        <Card title="2. Details">
          <div className="space-y-5">
            <FormGrid>
              <Field label="Title" htmlFor="title" required><Input id="title" name="title" defaultValue={item?.title ?? ""} required placeholder="e.g. Steel roof structure — warehouse" /></Field>
              <Field label="Category" htmlFor="category">
                <Select id="category" name="category" defaultValue={item?.category ?? ""}><option value="">— select —</option>{GALLERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
              </Field>
              <Field label="Client" htmlFor="client" hint="Optional — only with the client's agreement."><Input id="client" name="client" defaultValue={item?.client ?? ""} /></Field>
              <Field label="Project name" htmlFor="projectName"><Input id="projectName" name="projectName" defaultValue={item?.projectName ?? ""} /></Field>
              <Field label="Location" htmlFor="location"><Input id="location" name="location" defaultValue={item?.location ?? ""} /></Field>
              <Field label="Year" htmlFor="year"><Input id="year" name="year" defaultValue={item?.year ?? ""} /></Field>
            </FormGrid>
            <Field label="Caption" htmlFor="caption" hint="Short line shown under the image in the lightbox."><Input id="caption" name="caption" defaultValue={item?.caption ?? ""} maxLength={500} /></Field>
            <Field label="Description" htmlFor="description"><Textarea id="description" name="description" rows={4} defaultValue={item?.description ?? ""} /></Field>
          </div>
        </Card>
        <Card title="3. Options & publishing">
          <div className="space-y-5">
            <Field label="Related project (optional)" htmlFor="projectId" hint="Adds a 'View project' link. The gallery works independently of projects.">
              <Select id="projectId" name="projectId" defaultValue={item?.projectId ?? ""}><option value="">— none —</option>{allProjects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</Select>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Checkbox name="published" label="Published" hint="Visible in the public gallery." defaultChecked={item?.published ?? false} />
              <Checkbox name="featured" label="Featured" hint="Shown in the homepage gallery preview." defaultChecked={item?.featured ?? false} />
            </div>
          </div>
        </Card>
      </ActionForm>
    </>
  );
}
