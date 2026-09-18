"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";

type Props = {
  type: "quote" | "contact";
  projectTypes?: string[];
  budgets?: string[];
  note?: string;
};

const field = "block w-full border border-ink/20 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25";
const label = "mb-1.5 block text-[13px] font-semibold text-ink";

export function EnquiryForm({ type, projectTypes = [], budgets = [], note }: Props) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("submitting");
    setError("");
    setFieldErrors({});
    try {
      const res = await fetch("/api/enquiries", { method: "POST", body: new FormData(form) });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };
      if (!res.ok || !data.ok) {
        setFieldErrors(data.fieldErrors ?? {});
        setError(data.error || "Something went wrong. Please try again or contact us directly.");
        setStatus("error");
        return;
      }
      form.reset();
      setStatus("success");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="border border-brand/40 bg-brand-soft p-8">
        <p className="font-display text-xl font-bold text-ink">Thank you — your {type === "quote" ? "quote request" : "message"} has been received.</p>
        <p className="mt-2 text-ink/70">Our team will review the details and get back to you using the contact information you provided.</p>
        <button type="button" onClick={() => setStatus("idle")} className="link-arrow mt-5">Send another</button>
      </div>
    );
  }

  const err = (k: string) => fieldErrors[k] && <p id={`${k}-error`} className="mt-1 text-xs font-medium text-red-600">{fieldErrors[k]}</p>;
  const aria = (k: string) => (fieldErrors[k] ? { "aria-invalid": true as const, "aria-describedby": `${k}-error` } : {});

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" encType="multipart/form-data">
      <input type="hidden" name="type" value={type} />
      {/* Honeypot — hidden from humans */}
      <div className="hidden" aria-hidden="true"><label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {note && <p className="text-sm text-ink/70">{note}</p>}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={label}>Full name <span className="text-brand">*</span></label>
          <input id="name" name="name" required autoComplete="name" className={field} {...aria("name")} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="company" className={label}>Company</label>
          <input id="company" name="company" autoComplete="organization" className={field} />
        </div>
        <div>
          <label htmlFor="email" className={label}>Email <span className="text-brand">*</span></label>
          <input id="email" name="email" type="email" required autoComplete="email" className={field} {...aria("email")} />
          {err("email")}
        </div>
        <div>
          <label htmlFor="phone" className={label}>Phone</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={field} placeholder="+234" />
        </div>
        {type === "quote" && (
          <>
            <div>
              <label htmlFor="projectType" className={label}>Project type</label>
              <select id="projectType" name="projectType" className={field} defaultValue="">
                <option value="">Select…</option>
                {projectTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="location" className={label}>Project location</label>
              <input id="location" name="location" className={field} placeholder="e.g. Ikeja, Lagos" />
            </div>
            <div>
              <label htmlFor="budget" className={label}>Estimated budget (optional)</label>
              <select id="budget" name="budget" className={field} defaultValue="">
                <option value="">Select…</option>
                {budgets.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="preferredContact" className={label}>Preferred contact method</label>
              <select id="preferredContact" name="preferredContact" className={field} defaultValue="">
                <option value="">No preference</option>
                <option>Phone</option>
                <option>Email</option>
                <option>WhatsApp</option>
              </select>
            </div>
          </>
        )}
      </div>
      <div>
        <label htmlFor="message" className={label}>{type === "quote" ? "Project description" : "Message"} <span className="text-brand">*</span></label>
        <textarea id="message" name="message" required rows={6} className={field} placeholder={type === "quote" ? "Describe the structure, size, site conditions and timeline…" : "How can we help?"} {...aria("message")} />
        {err("message")}
      </div>
      {type === "quote" && (
        <div>
          <label htmlFor="attachment" className={label}>Attachment (optional)</label>
          <input id="attachment" name="attachment" type="file" accept=".pdf,image/jpeg,image/png,image/webp" className={cn(field, "file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white")} {...aria("attachment")} />
          <p className="mt-1 text-xs text-ink/50">Drawings, plans or photos — PDF, JPG, PNG or WebP up to 8 MB.</p>
          {err("attachment")}
        </div>
      )}
      {error && <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
      <button type="submit" disabled={status === "submitting"} className="btn-primary w-full sm:w-auto disabled:opacity-60">
        {status === "submitting" ? "Sending…" : type === "quote" ? "Submit quote request" : "Send message"}
      </button>
    </form>
  );
}
