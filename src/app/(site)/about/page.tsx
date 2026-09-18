import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Picture } from "@/components/site/Picture";
import { Reveal } from "@/components/site/Reveal";
import { StructuralGraphic } from "@/components/site/StructuralGraphic";
import { CtaBand, Paragraphs, Section, SectionHeading } from "@/components/site/primitives";
import { pageMetadata } from "@/lib/page-meta";
import { parsePairs } from "@/lib/page-fields";
import { getImage, getPage, getPublishedServices } from "@/lib/queries";
import { parseLines } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("about", "/about", "About Tierytek Construction — Steel, Roofing & Renovation Contractors in Lagos");
}

export default async function AboutPage() {
  const [page, services] = await Promise.all([getPage("about"), getPublishedServices()]);
  const c = page.content;
  const image = await getImage(Number(c.imageId) || null, c.heading);
  const values = parsePairs(c.values);
  const approach = parsePairs(c.approach);
  const points = parseLines(c.points);

  return (
    <>
      <Section className="pb-0 sm:pb-0 lg:pb-0">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />
        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <SectionHeading as="h1" eyebrow={c.eyebrow} title={c.heading} className="lg:col-span-7" />
          <Reveal delay={120} className="lg:col-span-5 lg:pt-14"><Paragraphs text={c.intro} className="text-lg leading-relaxed text-ink/75" /></Reveal>
        </div>
        <Reveal className="mt-14">
          {image ? <Picture image={image} priority sizes="100vw" aspect="aspect-[16/9] sm:aspect-[21/9]" /> : <StructuralGraphic className="aspect-[16/9] sm:aspect-[21/9]" tone="light" />}
        </Reveal>
      </Section>

      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {c.missionBody && (
            <Reveal>
              <p className="eyebrow">{c.missionHeading}</p>
              <p className="mt-5 font-display text-2xl font-semibold leading-snug text-ink sm:text-3xl">{c.missionBody}</p>
            </Reveal>
          )}
          {c.visionBody ? (
            <Reveal delay={120}>
              <p className="eyebrow">{c.visionHeading}</p>
              <p className="mt-5 font-display text-2xl font-semibold leading-snug text-ink sm:text-3xl">{c.visionBody}</p>
            </Reveal>
          ) : points.length > 0 ? (
            <Reveal delay={120}>
              <p className="eyebrow">Why Tierytek</p>
              <ul className="mt-6 space-y-3">
                {points.map((p) => (<li key={p} className="flex items-start gap-3 border-t border-ink/10 pt-3 font-medium text-ink"><span className="mt-2 h-2 w-2 shrink-0 bg-brand" aria-hidden />{p}</li>))}
              </ul>
            </Reveal>
          ) : null}
        </div>
      </Section>

      {values.length > 0 && (
        <Section>
          <SectionHeading eyebrow="Values" title={c.valuesHeading} />
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal as="li" key={v.title} delay={i * 80} className="border-t-2 border-ink pt-5">
                <h3 className="font-display text-xl font-bold">{v.title}</h3>
                {v.body && <p className="mt-3 text-[15px] leading-relaxed text-ink/65">{v.body}</p>}
              </Reveal>
            ))}
          </ul>
        </Section>
      )}

      {approach.length > 0 && (
        <Section tone="dark" className="relative overflow-hidden">
          <div className="grid-texture absolute inset-0" aria-hidden />
          <div className="relative grid gap-12 lg:grid-cols-12">
            <SectionHeading eyebrow="Approach" title={c.approachHeading} dark className="lg:col-span-4" />
            <ol className="lg:col-span-8">
              {approach.map((step, i) => (
                <Reveal as="li" key={step.title} delay={i * 80} className="grid gap-3 border-t border-white/15 py-7 sm:grid-cols-12 sm:gap-8">
                  <span className="font-display text-sm font-bold text-brand sm:col-span-2">Step {i + 1}</span>
                  <h3 className="font-display text-xl font-bold sm:col-span-4">{step.title}</h3>
                  {step.body && <p className="text-white/65 sm:col-span-6">{step.body}</p>}
                </Reveal>
              ))}
            </ol>
          </div>
        </Section>
      )}

      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {c.capabilitiesBody && (
            <Reveal>
              <p className="eyebrow">{c.capabilitiesHeading}</p>
              <Paragraphs text={c.capabilitiesBody} className="mt-5 text-lg leading-relaxed text-ink/75" />
              {services.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {services.map((s) => (<li key={s.id}><Link href={`/services/${s.slug}`} className="inline-block border border-ink/20 px-3 py-1.5 text-sm font-medium hover:border-brand hover:text-brand">{s.title}</Link></li>))}
                </ul>
              )}
            </Reveal>
          )}
          {c.safetyBody && (
            <Reveal delay={120}>
              <p className="eyebrow">{c.safetyHeading}</p>
              <Paragraphs text={c.safetyBody} className="mt-5 text-lg leading-relaxed text-ink/75" />
            </Reveal>
          )}
        </div>
      </Section>

      <CtaBand heading="Ready to discuss your project?" body="Tell us about your site, scope and timeline and our team will respond with next steps." />
    </>
  );
}
