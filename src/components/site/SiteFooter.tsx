import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import type { Service } from "@/db/schema";
import type { ImageSource } from "@/lib/queries";
import { formatAddress, type SiteSettings } from "@/lib/settings";
import { telHref, whatsappHref } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/site/SiteHeader";

const SOCIAL_LABELS: Record<string, string> = { facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", x: "X", youtube: "YouTube", tiktok: "TikTok" };

export function SiteFooter({ settings, logo, services }: { settings: SiteSettings; logo: ImageSource | null; services: Service[] }) {
  const b = settings.business;
  const socials = Object.entries(settings.social).filter(([, url]) => !!url);
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-ink text-white">
      <div className="h-1 w-full bg-brand" aria-hidden />
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <Logo image={logo} name={b.displayName} tone="dark" />
          {b.footerAbout && <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">{b.footerAbout}</p>}
          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-4 text-sm">
              {socials.map(([key, url]) => (
                <li key={key}><a href={url} target="_blank" rel="noopener noreferrer" className="text-white/70 underline-offset-4 hover:text-brand hover:underline">{SOCIAL_LABELS[key] ?? key}</a></li>
              ))}
            </ul>
          )}
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">Company</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/" className="text-white/80 hover:text-brand">Home</Link></li>
            {NAV_ITEMS.map((i) => (<li key={i.href}><Link href={i.href} className="text-white/80 hover:text-brand">{i.label}</Link></li>))}
            <li><Link href="/request-a-quote" className="text-white/80 hover:text-brand">Request a Quote</Link></li>
          </ul>
        </div>
        <div className="lg:col-span-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">Services</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {services.slice(0, 8).map((s) => (<li key={s.id}><Link href={`/services/${s.slug}`} className="text-white/80 hover:text-brand">{s.title}</Link></li>))}
            {services.length === 0 && <li className="text-white/50">Services will be listed here.</li>}
          </ul>
        </div>
        <div className="lg:col-span-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">Contact</h2>
          <address className="mt-4 space-y-2.5 text-sm not-italic text-white/80">
            {(b.addressLine1 || b.city) && <p>{b.mapLink ? <a href={b.mapLink} target="_blank" rel="noopener noreferrer" className="hover:text-brand">{formatAddress(b)}</a> : formatAddress(b)}</p>}
            {b.phones.map((p) => (<p key={p}><a href={telHref(p)} className="hover:text-brand">{p}</a></p>))}
            {b.email && <p><a href={`mailto:${b.email}`} className="hover:text-brand">{b.email}</a></p>}
            {b.whatsapp && <p><a href={whatsappHref(b.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:text-brand">WhatsApp: {b.whatsapp}</a></p>}
            {b.hours.length > 0 && <div className="pt-2 text-white/60">{b.hours.map((h) => <p key={h}>{h}</p>)}</div>}
          </address>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-[12px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {b.copyrightName || b.displayName}. All rights reserved.</p>
          <p>Built by GEXANOVA Innovation Limited</p>
        </div>
      </div>
    </footer>
  );
}
