import type { ImageSource } from "@/lib/queries";
import { cn } from "@/lib/utils";

type Props = {
  image: ImageSource;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  aspect?: string; // e.g. "aspect-[4/3]"
};

/** Responsive <img> using the WebP variants generated at upload time. */
export function Picture({ image, sizes = "(min-width: 1024px) 50vw, 100vw", className, imgClassName, priority, aspect }: Props) {
  return (
    <div className={cn("overflow-hidden bg-surface-2", aspect, className)}>
      <img
        src={image.src}
        srcSet={image.srcSet}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt={image.alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        className={cn("h-full w-full object-cover", imgClassName)}
      />
    </div>
  );
}
