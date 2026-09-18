"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionForm } from "@/components/admin/ActionForm";
import { Field, Input, Textarea } from "@/components/admin/ui";
import type { ActionState } from "@/lib/types";
import { cn } from "@/lib/utils";

export function UploadZone() {
  const router = useRouter();
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const upload = (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    setMessage("");
    setProgress(0);
    const fd = new FormData();
    list.forEach((f) => fd.append("files", f));
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media");
    xhr.upload.onprogress = (e) => setProgress(e.lengthComputable ? Math.round((e.loaded / e.total) * 100) : 0);
    xhr.onload = () => {
      setProgress(null);
      try {
        const res = JSON.parse(xhr.responseText) as { items?: unknown[]; errors?: string[]; error?: string };
        const n = res.items?.length ?? 0;
        setMessage([n ? `${n} image${n === 1 ? "" : "s"} uploaded.` : "", ...(res.errors ?? []), !n && res.error ? res.error : ""].filter(Boolean).join(" "));
        if (n) router.refresh();
      } catch {
        setMessage("Upload failed.");
      }
    };
    xhr.onerror = () => { setProgress(null); setMessage("Network error — nothing was uploaded."); };
    xhr.send(fd);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files); }}
      className={cn("mb-6 rounded-lg border-2 border-dashed p-6 text-center", dragging ? "border-brand bg-orange-50" : "border-neutral-300 bg-white")}
    >
      {progress !== null ? (
        <div className="mx-auto max-w-sm">
          <p className="mb-1 text-sm font-medium">Uploading and optimising… {progress}%</p>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-200"><div className="h-full bg-brand transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      ) : (
        <>
          <p className="text-sm text-neutral-700">Drag & drop images here, or</p>
          <button type="button" onClick={() => input.current?.click()} className="mt-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Upload images</button>
          <p className="mt-2 text-xs text-neutral-500">Up to 20 at a time · JPG, PNG, WebP, AVIF, GIF · max 15 MB each. Responsive WebP versions are generated automatically.</p>
          <input ref={input} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { if (e.target.files) upload(e.target.files); e.target.value = ""; }} />
        </>
      )}
      {message && <p className="mt-3 text-sm text-neutral-700" role="status">{message}</p>}
    </div>
  );
}

export function MediaEditForm({ id, alt, caption, action }: { id: number; alt: string; caption: string; action: (prev: ActionState, fd: FormData) => Promise<ActionState> }) {
  return (
    <ActionForm action={action} submitLabel="Save" className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <Field label="Alt text" htmlFor={`alt-${id}`} hint="Describe the image for accessibility and SEO."><Input id={`alt-${id}`} name="alt" defaultValue={alt} maxLength={300} placeholder="e.g. Steel portal frame during erection" /></Field>
      <Field label="Caption" htmlFor={`cap-${id}`}><Textarea id={`cap-${id}`} name="caption" rows={2} defaultValue={caption} /></Field>
    </ActionForm>
  );
}
