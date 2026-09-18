import { cn } from "@/lib/utils";

/**
 * Decorative structural-steel line drawing used where no photograph has been
 * uploaded yet. Purely illustrative — it never pretends to be project photography.
 */
export function StructuralGraphic({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const stroke = tone === "dark" ? "rgba(255,255,255,0.28)" : "rgba(17,17,17,0.22)";
  const accent = "#ff6a00";
  return (
    <div className={cn("relative overflow-hidden", tone === "dark" ? "bg-ink-2" : "bg-surface", className)} aria-hidden>
      <div className="grid-texture absolute inset-0" />
      <svg viewBox="0 0 800 600" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" fill="none">
        <g stroke={stroke} strokeWidth="2">
          <path d="M120 520 L120 140 L400 60 L680 140 L680 520" />
          <path d="M120 140 L400 220 L680 140" />
          <path d="M400 60 L400 520" />
          <path d="M120 300 L400 380 L680 300" />
          <path d="M120 420 L400 500 L680 420" />
          <path d="M260 100 L260 520 M540 100 L540 520" />
          <path d="M120 140 L260 300 M260 100 L400 220 M400 220 L540 300 M540 100 L680 140" strokeDasharray="6 8" />
          <path d="M120 300 L260 420 M400 380 L540 500 M260 300 L400 380 M540 300 L680 420" strokeDasharray="6 8" />
        </g>
        <g stroke={accent} strokeWidth="3">
          <path d="M120 520 L680 520" />
          <path d="M400 60 L400 220" />
        </g>
        <g fill={accent}>
          <circle cx="400" cy="60" r="5" />
          <circle cx="120" cy="140" r="4" />
          <circle cx="680" cy="140" r="4" />
        </g>
      </svg>
    </div>
  );
}
