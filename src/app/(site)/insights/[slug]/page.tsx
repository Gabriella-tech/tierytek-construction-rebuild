import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { DraftBanner } from "@/components/site/DraftBanner";
import { JsonLd } from "@/components/site/JsonLd";
import { Picture } from "@/components/site/Picture";
import { RichText } from "@/components/site/RichText";
import { CtaBand, Section } from "@/components/site/primitives";
import { getSession } from "@/lib/auth";
import { getImage, getInsightBySlug, getPublishedInsights } from "@/lib/queries";
import { articleJsonLd, buildMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/settings";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [s, post] = await Promise.all([getSiteSettings(), getInsightBySlug(slug, true)]);
  if (!post) return { title: "Article not found" };
  const image = await getImage(post.imageId);
  return buildMetadata(s, {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/insights/${post.slug}`,
    image: image?.large,
    type: "article",
    publishedTime: (post.publishedAt ?? post.createdAt).toISOString(),
    noIndex: !post.published,
  });
}

export default async function InsightDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await getSession();
  const post = await getInsightBySlug(slug, !!session);
  if (!post) notFound();
  const [s, image, more] = await Promise.all([getSiteSettings(), getImage(post.imageId, post.title), getPublishedInsights({ limit: 4 })]);
  const related = more.filter((m) => m.id !== post.id).slice(0, 3);
  const crumbs = [{ name: "Home", path: "/" }, { name: "Insights", path: "/insights" }, { name: post.title, path: `/insights/${post.slug}` }];

  return (
    <>
      {!post.published && <DraftBanner editHref={`/admin/insights/${post.id}`} />}
      <article>
        <Section className="pb-0 sm:pb-0 lg:pb-0">
          <div className="mx-auto max-w-3xl">
            <Breadcrumbs items={crumbs} />
            {post.category && <p className="eyebrow mt-8">{post.category}</p>}
            <h1 className="display-2 mt-4">{post.title}</h1>
            <p className="mt-5 text-sm text-ink/55">{formatDate(post.publishedAt ?? post.createdAt)}{post.author ? ` · By ${post.author}` : ` · ${s.business.displayName}`}</p>
            {post.excerpt && <p className="mt-6 text-lg leading-relaxed text-ink/75">{post.excerpt}</p>}
          </div>
          {image && <div className="mx-auto mt-12 max-w-5xl"><Picture image={image} priority sizes="(min-width: 1024px) 60vw, 100vw" aspect="aspect-[16/9]" /></div>}
        </Section>
        <Section className="pt-12 sm:pt-14 lg:pt-16">
          <div className="mx-auto max-w-3xl">
            <RichText content={post.content} />
            {post.tags.length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
                {post.tags.map((t) => (<li key={t} className="border border-ink/15 px-2.5 py-1 text-xs font-medium text-ink/70">{t}</li>))}
              </ul>
            )}
            <div className="mt-12 border-t border-ink/10 pt-6"><Link href="/insights" className="link-arrow">All insights</Link></div>
          </div>
        </Section>
      </article>
      {related.length > 0 && (
        <Section tone="surface">
          <h2 className="display-3">More from Tierytek</h2>
          <ul className="mt-8 grid gap-8 md:grid-cols-3">
            {related.map((p) => (
              <li key={p.id} className="border-t border-ink/15 pt-5">
                <p className="text-xs text-ink/50">{formatDate(p.publishedAt ?? p.createdAt)}</p>
                <h3 className="mt-2 font-display text-xl font-bold leading-snug"><Link href={`/insights/${p.slug}`} className="hover:text-brand">{p.title}</Link></h3>
              </li>
            ))}
          </ul>
        </Section>
      )}
      <CtaBand heading="Talk to us about your next project" />
      <JsonLd data={articleJsonLd(post, s, image?.large)} />
    </>
  );
}
