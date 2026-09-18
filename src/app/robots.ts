import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/settings";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getSiteSettings();
  return {
    rules: s.seo.robotsIndex
      ? [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
