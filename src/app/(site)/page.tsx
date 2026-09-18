import Link from "next/link";
import type { Metadata } from "next";
import { GalleryBoard, type GalleryBoardItem } from "@/components/site/GalleryBoard";
import { Picture } from "@/components/site/Picture";
import { Reveal } from "@/components/site/Reveal";
import { StructuralGraphic } from "@/components/site/StructuralGraphic";
import { CtaBand, Paragraphs, PublicEmptyState, Section, SectionHeading } from "@/components/site/primitives";
import { pageMetadata } from "@/lib/page-meta";
import { parsePairs } from "@/lib/page-fields";
import { getImage, getMediaByIds, getPage, getPublishedGallery, getPublishedInsights, getPublishedProjects, getPublishedServices, pickImages } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";
import { formatDate, isSafeHref, parseLines } from "@/lib/utils";
import { db } from "@/db";
import { projects as projectsTable } from "@/db/schema";
import { inArray } from "drizzle-orm";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return pageMetadata("home", "/", `${s.seo.siteName} — Steel Construction, Roofing & Renovation in Lagos, Nigeria`, s.seo.defaultDescription, { absolute: true });
}

export default async function HomePage() {
  const [page, services, featuredProjects, latestProjects, featuredGallery, latestGallery, posts] = await Promise.all([
    getPage("home"),
    getPublishedServices(),
    getPublishedProjects({ featuredOnly: true, limit: 3 }),
    getPublishedProjects({ limit: 3 }),
    getPublishedGallery({ featuredOnly: true, limit: 6 }),
    getPublishedGallery({ limit: 6 }),
    getPublishedInsights({ limit: 3 }),
  ]);
  const c = page.content;
  const projects = featuredProjects.length ? featuredProjects : latestProjects;
  const gallery = featuredGallery.length ? featuredGallery : latestGallery;
  const [heroImage, introImage, mediaMap, galleryProjects] = await Promise.all([
    getImage(Number(c.heroImageId) || null, c.heroHeadline),
    getImage(Number(c.introImageId) || null, c.introHeading),
    getMediaByIds([...projects.map((p) => p.coverImageId), ...gallery.flatMap((g) => g.imageIds)]),
    gallery.some((g) => g.projectId)
      ? db.select({ id: projectsTable.id, slug: projectsTable.slug }).from(projectsTable).where(inArray(projectsTable.id, gallery.map((g) => g.projectId).filter((v): v is number => !!v)))
      : Promise.resolve([] as Array<{ id: number; slug: string }>),
  ]);
  const projectSlug = new Map(galleryProjects.map((p) => [p.id, p.slug]));
  const heroPoints = parseLines(c.heroPoints).slice(0, 3);
  const introPoints = parseLines(c.introPoints);
  const stats = parsePairs(c.stats).filter((s) => s.title && s.body);
  const sectors = parsePairs(c.focusAreas);
  const galleryItems: GalleryBoardItem[] = gallery
    .map((g) => ({
      id: g.id, title: g.title, category: g.category, client: g.client, projectName: g.projectName, location: g.location, year: g.year, caption: g.caption, description: g.description,
      projectSlug: g.projectId ? projectSlug.get(g.projectId) ?? null : null,
      images: pickImages(g.imageIds, mediaMap, g.title),
    }))
    .filter((g) => g.images.length > 0);
  const primaryHref = isSafeHref(c.heroPrimaryHref) ? c.heroPrimaryHref : "/request-a-quote";
  const secondaryHref = isSafeHref(c.heroSecondaryHref) ? c.heroSecondaryHref : "/projects";

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="grid-texture absolute inset-0" aria-hidden />
        <div className="container-x relative grid items-center gap-12 py-16 sm:py-20 lg:min-h-[calc(100svh-108px)] lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-7">
            {c.heroEyebrow && <Reveal><p className="eyebrow">{c.heroEyebrow}</p></Reveal>}
            <Reveal delay={80}><h1 className="display-1 mt-6 max-w-3xl">{c.heroHeadline}</h1></Reveal>
            {c.heroBody && <Reveal delay={160}><p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/70 sm:text-xl">{c.heroBody}</p></Reveal>}
            <Reveal delay={240} className="mt-10 flex flex-col gap-3 sm:flex-row">
              {c.heroPrimaryLabel && <Link href={primaryHref} className="btn-primary">{c.heroPrimaryLabel}</Link>}
              {c.heroSecondaryLabel && <Link href={secondaryHref} className="btn-outline-light">{c.heroSecondaryLabel}</Link>}
            </Reveal>
          </div>
          <Reveal delay={200} className="relative lg:col-span-5">
            <div className="absolute -left-4 -top-4 h-24 w-24 border-l-4 border-t-4 border-brand" aria-hidden />
            {heroImage ? (
              <Picture image={heroImage} priority sizes="(min-width: 1024px) 40vw, 100vw" aspect="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]" />
            ) : (
              <StructuralGraphic className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]" />
            )}
            <div className="absolute -bottom-4 -right-4 h-24 w-24 border-b-4 border-r-4 border-white/30" aria-hidden />
          </Reveal>
        </div>
        {heroPoints.length > 0 && (
          <div className="relative border-t border-white/10">
            <ul className="container-x grid divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {heroPoints.map((p, i) => (
                <li key={p} className="flex items-center gap-4 py-5 sm:px-6 sm:first:pl-0 sm:last:pr-0">
                  <span className="font-display text-sm font-bold text-brand">0{i + 1}</span>
                  <span className="text-sm font-medium text-white/85">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------- Introduction */}
      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            {c.introEyebrow && <p className="eyebrow">{c.introEyebrow}</p>}
            <h2 className="display-2 mt-4">{c.introHeading}</h2>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7">
            <Paragraphs text={c.introBody} className="text-lg leading-relaxed text-ink/75" />
            {introPoints.length > 0 && (
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {introPoints.map((p) => (
                  <li key={p} className="flex items-start gap-3 border-t border-ink/10 pt-3 text-[15px] font-medium text-ink">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand" aria-hidden />{p}
                  </li>
                ))}
              </ul>
            )}
            <Link href="/about" className="link-arrow mt-8">More about Tierytek</Link>
          </Reveal>
        </div>
        {introImage && (
          <Reveal className="mt-14"><Picture image={introImage} sizes="100vw" aspect="aspect-[21/9]" /></Reveal>
        )}
      </Section>

      {/* ------------------------------------------------------------ Capabilities */}
      {services.length > 0 && (
        <Section>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="What we do" title={c.capabilitiesHeading} body={c.capabilitiesBody} />
            <Link href="/services" className="link-arrow shrink-0">All services</Link>
          </div>
          <ol className="mt-12 border-t border-ink/10">
            {services.slice(0, 6).map((s, i) => (
              <Reveal as="li" key={s.id} delay={i * 40}>
                <Link href={`/services/${s.slug}`} className="group grid gap-2 border-b border-ink/10 py-6 transition-colors hover:bg-surface sm:grid-cols-12 sm:items-baseline sm:gap-6 sm:py-8">
                  <span className="font-display text-sm font-bold text-brand sm:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-display text-xl font-bold text-ink transition-colors group-hover:text-brand sm:col-span-4 sm:text-2xl">{s.title}</h3>
                  <p className="text-[15px] leading-relaxed text-ink/65 sm:col-span-6">{s.excerpt}</p>
                  <span className="hidden text-right text-xl text-ink/40 transition-all group-hover:translate-x-1 group-hover:text-brand sm:col-span-1 sm:block" aria-hidden>→</span>
                </Link>
              </Reveal>
            ))}
          </ol>
        </Section>
      )}

      {/* ------------------------------------------------------------ Figures (only if supplied) */}
      {stats.length > 0 && (
        <section className="bg-ink py-14 text-white">
          <dl className="container-x grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.title} className="border-l-2 border-brand pl-5">
                <dd className="font-display text-4xl font-extrabold sm:text-5xl">{s.body}</dd>
                <dt className="mt-1 text-sm text-white/60">{s.title}</dt>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* ------------------------------------------------------------ Work: projects + gallery */}
      <Section tone={stats.length ? "white" : "surface"} id="work">
        {projects.length === 0 && galleryItems.length === 0 ? (
          <>
            <SectionHeading eyebrow="Our work" title="Projects and gallery" />
            <div className="mt-10"><PublicEmptyState title="Project case studies and gallery images are being prepared." body="Completed work will be published here as it is added." cta={{ href: "/request-a-quote", label: "Discuss your project" }} /></div>
          </>
        ) : (
          <>
            {projects.length > 0 && (
              <div>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <SectionHeading eyebrow="Featured projects" title="Selected work" />
                  <Link href="/projects" className="link-arrow shrink-0">All projects</Link>
                </div>
                <div className="mt-12 grid gap-8 lg:grid-cols-12">
                  {projects.map((p, i) => {
                    const m = p.coverImageId ? mediaMap.get(p.coverImageId) : undefined;
                    const img = m ? pickImages([m.id], mediaMap, p.title)[0] : null;
                    const big = i === 0;
                    return (
                      <Reveal as="article" key={p.id} delay={i * 80} className={big ? "lg:col-span-8" : "lg:col-span-4"}>
                        <Link href={`/projects/${p.slug}`} className="group block">
                          {img && <div className="img-zoom"><Picture image={img} sizes={big ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"} aspect={big ? "aspect-[16/10]" : "aspect-[4/3]"} /></div>}
                          <div className="mt-4 flex items-baseline justify-between gap-4">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">{[p.category, p.location].filter(Boolean).join(" · ")}</p>
                              <h3 className={`mt-1 font-display font-bold text-ink transition-colors group-hover:text-brand ${big ? "text-2xl" : "text-xl"}`}>{p.title}</h3>
                            </div>
                            {p.year && <span className="text-sm text-ink/50">{p.year}</span>}
                          </div>
                          {big && p.excerpt && <p className="mt-2 max-w-2xl text-ink/65">{p.excerpt}</p>}
                        </Link>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            )}
            {galleryItems.length > 0 && (
              <div className={projects.length ? "mt-24" : ""}>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <SectionHeading eyebrow="Gallery" title="Work in view" body="A visual record of completed work for our clients." />
                  <Link href="/gallery" className="link-arrow shrink-0">View gallery</Link>
                </div>
                <div className="mt-12"><GalleryBoard items={galleryItems} compact /></div>
              </div>
            )}
          </>
        )}
      </Section>

      {/* ------------------------------------------------------------ Sectors */}
      {sectors.length > 0 && (
        <Section tone="dark" className="relative overflow-hidden">
          <div className="grid-texture absolute inset-0" aria-hidden />
          <div className="relative">
            <SectionHeading eyebrow={c.focusEyebrow} title={c.focusHeading} body={c.focusBody} dark />
            <ul className="mt-14 grid gap-10 md:grid-cols-3">
              {sectors.map((s, i) => (
                <Reveal as="li" key={s.title} delay={i * 100} className="border-l border-white/15 pl-6">
                  <span className="font-display text-sm font-bold text-brand">0{i + 1}</span>
                  <h3 className="mt-3 font-display text-2xl font-bold">{s.title}</h3>
                  {s.body && <p className="mt-3 text-white/65">{s.body}</p>}
                </Reveal>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {/* ------------------------------------------------------------ Insights */}
      {posts.length > 0 && (
        <Section tone="surface">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Insights & news" title="Latest from Tierytek" />
            <Link href="/insights" className="link-arrow shrink-0">All insights</Link>
          </div>
          <ul className="mt-12 grid gap-8 md:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 80} className="border-t border-ink/15 pt-5">
                <p className="text-xs text-ink/50">{formatDate(p.publishedAt ?? p.createdAt)}{p.category ? ` · ${p.category}` : ""}</p>
                <h3 className="mt-2 font-display text-xl font-bold leading-snug"><Link href={`/insights/${p.slug}`} className="hover:text-brand">{p.title}</Link></h3>
                {p.excerpt && <p className="mt-2 text-[15px] text-ink/65">{p.excerpt}</p>}
              </Reveal>
            ))}
          </ul>
        </Section>
      )}

      <CtaBand heading={c.ctaHeading} body={c.ctaBody} />
    </>
  );
}
