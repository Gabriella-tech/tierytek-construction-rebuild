import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { JsonLd } from "@/components/site/JsonLd";
import { getSiteSettings } from "@/lib/settings";
import { getImage, getPublishedServices } from "@/lib/queries";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const s = await getSiteSettings();
  const [logo, logoDark, services] = await Promise.all([
    getImage(s.branding.logoId, `${s.business.displayName} logo`),
    getImage(s.branding.logoDarkId, `${s.business.displayName} logo`),
    getPublishedServices(),
  ]);
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <SiteHeader settings={s} logo={logo} />
      <main id="main">{children}</main>
      <SiteFooter settings={s} logo={logoDark ?? logo} services={services} />
      <JsonLd data={[organizationJsonLd(s, logo?.original), websiteJsonLd(s)]} />
    </>
  );
}
