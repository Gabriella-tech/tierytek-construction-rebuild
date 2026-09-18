import Link from "next/link";
import type { ImageSource } from "@/lib/queries";
import { cn } from "@/lib/utils";

/**
 * Brand mark. Uses the official logo uploaded in Admin → Branding.
 * Until then a plain typographic placeholder is shown (intentionally not a
 * generated logo — it is replaced automatically once the real file is uploaded).
 */
export function Logo({ image, name, tone = "light", className }: { image: ImageSource | null; name: string; tone?: "light" | "dark"; className?: string }) {
  return (
    <Link href="/" aria-label={`${name} — home`} className={cn("inline-flex items-center", className)}>
      {image ? (
        <img src={image.src} srcSet={image.srcSet} sizes="200px" alt={image.alt || name} width={image.width} height={image.height} className="h-10 w-auto sm:h-11" />
      ) : (
        <span className="flex flex-col leading-none">
          <span className={cn("font-display text-xl font-extrabold tracking-[0.18em] sm:text-[1.35rem]", tone === "light" ? "text-ink" : "text-white")}>TIERYTEK</span>
          <span className={cn("mt-1 text-[9px] font-semibold uppercase tracking-[0.42em]", tone === "light" ? "text-brand" : "text-brand")}>Construction</span>
        </span>
      )}
    </Link>
  );
}
