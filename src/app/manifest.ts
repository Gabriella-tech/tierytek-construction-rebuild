import type { MetadataRoute } from "next";
import { getImage } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSiteSettings();
  const icon = await getImage(s.branding.faviconId);
  return {
    name: s.seo.siteName,
    short_name: s.business.displayName.split(" ")[0] || "Tierytek",
    description: s.seo.defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#111111",
    icons: icon
      ? [{ src: icon.thumb, sizes: "any", type: "image/webp" }, { src: icon.original, sizes: "any" }]
      : [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
