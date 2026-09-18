import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Picture } from "@/components/site/Picture";
import { Reveal } from "@/components/site/Reveal";
import { CtaBand, PublicEmptyState, Section, SectionHeading } from "@/components/site/primitives";
import { pageMetadata } from "@/lib/page-meta";
import { getMediaByIds, getPage, getPublishedProjects, pickImages } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("projects", "/projects", "Projects — Steel Construction, Roofing & Renovation Case Studies");
}

export default async function ProjectsPage() {
  const [page, projects] = await Promise.all([getPage("projects"), getPublishedProjects()]);
  const c = page.content;
  const mediaMap = await getMediaByIds(projects.map((p) => p.coverImageId));
  const categories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));

  return (
    <>
      <Section className="pb-12 sm:pb-16 lg:pb-16">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Projects", path: "/projects" }]} />
        <SectionHeading as="h1" eyebrow={c.eyebrow} title={c.heading} body={c.intro} className="mt-8" />
        {categories.length > 1 && <p className="mt-6 text-sm text-ink/50">{categories.join(" · ")}</p>}
      </Section>
      <Section tone="surface" className="pt-0 sm:pt-0 lg:pt-0">
        {projects.length === 0 ? (
          <PublicEmptyState title="Project showcases will appear here as they are published." body="We are preparing detailed case studies of completed work." cta={{ href: "/gallery", label: "See the gallery" }} />
        ) : (
          <ul className="grid gap-x-8 gap-y-14 pt-16 md:grid-cols-2">
            {projects.map((p, i) => {
              const img = p.coverImageId ? pickImages([p.coverImageId], mediaMap, p.title)[0] : null;
              const wide = i === 0 && projects.length > 2;
              return (
                <Reveal as="li" key={p.id} delay={(i % 2) * 80} className={wide ? "md:col-span-2" : ""}>
                  <Link href={`/projects/${p.slug}`} className="group grid gap-5 lg:grid-cols-12 lg:items-end">
                    <div className={wide ? "lg:col-span-8" : "lg:col-span-12"}>
                      {img && <div className="img-zoom"><Picture image={img} sizes={wide ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 768px) 50vw, 100vw"} aspect={wide ? "aspect-[16/9]" : "aspect-[4/3]"} priority={i === 0} /></div>}
                    </div>
                    <div className={wide ? "lg:col-span-4 lg:pb-2" : "lg:col-span-12"}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">{[p.category, p.location, p.year].filter(Boolean).join(" · ")}</p>
                      <h2 className={`mt-2 font-display font-bold text-ink transition-colors group-hover:text-brand ${wide ? "text-3xl" : "text-2xl"}`}>{p.title}</h2>
                      {p.excerpt && <p className="mt-2 text-ink/65">{p.excerpt}</p>}
                      {p.client && <p className="mt-3 text-sm text-ink/50">Client: {p.client}</p>}
                      <span className="link-arrow mt-4">View case study</span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        )}
      </Section>
      <CtaBand heading="Have a similar project in mind?" body="We work with residential, commercial and industrial clients across Nigeria." />
    </>
  );
}
