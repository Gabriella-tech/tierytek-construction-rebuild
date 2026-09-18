import { formatAddress, type SiteSettings } from "@/lib/settings";
import { telHref, whatsappHref } from "@/lib/utils";

const SOCIAL_LABELS: Record<string, string> = { facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", x: "X", youtube: "YouTube", tiktok: "TikTok" };

export function ContactDetails({ settings, compact = false }: { settings: SiteSettings; compact?: boolean }) {
  const b = settings.business;
  const socials = Object.entries(settings.social).filter(([, url]) => !!url);
  const row = "border-t border-ink/10 pt-4";
  const label = "text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/50";
  return (
    <div className={compact ? "space-y-5" : "space-y-6"}>
      {(b.addressLine1 || b.city) && (
        <div className={row}>
          <p className={label}>Address</p>
          <address className="mt-1.5 not-italic text-[15px] text-ink/85">{formatAddress(b)}</address>
          {b.mapLink && <a href={b.mapLink} target="_blank" rel="noopener noreferrer" className="link-arrow mt-2 text-brand">Open in Google Maps</a>}
        </div>
      )}
      {b.phones.length > 0 && (
        <div className={row}>
          <p className={label}>Phone</p>
          <ul className="mt-1.5 space-y-1">{b.phones.map((p) => (<li key={p}><a href={telHref(p)} className="text-[15px] font-medium text-ink hover:text-brand">{p}</a></li>))}</ul>
        </div>
      )}
      {b.email && (
        <div className={row}>
          <p className={label}>Email</p>
          <a href={`mailto:${b.email}`} className="mt-1.5 block text-[15px] font-medium text-ink hover:text-brand">{b.email}</a>
        </div>
      )}
      {b.whatsapp && (
        <div className={row}>
          <p className={label}>WhatsApp</p>
          <a href={whatsappHref(b.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-dark mt-2 min-h-11 px-5">Chat on WhatsApp</a>
        </div>
      )}
      {b.hours.length > 0 && (
        <div className={row}>
          <p className={label}>Business hours</p>
          <ul className="mt-1.5 space-y-0.5 text-[15px] text-ink/85">{b.hours.map((h) => <li key={h}>{h}</li>)}</ul>
        </div>
      )}
      {socials.length > 0 && (
        <div className={row}>
          <p className={label}>Follow</p>
          <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">{socials.map(([k, url]) => (<li key={k}><a href={url} target="_blank" rel="noopener noreferrer" className="text-[15px] font-medium hover:text-brand">{SOCIAL_LABELS[k] ?? k}</a></li>))}</ul>
        </div>
      )}
    </div>
  );
}
