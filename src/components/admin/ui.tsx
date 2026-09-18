import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { EnquiryStatus } from "@/db/schema";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-neutral-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, description, children, className }: { title?: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-neutral-200 bg-white p-5 shadow-sm", className)}>
      {title && (
        <div className="mb-4 border-b border-neutral-100 pb-3">
          <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-neutral-500">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export const inputClass =
  "block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:bg-neutral-50";

export function Field({ label, htmlFor, hint, error, required, children }: { label: string; htmlFor?: string; hint?: string; error?: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-neutral-800">
        {label}
        {required && <span className="ml-0.5 text-brand" aria-hidden>*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-600" role="alert">{error}</p>}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputClass, "min-h-[100px]", props.className)} />;
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputClass, props.className)} />;
}

export function Checkbox({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-3 rounded-md border border-neutral-200 px-3 py-2.5 text-sm hover:bg-neutral-50">
      <input type="checkbox" name={name} value="1" defaultChecked={defaultChecked} className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-brand focus:ring-brand" />
      <span>
        <span className="font-medium text-neutral-800">{label}</span>
        {hint && <span className="block text-xs text-neutral-500">{hint}</span>}
      </span>
    </label>
  );
}

const tones = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  gray: "bg-neutral-100 text-neutral-700 ring-neutral-500/20",
  orange: "bg-orange-50 text-orange-700 ring-orange-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  purple: "bg-violet-50 text-violet-700 ring-violet-600/20",
};
export type Tone = keyof typeof tones;

export function Badge({ tone = "gray", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", tones[tone])}>{children}</span>;
}

export function Alert({ tone = "gray", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div role={tone === "red" ? "alert" : "status"} className={cn("rounded-md px-4 py-3 text-sm ring-1 ring-inset", tones[tone])}>
      {children}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
      <p className="text-sm font-semibold text-neutral-800">{title}</p>
      {body && <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export const buttonClass = {
  primary: "inline-flex items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-60",
  secondary: "inline-flex items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-60",
  danger: "inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-60",
  ghost: "inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-60",
};

export function LinkButton({ href, variant = "primary", children }: { href: string; variant?: keyof typeof buttonClass; children: ReactNode }) {
  return (
    <Link href={href} className={buttonClass[variant]}>
      {children}
    </Link>
  );
}

export function PublishedBadge({ published }: { published: boolean }) {
  return <Badge tone={published ? "green" : "gray"}>{published ? "Published" : "Draft"}</Badge>;
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

export const STATUS_TONE: Record<EnquiryStatus, Tone> = { new: "orange", contacted: "blue", in_progress: "purple", quoted: "blue", won: "green", closed: "gray" };
