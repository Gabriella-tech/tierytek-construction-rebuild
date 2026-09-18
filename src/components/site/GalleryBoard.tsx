"use client";

/**
 * Masonry gallery + accessible lightbox (keyboard, focus, Escape, swipe-friendly).
 * Receives plain serialisable data from the server.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ImageSource } from "@/lib/queries";
import { cn } from "@/lib/utils";

export type GalleryBoardItem = {
  id: number;
  title: string;
  category: string;
  client: string;
  projectName: string;
  location: string;
  year: string;
  caption: string;
  description: string;
  projectSlug: string | null;
  images: ImageSource[];
};

type Slide = { item: GalleryBoardItem; image: ImageSource; index: number };

export function GalleryBoard({ items, compact = false, expand = false }: { items: GalleryBoardItem[]; compact?: boolean; expand?: boolean }) {
  const slides: Slide[] = [];
  items.forEach((item) => item.images.forEach((image, index) => slides.push({ item, image, index })));
  // "expand" renders one tile per image (used on project pages) instead of one tile per item.
  const tiles: Array<{ key: string; item: GalleryBoardItem; cover: ImageSource; slideIndex: number; count: number }> = expand
    ? slides.map((s, i) => ({ key: `${s.item.id}-${s.image.id}-${i}`, item: s.item, cover: s.image, slideIndex: i, count: 1 }))
    : items.filter((it) => it.images[0]).map((it) => ({ key: String(it.id), item: it, cover: it.images[0], slideIndex: slides.findIndex((s) => s.item.id === it.id), count: it.images.length }));
  const [current, setCurrent] = useState<number | null>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);

  const open = (slideIndex: number, trigger: HTMLElement) => {
    lastTrigger.current = trigger;
    setCurrent(slideIndex);
  };
  const close = useCallback(() => {
    setCurrent(null);
    lastTrigger.current?.focus();
  }, []);

  return (
    <>
      <ul className={cn("masonry", compact && "lg:[columns:4]")}>
        {tiles.map(({ key, item, cover, slideIndex, count }, i) => {
          const tall = cover.height > cover.width;
          return (
            <li key={key}>
              <button
                type="button"
                onClick={(e) => open(slideIndex, e.currentTarget)}
                className="img-zoom group relative block w-full overflow-hidden bg-surface-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                aria-label={`Open ${item.title}${count > 1 ? ` (${count} images)` : ""}`}
              >
                <img
                  src={cover.src}
                  srcSet={cover.srcSet}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                  width={cover.width}
                  height={cover.height}
                  alt={cover.alt || item.title}
                  loading={i < 3 ? "eager" : "lazy"}
                  decoding="async"
                  className={cn("w-full object-cover", tall ? "max-h-[720px]" : "")}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-4 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                  {item.category && <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">{item.category}</p>}
                  <p className="font-display text-base font-semibold leading-tight">{item.title}</p>
                  {(item.location || item.year) && <p className="mt-0.5 text-xs text-white/70">{[item.location, item.year].filter(Boolean).join(" · ")}</p>}
                </div>
                {count > 1 && (
                  <span className="absolute right-3 top-3 rounded-sm bg-ink/70 px-2 py-0.5 text-[11px] font-medium text-white">{count}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {current !== null && slides[current] && <Lightbox slides={slides} index={current} onIndex={setCurrent} onClose={close} />}
    </>
  );
}

function Lightbox({ slides, index, onIndex, onClose }: { slides: Slide[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const { item, image } = slides[index];
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);
  const prev = useCallback(() => onIndex((index - 1 + slides.length) % slides.length), [index, slides.length, onIndex]);
  const next = useCallback(() => onIndex((index + 1) % slides.length), [index, slides.length, onIndex]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>("button, a[href]");
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", onKey); };
  }, [onClose, prev, next]);

  const meta = [item.client && `Client: ${item.client}`, item.projectName, item.location, item.year].filter(Boolean).join(" · ");

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title} — image ${index + 1} of ${slides.length}`}
      tabIndex={-1}
      className="fixed inset-0 z-[60] flex flex-col bg-ink/95 text-white outline-none"
      onClick={onClose}
      onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
        touchStart.current = null;
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs text-white/60">{index + 1} / {slides.length}</p>
        <button type="button" onClick={onClose} aria-label="Close" className="inline-flex h-11 w-11 items-center justify-center border border-white/25 hover:bg-white hover:text-ink">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
        <img key={image.id} src={image.large} alt={image.alt || item.title} className="max-h-full max-w-full object-contain motion-safe:animate-[fadeIn_.3s_ease]" onClick={(e) => e.stopPropagation()} />
        {slides.length > 1 && (
          <>
            <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous image" className="absolute left-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/25 bg-ink/50 hover:bg-white hover:text-ink sm:left-4">‹</button>
            <button type="button" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next image" className="absolute right-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/25 bg-ink/50 hover:bg-white hover:text-ink sm:right-4">›</button>
          </>
        )}
      </div>
      <div className="px-4 py-4 sm:px-6" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto flex max-w-4xl flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {item.category && <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">{item.category}</p>}
            <p className="font-display text-lg font-semibold">{item.title}</p>
            {(image.caption || item.caption) && <p className="text-sm text-white/75">{image.caption || item.caption}</p>}
            {meta && <p className="mt-1 text-xs text-white/55">{meta}</p>}
          </div>
          {item.projectSlug && <Link href={`/projects/${item.projectSlug}`} className="link-arrow text-white hover:text-brand">View project</Link>}
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  );
}
