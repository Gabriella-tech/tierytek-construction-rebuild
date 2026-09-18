"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, telHref } from "@/lib/utils";

type Item = { href: string; label: string };

export function HeaderNav({ items, logo, phone, email }: { items: Item[]; logo: ReactNode; phone: string; email: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className={cn("sticky top-0 z-40 border-b bg-white/95 backdrop-blur transition-shadow", scrolled ? "border-line shadow-[0_1px_0_0_rgba(0,0,0,0.04),0_8px_24px_-16px_rgba(0,0,0,0.25)]" : "border-transparent")}>
      <div className="container-x flex h-[72px] items-center justify-between gap-6">
        {logo}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={cn("relative py-2 text-[13.5px] font-semibold uppercase tracking-[0.12em] transition-colors hover:text-brand", isActive(item.href) ? "text-brand" : "text-ink/80")}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/request-a-quote" className="btn-primary hidden min-h-11 px-5 sm:inline-flex">Request a Quote</Link>
          <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mobile-menu" aria-label="Open menu" className="inline-flex h-11 w-11 items-center justify-center border border-ink/15 text-ink lg:hidden">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M3 7h18M3 12h18M3 17h18" /></svg>
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={cn("fixed inset-0 z-50 lg:hidden", open ? "" : "pointer-events-none")} aria-hidden={!open} inert={!open}>
        <div onClick={() => setOpen(false)} className={cn("absolute inset-0 bg-ink/60 transition-opacity duration-300", open ? "opacity-100" : "opacity-0")} />
        <div role="dialog" aria-modal="true" aria-label="Menu" className={cn("absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-ink text-white shadow-2xl transition-transform duration-300 motion-reduce:transition-none", open ? "translate-x-0" : "translate-x-full")}>
          <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-6">
            <span className="font-display text-sm font-bold tracking-[0.2em]">MENU</span>
            <button ref={closeBtn} type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="inline-flex h-11 w-11 items-center justify-center border border-white/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-6 py-6">
            <ul className="space-y-1">
              <li><Link href="/" className={cn("block py-3 font-display text-2xl font-bold", pathname === "/" ? "text-brand" : "")}>Home</Link></li>
              {items.map((item) => (
                <li key={item.href}><Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={cn("block py-3 font-display text-2xl font-bold", isActive(item.href) ? "text-brand" : "")}>{item.label}</Link></li>
              ))}
            </ul>
            <Link href="/request-a-quote" className="btn-primary mt-6 w-full">Request a Quote</Link>
          </nav>
          <div className="border-t border-white/10 px-6 py-5 text-sm text-white/70">
            {phone && <a href={telHref(phone)} className="block py-1 hover:text-white">{phone}</a>}
            {email && <a href={`mailto:${email}`} className="block py-1 hover:text-white">{email}</a>}
          </div>
        </div>
      </div>
    </header>
  );
}
