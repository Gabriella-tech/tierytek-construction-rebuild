import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ContactDetails } from "@/components/site/ContactDetails";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { Reveal } from "@/components/site/Reveal";
import { Section, SectionHeading } from "@/components/site/primitives";
import { pageMetadata } from "@/lib/page-meta";
import { getPage } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("contact", "/contact", "Contact Tierytek Construction — Lagos, Nigeria");
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPage("contact"), getSiteSettings()]);
  const c = page.content;
  const embed = settings.business.mapEmbedUrl;
  return (
    <>
      <Section className="pb-12 sm:pb-14 lg:pb-16">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]} />
        <SectionHeading as="h1" eyebrow={c.eyebrow} title={c.heading} body={c.intro} className="mt-8" />
      </Section>
      <Section tone="surface" className="pt-0 sm:pt-0 lg:pt-0">
        <div className="grid gap-14 pt-14 lg:grid-cols-12 lg:gap-20">
          <Reveal className="lg:col-span-5">
            <h2 className="display-3">Reach us directly</h2>
            <div className="mt-6"><ContactDetails settings={settings} /></div>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-7">
            <div className="bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8">
              <h2 className="display-3">Send a message</h2>
              <p className="mt-2 mb-6 text-sm text-ink/60">Looking for pricing? Use the <a href="/request-a-quote" className="font-semibold text-brand underline underline-offset-4">Request a Quote</a> form for a faster response.</p>
              <EnquiryForm type="contact" note={c.formNote || undefined} />
            </div>
          </Reveal>
        </div>
      </Section>
      {embed && (
        <section aria-label="Map" className="bg-surface-2">
          <iframe src={embed} title={`Map showing the location of ${settings.business.displayName}`} className="h-[380px] w-full border-0 grayscale" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        </section>
      )}
    </>
  );
}
