import type { Metadata } from "next";
import { getImage, getPage } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/settings";

/** Metadata for a CMS-managed page (uses per-page SEO overrides when set). */
export async function pageMetadata(slug: string, path: string, fallbackTitle: string, fallbackDescription?: string, opts: { absolute?: boolean } = {}): Promise<Metadata> {
  const [s, page] = await Promise.all([getSiteSettings(), getPage(slug)]);
  const og = await getImage(s.branding.ogImageId);
  const title = page.seoTitle || fallbackTitle;
  return buildMetadata(s, {
    title: opts.absolute ? { absolute: title } : title,
    description: page.seoDescription || fallbackDescription || page.content.intro || "",
    path,
    image: og?.large,
  });
}
