import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getImage, getPublishedServices } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default async function NotFound() {
  const s = await getSiteSettings();
  const [logo, logoDark, services] = await Promise.all([getImage(s.branding.logoId), getImage(s.branding.logoDarkId), getPublishedServices()]);
  return (
    <>
      <SiteHeader settings={s} logo={logo} />
      <main id="main" className="container-x py-24 sm:py-32">
        <p className="eyebrow">Error 404</p>
        <h1 className="display-1 mt-4">Page not found</h1>
        <p className="mt-6 max-w-xl text-lg text-ink/70">The page you are looking for does not exist or may have moved.</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn-dark">Back to home</Link>
          <Link href="/services" className="btn-outline">View services</Link>
          <Link href="/contact" className="btn-outline">Contact us</Link>
        </div>
      </main>
      <SiteFooter settings={s} logo={logoDark ?? logo} services={services} />
    </>
  );
}
