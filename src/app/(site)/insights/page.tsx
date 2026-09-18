import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Picture } from "@/components/site/Picture";
import { Reveal } from "@/components/site/Reveal";
import { PublicEmptyState, Section, SectionHeading } from "@/components/site/primitives";
import { pageMetadata } from "@/lib/page-meta";
import { getMediaByIds, getPage, getPublishedInsights, pickImages } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("insights", "/insights", "Insights & News — Tierytek Construction");
}

export default async function InsightsPage() {
  const [page, posts] = await Promise.all([getPage("insights"), getPublishedInsights()]);
  const c = page.content;
  const mediaMap = await getMediaByIds(posts.map((p) => p.imageId));
  return (
    <>
      <Section className="pb-12 sm:pb-16 lg:pb-16">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Insights", path: "/insights" }]} />
        <SectionHeading as="h1" eyebrow={c.eyebrow} title={c.heading} body={c.intro} className="mt-8" />
      </Section>
      <Section tone="surface" className="pt-0 sm:pt-0 lg:pt-0">
        <div className="pt-16">
          {posts.length === 0 ? (
            <PublicEmptyState title="No articles have been published yet." body="News and insights from Tierytek will appear here." cta={{ href: "/services", label: "Explore our services" }} />
          ) : (
            <ul className="divide-y divide-ink/10 border-t border-ink/10">
              {posts.map((p, i) => {
                const img = p.imageId ? pickImages([p.imageId], mediaMap, p.title)[0] : null;
                return (
                  <Reveal as="li" key={p.id} delay={Math.min(i, 4) * 60}>
                    <Link href={`/insights/${p.slug}`} className="group grid gap-6 py-10 md:grid-cols-12 md:items-center">
                      <p className="text-sm text-ink/50 md:col-span-2">{formatDate(p.publishedAt ?? p.createdAt)}{p.category ? <span className="block text-brand">{p.category}</span> : null}</p>
                      <div className={img ? "md:col-span-6" : "md:col-span-10"}>
                        <h2 className="font-display text-2xl font-bold leading-snug transition-colors group-hover:text-brand">{p.title}</h2>
                        {p.excerpt && <p className="mt-3 text-ink/65">{p.excerpt}</p>}
                        <span className="link-arrow mt-4">Read article</span>
                      </div>
                      {img && <div className="img-zoom md:col-span-4"><Picture image={img} sizes="(min-width: 768px) 33vw, 100vw" aspect="aspect-[4/3]" /></div>}
                    </Link>
                  </Reveal>
                );
              })}
            </ul>
          )}
        </div>
      </Section>
    </>
  );
}
