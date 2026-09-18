import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/site/Reveal";

export function Section({ children, className, tone = "white", id }: { children: ReactNode; className?: string; tone?: "white" | "surface" | "dark"; id?: string }) {
  const tones = { white: "bg-white text-ink", surface: "bg-surface text-ink", dark: "bg-ink text-white" };
  return (
    <section id={id} className={cn("py-20 sm:py-24 lg:py-28", tones[tone], className)}>
      <div className="container-x">{children}</div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, body, align = "left", dark, className, as: Tag = "h2" }: { eyebrow?: string; title: string; body?: string; align?: "left" | "center"; dark?: boolean; className?: string; as?: "h1" | "h2" }) {
  return (
    <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Tag className={cn("mt-4", Tag === "h1" ? "display-1" : "display-2", dark ? "text-white" : "text-ink")}>{title}</Tag>
      {body && <p className={cn("mt-5 text-lg leading-relaxed", dark ? "text-white/70" : "text-ink/70")}>{body}</p>}
    </Reveal>
  );
}

export function Paragraphs({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className={cn("space-y-4", className)}>
      {parts.map((p, i) => (<p key={i}>{p}</p>))}
    </div>
  );
}

export function PublicEmptyState({ title, body, cta }: { title: string; body?: string; cta?: { href: string; label: string } }) {
  return (
    <div className="border border-dashed border-ink/20 bg-surface px-6 py-14 text-center">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">{body}</p>}
      {cta && <Link href={cta.href} className="link-arrow mt-5">{cta.label}</Link>}
    </div>
  );
}

export function CtaBand({ heading, body, primary = { href: "/request-a-quote", label: "Request a Quote" }, secondary = { href: "/contact", label: "Contact Us" } }: { heading: string; body?: string; primary?: { href: string; label: string }; secondary?: { href: string; label: string } }) {
  return (
    <section className="relative overflow-hidden bg-steel text-white">
      <div className="grid-texture absolute inset-0" aria-hidden />
      <div className="absolute -right-24 top-0 h-full w-1/2 skew-x-[-12deg] bg-brand/10" aria-hidden />
      <div className="container-x relative flex flex-col gap-8 py-16 sm:py-20 lg:flex-row lg:items-center lg:justify-between">
        <Reveal className="max-w-2xl">
          <h2 className="display-2">{heading}</h2>
          {body && <p className="mt-4 text-lg text-white/70">{body}</p>}
        </Reveal>
        <Reveal className="flex flex-col gap-3 sm:flex-row" delay={120}>
          <Link href={primary.href} className="btn-primary">{primary.label}</Link>
          <Link href={secondary.href} className="btn-outline-light">{secondary.label}</Link>
        </Reveal>
      </div>
    </section>
  );
}

export function MetaList({ items, dark }: { items: Array<{ label: string; value?: string | null | ReactNode }>; dark?: boolean }) {
  const present = items.filter((i) => i.value);
  if (!present.length) return null;
  return (
    <dl className={cn("grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-4", dark ? "text-white" : "text-ink")}>
      {present.map((i) => (
        <div key={i.label} className={cn("border-t pt-3", dark ? "border-white/15" : "border-ink/15")}>
          <dt className={cn("text-[11px] font-semibold uppercase tracking-[0.18em]", dark ? "text-white/50" : "text-ink/50")}>{i.label}</dt>
          <dd className="mt-1 text-sm font-medium">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}
