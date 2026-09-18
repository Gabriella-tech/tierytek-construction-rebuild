import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Picture } from "@/components/site/Picture";
import { Reveal } from "@/components/site/Reveal";
import { StructuralGraphic } from "@/components/site/StructuralGraphic";
import { CtaBand, PublicEmptyState, Section, SectionHeading } from "@/components/site/primitives";
import { pageMetadata } from "@/lib/page-meta";
import { getMediaByIds, getPage, getPublishedServices, pickImages } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("services", "/services", "Construction Services — Steel Construction, Roofing, Renovation & Engineering in Lagos");
}

export default async function ServicesPage() {
  const [page, services] = await Promise.all([getPage("services"), getPublishedServices()]);
  const c = page.content;
  const mediaMap = await getMediaByIds(services.map((s) => s.imageId));

  return (
    <>
      <Section className="pb-12 sm:pb-16 lg:pb-16">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Services", path: "/services" }]} />
        <SectionHeading as="h1" eyebrow={c.eyebrow} title={c.heading} body={c.intro} className="mt-8" />
        {services.length > 0 && (
          <nav aria-label="Services on this page" className="mt-10 flex flex-wrap gap-2">
            {services.map((s) => (<a key={s.id} href={`#${s.slug}`} className="border border-ink/15 px-3 py-1.5 text-sm font-medium hover:border-brand hover:text-brand">{s.title}</a>))}
          </nav>
        )}
      </Section>

      {services.length === 0 ? (
        <Section tone="surface"><PublicEmptyState title="Services are being added." body="Our service listing will appear here shortly." cta={{ href: "/contact", label: "Contact us" }} /></Section>
      ) : (
        <div className="border-t border-ink/10">
          {services.map((s, i) => {
            const img = s.imageId ? pickImages([s.imageId], mediaMap, s.title)[0] : null;
            const flip = i % 2 === 1;
            return (
              <article key={s.id} id={s.slug} className={`scroll-mt-24 border-b border-ink/10 ${i % 2 === 1 ? "bg-surface" : "bg-white"}`}>
                <div className="container-x grid gap-10 py-16 lg:grid-cols-12 lg:items-center lg:gap-16 lg:py-20">
                  <Reveal className={`lg:col-span-5 ${flip ? "lg:order-2" : ""}`}>
                    {img ? <Picture image={img} sizes="(min-width: 1024px) 40vw, 100vw" aspect="aspect-[4/3]" /> : <StructuralGraphic className="aspect-[4/3]" tone={i % 2 === 1 ? "dark" : "light"} />}
                  </Reveal>
                  <Reveal delay={100} className={`lg:col-span-7 ${flip ? "lg:order-1" : ""}`}>
                    <p className="font-display text-sm font-bold text-brand">{String(i + 1).padStart(2, "0")}{s.category ? ` — ${s.category}` : ""}</p>
                    <h2 className="display-2 mt-3"><Link href={`/services/${s.slug}`} className="hover:text-brand">{s.title}</Link></h2>
                    {s.excerpt && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/70">{s.excerpt}</p>}
                    {s.capabilities.length > 0 && (
                      <ul className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                        {s.capabilities.slice(0, 6).map((cap) => (<li key={cap} className="flex items-start gap-3 text-[15px] text-ink/80"><span className="mt-2.5 h-[2px] w-3 shrink-0 bg-brand" aria-hidden />{cap}</li>))}
                      </ul>
                    )}
                    <div className="mt-8 flex flex-wrap gap-6">
                      <Link href={`/services/${s.slug}`} className="link-arrow">About this service</Link>
                      <Link href="/request-a-quote" className="link-arrow text-brand">Request a quote</Link>
                    </div>
                  </Reveal>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <CtaBand heading="Not sure which service you need?" body="Describe the project and we will advise on the right approach." />
    </>
  );
}
