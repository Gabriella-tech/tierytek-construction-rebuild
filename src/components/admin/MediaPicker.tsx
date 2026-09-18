"use client";

/**
 * MediaPicker — select one or many images for a content item.
 *  - Upload new images (drag & drop or file dialog) with progress
 *  - Choose existing images from the Media Library
 *  - Remove / reorder before saving
 * The chosen media IDs are written to a hidden input so the parent <form>
 * submits them with the rest of the fields.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaLite } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  label: string;
  multiple?: boolean;
  initial: MediaLite[];
  hint?: string;
};

type UploadResponse = { items?: MediaLite[]; errors?: string[]; error?: string };

export function MediaPicker({ name, label, multiple = false, initial, hint }: Props) {
  const [items, setItems] = useState<MediaLite[]>(initial);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const add = useCallback(
    (incoming: MediaLite[]) => {
      setItems((prev) => {
        if (!multiple) return incoming.slice(0, 1);
        const ids = new Set(prev.map((p) => p.id));
        return [...prev, ...incoming.filter((i) => !ids.has(i.id))];
      });
    },
    [multiple],
  );

  const upload = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      if (!list.length) return;
      setError("");
      setProgress(0);
      const fd = new FormData();
      list.forEach((f) => fd.append("files", f));
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/admin/media");
      xhr.upload.onprogress = (e) => setProgress(e.lengthComputable ? Math.round((e.loaded / e.total) * 100) : 0);
      xhr.onload = () => {
        setProgress(null);
        try {
          const res = JSON.parse(xhr.responseText) as UploadResponse;
          if (res.items?.length) add(res.items);
          if (res.errors?.length) setError(res.errors.join(" "));
          else if (!res.items?.length) setError(res.error || "Upload failed.");
        } catch {
          setError("Upload failed. Please try again.");
        }
      };
      xhr.onerror = () => {
        setProgress(null);
        setError("Network error during upload. Nothing was saved.");
      };
      xhr.send(fd);
    },
    [add],
  );

  const move = (index: number, dir: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const value = multiple ? JSON.stringify(items.map((i) => i.id)) : String(items[0]?.id ?? "");

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-neutral-800">{label}</span>
      <input type="hidden" name={name} value={value} />

      {items.length > 0 && (
        <ul className={cn("grid gap-3", multiple ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1 sm:max-w-sm")}>
          {items.map((item, i) => (
            <li key={item.id} className="group relative overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
              <img src={item.thumb} alt={item.alt || item.filename} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              {!item.alt && (
                <span className="absolute left-1.5 top-1.5 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-white" title="Add alt text in the Media Library">
                  No alt text
                </span>
              )}
              <div className="flex items-center justify-between gap-1 bg-white px-2 py-1.5 text-xs">
                <span className="truncate text-neutral-600" title={item.filename}>{item.filename}</span>
                <span className="flex shrink-0 items-center gap-0.5">
                  {multiple && (
                    <>
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier" className="rounded px-1 hover:bg-neutral-100 disabled:opacity-30">←</button>
                      <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move later" className="rounded px-1 hover:bg-neutral-100 disabled:opacity-30">→</button>
                    </>
                  )}
                  <button type="button" onClick={() => setItems((prev) => prev.filter((p) => p.id !== item.id))} aria-label={`Remove ${item.filename}`} className="rounded px-1 text-red-600 hover:bg-red-50">✕</button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files); }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-center text-sm transition-colors",
          dragging ? "border-brand bg-orange-50" : "border-neutral-300 bg-neutral-50",
        )}
      >
        {progress !== null ? (
          <div className="w-full max-w-xs">
            <p className="mb-1 text-xs font-medium text-neutral-700">Uploading… {progress}%</p>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
              <div className="h-full bg-brand transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <>
            <p className="text-neutral-600">Drag & drop {multiple ? "images" : "an image"} here, or</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => fileInput.current?.click()} className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-100">
                Upload {multiple ? "images" : "image"}
              </button>
              <button type="button" onClick={() => setLibraryOpen(true)} className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-100">
                Choose from library
              </button>
            </div>
            <p className="text-xs text-neutral-400">JPG, PNG, WebP, AVIF or GIF · max 15 MB each</p>
          </>
        )}
        <input ref={fileInput} type="file" accept="image/*" multiple={multiple} className="sr-only" onChange={(e) => { if (e.target.files) upload(e.target.files); e.target.value = ""; }} />
      </div>
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
      {error && <p role="alert" className="text-xs font-medium text-red-600">{error}</p>}

      {libraryOpen && <LibraryDialog multiple={multiple} onClose={() => setLibraryOpen(false)} onSelect={(sel) => { add(sel); setLibraryOpen(false); }} />}
    </div>
  );
}

function LibraryDialog({ multiple, onClose, onSelect }: { multiple: boolean; onClose: () => void; onSelect: (items: MediaLite[]) => void }) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MediaLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MediaLite[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);
      fetch(`/api/admin/media?q=${encodeURIComponent(query)}&limit=96`, { signal: controller.signal })
        .then((r) => r.json())
        .then((d: { items: MediaLite[] }) => setItems(d.items ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 200);
    return () => { clearTimeout(t); controller.abort(); };
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (item: MediaLite) => {
    if (!multiple) { onSelect([item]); return; }
    setSelected((prev) => (prev.some((p) => p.id === item.id) ? prev.filter((p) => p.id !== item.id) : [...prev, item]));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Media library" onClick={(e) => e.stopPropagation()} className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-t-xl bg-white shadow-2xl sm:rounded-xl">
        <div className="flex items-center gap-3 border-b border-neutral-200 p-4">
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by file name, alt text or caption…" className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30" />
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-2 hover:bg-neutral-100">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="py-10 text-center text-sm text-neutral-500">Loading…</p>
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-500">No images found. Upload some first.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {items.map((item) => {
                const isSel = selected.some((s) => s.id === item.id);
                return (
                  <li key={item.id}>
                    <button type="button" onClick={() => toggle(item)} aria-pressed={isSel} className={cn("block w-full overflow-hidden rounded-md border-2 bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand", isSel ? "border-brand" : "border-transparent")}>
                      <img src={item.thumb} alt={item.alt || item.filename} className="aspect-square w-full object-cover" loading="lazy" />
                    </button>
                    <p className="mt-1 truncate text-[11px] text-neutral-500" title={item.filename}>{item.filename}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {multiple && (
          <div className="flex items-center justify-between border-t border-neutral-200 p-4">
            <span className="text-sm text-neutral-600">{selected.length} selected</span>
            <button type="button" disabled={!selected.length} onClick={() => onSelect(selected)} className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
              Add selected
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
