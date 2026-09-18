import { Logo } from "@/components/site/Logo";
import { HeaderNav } from "@/components/site/HeaderNav";
import type { ImageSource } from "@/lib/queries";
import type { SiteSettings } from "@/lib/settings";
import { telHref } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/insights", label: "Insights" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ settings, logo }: { settings: SiteSettings; logo: ImageSource | null }) {
  const b = settings.business;
  return (
    <>
      <div className="hidden bg-ink text-[12px] text-white/70 md:block">
        <div className="container-x flex h-9 items-center justify-between gap-6">
          <p className="truncate">{[b.addressLine1, b.addressLine2, b.city].filter(Boolean).join(", ")}</p>
          <div className="flex items-center gap-5">
            {b.phones[0] && <a href={telHref(b.phones[0])} className="hover:text-white">{b.phones[0]}</a>}
            {b.email && <a href={`mailto:${b.email}`} className="hover:text-white">{b.email}</a>}
          </div>
        </div>
      </div>
      <HeaderNav items={NAV_ITEMS} logo={<Logo image={logo} name={b.displayName} />} phone={b.phones[0] ?? ""} email={b.email} />
    </>
  );
}
