import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { insights } from "@/db/schema";
import { ActionForm } from "@/components/admin/ActionForm";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Alert, Card, Checkbox, Field, FormGrid, Input, PageHeader, Select, Textarea } from "@/components/admin/ui";
import { mediaLite } from "@/lib/admin-helpers";
import { INSIGHT_CATEGORIES } from "@/lib/constants";
import { saveInsight } from "../actions";

export const metadata = { title: "Edit article" };

export default async function InsightEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const { created } = await searchParams;
  const isNew = id === "new";
  const post = isNew ? null : (await db.select().from(insights).where(eq(insights.id, Number(id))).limit(1))[0];
  if (!isNew && !post) notFound();
  const image = await mediaLite([post?.imageId]);
  const date = (post?.publishedAt ?? new Date()).toISOString().slice(0, 10);

  return (
    <>
      <PageHeader title={isNew ? "New article" : `Edit: ${post!.title}`} />
      {created && <div className="mb-4"><Alert tone="green">Article created.</Alert></div>}
      <ActionForm action={saveInsight} submitLabel={isNew ? "Create article" : "Save changes"} cancelHref="/admin/insights">
        {post && <input type="hidden" name="id" value={post.id} />}
        <Card title="Article">
          <div className="space-y-5">
            <FormGrid>
              <Field label="Title" htmlFor="title" required><Input id="title" name="title" defaultValue={post?.title ?? ""} required /></Field>
              <Field label="URL slug" htmlFor="slug" hint="Leave blank to generate from the title."><Input id="slug" name="slug" defaultValue={post?.slug ?? ""} /></Field>
              <Field label="Category" htmlFor="category"><Select id="category" name="category" defaultValue={post?.category ?? ""}><option value="">— none —</option>{INSIGHT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
              <Field label="Tags" htmlFor="tags" hint="Comma separated."><Input id="tags" name="tags" defaultValue={post?.tags.join(", ") ?? ""} /></Field>
              <Field label="Author (optional)" htmlFor="author" hint="Only a real person or leave blank to attribute to the company."><Input id="author" name="author" defaultValue={post?.author ?? ""} /></Field>
              <Field label="Publication date" htmlFor="publishedAt" hint="Future dates keep the article hidden until then only if left unpublished — publish when ready."><Input id="publishedAt" name="publishedAt" type="date" defaultValue={date} /></Field>
            </FormGrid>
            <Field label="Excerpt" htmlFor="excerpt" hint="Short summary for listings and social sharing."><Textarea id="excerpt" name="excerpt" rows={2} defaultValue={post?.excerpt ?? ""} maxLength={400} /></Field>
            <Field label="Body" htmlFor="content" hint="Formatting: '## Heading', '- bullet', **bold**, _italic_, [link text](https://…), blank line between paragraphs."><Textarea id="content" name="content" rows={18} defaultValue={post?.content ?? ""} /></Field>
            <MediaPicker name="imageId" label="Featured image" initial={image} />
          </div>
        </Card>
        <Card title="Publishing & SEO">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Checkbox name="published" label="Published" defaultChecked={post?.published ?? false} />
              <Checkbox name="featured" label="Featured" defaultChecked={post?.featured ?? false} />
            </div>
            <FormGrid>
              <Field label="SEO title" htmlFor="seoTitle"><Input id="seoTitle" name="seoTitle" defaultValue={post?.seoTitle ?? ""} maxLength={200} /></Field>
              <Field label="Meta description" htmlFor="seoDescription"><Textarea id="seoDescription" name="seoDescription" rows={3} defaultValue={post?.seoDescription ?? ""} maxLength={320} /></Field>
            </FormGrid>
          </div>
        </Card>
      </ActionForm>
    </>
  );
}
