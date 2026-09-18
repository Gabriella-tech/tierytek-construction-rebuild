import { notFound } from "next/navigation";
import { ActionForm } from "@/components/admin/ActionForm";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Card, Field, FormGrid, Input, PageHeader, Textarea } from "@/components/admin/ui";
import { mediaLite } from "@/lib/admin-helpers";
import { getPageDefinition } from "@/lib/page-fields";
import { getPage } from "@/lib/queries";
import { savePage } from "../actions";

export const metadata = { title: "Edit page" };

export default async function PageEdit({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const def = getPageDefinition(slug);
  if (!def) notFound();
  const page = await getPage(slug);
  const imageFields = def.fields.filter((f) => f.type === "image");
  const images = await mediaLite(imageFields.map((f) => Number(page.content[f.key]) || null));
  const imageById = new Map(images.map((i) => [i.id, i]));

  return (
    <>
      <PageHeader title={`Edit page: ${def.title}`} description={`Public URL: ${def.path}`} />
      <ActionForm action={savePage} cancelHref="/admin/pages">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="title" value={page.title} />
        <Card title="Content">
          <div className="space-y-5">
            {def.fields.map((f) => {
              const value = page.content[f.key] ?? "";
              if (f.type === "image") {
                const current = imageById.get(Number(value));
                return <MediaPicker key={f.key} name={f.key} label={f.label} initial={current ? [current] : []} hint={f.hint} />;
              }
              if (f.type === "text") return <Field key={f.key} label={f.label} htmlFor={f.key} hint={f.hint}><Input id={f.key} name={f.key} defaultValue={value} /></Field>;
              return <Field key={f.key} label={f.label} htmlFor={f.key} hint={f.hint ?? (f.type === "list" ? "One item per line." : "Separate paragraphs with a blank line.")}><Textarea id={f.key} name={f.key} rows={f.type === "list" ? 5 : 5} defaultValue={value} /></Field>;
            })}
          </div>
        </Card>
        <Card title="SEO" description="Overrides for this page's title tag and meta description.">
          <FormGrid>
            <Field label="SEO title" htmlFor="seoTitle"><Input id="seoTitle" name="seoTitle" defaultValue={page.seoTitle} maxLength={200} /></Field>
            <Field label="Meta description" htmlFor="seoDescription"><Textarea id="seoDescription" name="seoDescription" rows={3} defaultValue={page.seoDescription} maxLength={320} /></Field>
          </FormGrid>
        </Card>
      </ActionForm>
    </>
  );
}
