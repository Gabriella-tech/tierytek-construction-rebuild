"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import { buttonClass } from "@/components/admin/ui";
import type { ActionState } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SubmitButton({ children, pendingText = "Saving…", variant = "primary", className }: { children: ReactNode; pendingText?: string; variant?: keyof typeof buttonClass; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={cn(buttonClass[variant], className)}>
      {pending ? pendingText : children}
    </button>
  );
}

/** A one-button form that asks for confirmation before running a server action. */
export function ConfirmButton({ action, message, children, variant = "danger", className }: { action: () => Promise<void>; message: string; children: ReactNode; variant?: keyof typeof buttonClass; className?: string }) {
  return (
    <form action={action} onSubmit={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>
      <SubmitButton variant={variant} pendingText="Working…" className={className}>{children}</SubmitButton>
    </form>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (state.error) return <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-600/20">{state.error}</p>;
  if (state.message) return <p role="status" className="rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">{state.message}</p>;
  return null;
}

/* ------------------------------------------------------------------ */
/* Admin shell (sidebar + mobile drawer)                               */
/* ------------------------------------------------------------------ */

type NavItem = { href: string; label: string; adminOnly?: boolean };
const NAV: Array<{ heading: string; items: NavItem[] }> = [
  { heading: "Overview", items: [{ href: "/admin/dashboard", label: "Dashboard" }, { href: "/admin/enquiries", label: "Enquiries" }] },
  {
    heading: "Content",
    items: [
      { href: "/admin/pages", label: "Pages" },
      { href: "/admin/services", label: "Services" },
      { href: "/admin/projects", label: "Projects" },
      { href: "/admin/gallery", label: "Gallery" },
      { href: "/admin/insights", label: "Insights" },
      { href: "/admin/media", label: "Media Library" },
    ],
  },
  {
    heading: "Settings",
    items: [
      { href: "/admin/seo", label: "SEO", adminOnly: true },
      { href: "/admin/settings/branding", label: "Branding", adminOnly: true },
      { href: "/admin/settings/business", label: "Business", adminOnly: true },
      { href: "/admin/settings/social", label: "Social links", adminOnly: true },
      { href: "/admin/users", label: "Users", adminOnly: true },
    ],
  },
];

export function AdminShell({ user, logoutAction, children }: { user: { name: string; email: string; role: string }; logoutAction: () => Promise<void>; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const nav = (
    <nav aria-label="Admin" className="space-y-6">
      {NAV.map((group) => {
        const items = group.items.filter((i) => !i.adminOnly || user.role === "admin");
        if (!items.length) return null;
        return (
          <div key={group.heading}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{group.heading}</p>
            <ul className="mt-2 space-y-0.5">
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link href={item.href} aria-current={active ? "page" : undefined} className={cn("block rounded-md px-3 py-2 text-sm font-medium", active ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100")}>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:hidden">
        <Link href="/admin/dashboard" className="font-display text-sm font-bold tracking-wide">TIERYTEK <span className="text-neutral-400">Admin</span></Link>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="rounded-md p-2 hover:bg-neutral-100">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/40" />
          <div role="dialog" aria-modal="true" aria-label="Admin menu" className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-sm font-bold">Menu</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-md p-2 hover:bg-neutral-100">✕</button>
            </div>
            {nav}
            <UserBox user={user} logoutAction={logoutAction} />
          </div>
        </div>
      )}

      <div className="lg:flex">
        <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-neutral-200 lg:bg-white">
          <div className="border-b border-neutral-200 px-5 py-4">
            <Link href="/admin/dashboard" className="font-display text-base font-extrabold tracking-wide">TIERYTEK</Link>
            <p className="text-xs text-neutral-500">Content management</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3">{nav}</div>
          <div className="border-t border-neutral-200 p-3"><UserBox user={user} logoutAction={logoutAction} /></div>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function UserBox({ user, logoutAction }: { user: { name: string; email: string; role: string }; logoutAction: () => Promise<void> }) {
  return (
    <div className="mt-auto space-y-2 rounded-md bg-neutral-50 p-3 text-sm">
      <p className="truncate font-medium text-neutral-900">{user.name}</p>
      <p className="truncate text-xs text-neutral-500">{user.email} · {user.role}</p>
      <div className="flex gap-2 pt-1">
        <Link href="/" target="_blank" className="text-xs font-medium text-brand hover:underline">View site ↗</Link>
        <form action={logoutAction} className="ml-auto"><button type="submit" className="text-xs font-medium text-neutral-600 hover:text-neutral-900">Sign out</button></form>
      </div>
    </div>
  );
}
