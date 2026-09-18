import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ContactDetails } from "@/components/site/ContactDetails";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { Reveal } from "@/components/site/Reveal";
import { Section, SectionHeading } from "@/components/site/primitives";
import { pageMetadata } from "@/lib/page-meta";
import { getPage } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";
import { parseLines } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("quote", "/request-a-quote", "Request a Quote — Steel Construction, Roofing & Renovation");
}

export default async function QuotePage() {
  const [page, settings] = await Promise.all([getPage("quote"), getSiteSettings()]);
  const c = page.content;
  return (
    <>
      <Section className="pb-12 sm:pb-14 lg:pb-16">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Request a Quote", path: "/request-a-quote" }]} />
        <SectionHeading as="h1" eyebrow={c.eyebrow} title={c.heading} body={c.intro} className="mt-8" />
      </Section>
      <Section tone="surface" className="pt-0 sm:pt-0 lg:pt-0">
        <div className="grid gap-14 pt-14 lg:grid-cols-12 lg:gap-20">
          <Reveal className="lg:col-span-8">
            <div className="bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8">
              <EnquiryForm type="quote" projectTypes={parseLines(c.projectTypes)} budgets={parseLines(c.budgets)} note={c.formNote || undefined} />
            </div>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-4">
            <h2 className="display-3">Prefer to talk?</h2>
            <p className="mt-2 text-ink/65">Call or email us and we will discuss your project directly.</p>
            <div className="mt-6"><ContactDetails settings={settings} compact /></div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
