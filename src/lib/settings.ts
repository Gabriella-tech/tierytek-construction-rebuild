/**
 * Site settings stored as JSON documents in the `settings` table.
 * Defaults below come from the existing Tierytek website; items marked
 * "CONFIRM" in the admin UI were inconsistent on the old site.
 */
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

export type BrandingSettings = {
  logoId: number | null;
  logoDarkId: number | null;
  faviconId: number | null;
  ogImageId: number | null;
};

export type BusinessSettings = {
  displayName: string;
  legalName: string;
  tagline: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  phones: string[];
  whatsapp: string;
  email: string;
  hours: string[];
  mapLink: string;
  mapEmbedUrl: string;
  serviceAreas: string[];
  footerAbout: string;
  copyrightName: string;
};

export type SocialSettings = {
  facebook: string;
  instagram: string;
  linkedin: string;
  x: string;
  youtube: string;
  tiktok: string;
};

export type SeoSettings = {
  siteName: string;
  titleTemplate: string;
  defaultDescription: string;
  robotsIndex: boolean;
  googleSiteVerification: string;
  foundingYear: string;
};

export const DEFAULT_BRANDING: BrandingSettings = {
  logoId: null,
  logoDarkId: null,
  faviconId: null,
  ogImageId: null,
};

export const DEFAULT_BUSINESS: BusinessSettings = {
  displayName: "Tierytek Construction",
  legalName: "Tierytek Construction Steel Company",
  tagline: "Steel construction, roofing and renovation across Nigeria",
  addressLine1: "2, Olorunsogo Street, Off Badagry Expressway",
  addressLine2: "Orile Iganmu",
  city: "Lagos",
  state: "Lagos State",
  country: "Nigeria",
  phones: ["+234 3916 9697", "+234 5299 8888"],
  whatsapp: "",
  email: "tierytek@gmail.com",
  hours: [],
  mapLink: "https://www.google.com/maps?q=2,Olorunsogo+Street,+Off+Badagry+Exp.+Way,+Orile+Iganmu+Lagos",
  mapEmbedUrl: "",
  serviceAreas: ["Lagos", "Nigeria"],
  footerAbout:
    "Experts in pre-engineered buildings (PEB), steel frameworks, roofing and renovation. Building with integrity and innovation.",
  copyrightName: "Tierytek Construction Steel Company",
};

export const DEFAULT_SOCIAL: SocialSettings = {
  facebook: "",
  instagram: "",
  linkedin: "",
  x: "",
  youtube: "",
  tiktok: "",
};

export const DEFAULT_SEO: SeoSettings = {
  siteName: "Tierytek Construction",
  titleTemplate: "%s | Tierytek Construction",
  defaultDescription:
    "Tierytek Construction is a steel construction company in Lagos, Nigeria, specialising in steel frameworks, pre-engineered buildings, roofing solutions, renovation, structural engineering and architectural design.",
  robotsIndex: true,
  googleSiteVerification: "",
  foundingYear: "",
};

export type SettingsKey = "branding" | "business" | "social" | "seo";

export async function getSetting<T extends Record<string, unknown>>(key: SettingsKey, defaults: T): Promise<T> {
  const [row] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return { ...defaults, ...((row?.value as Partial<T>) ?? {}) };
}

export async function saveSetting(key: SettingsKey, value: Record<string, unknown>): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
}

export type SiteSettings = {
  branding: BrandingSettings;
  business: BusinessSettings;
  social: SocialSettings;
  seo: SeoSettings;
};

/** Deduplicated per request (layout + pages share one query). */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await db.select().from(settings);
  const byKey = new Map(rows.map((r) => [r.key, r.value]));
  const merge = <T extends Record<string, unknown>>(key: SettingsKey, defaults: T): T => ({
    ...defaults,
    ...((byKey.get(key) as Partial<T> | undefined) ?? {}),
  });
  return {
    branding: merge("branding", DEFAULT_BRANDING),
    business: merge("business", DEFAULT_BUSINESS),
    social: merge("social", DEFAULT_SOCIAL),
    seo: merge("seo", DEFAULT_SEO),
  };
});

export function formatAddress(b: BusinessSettings): string {
  return [b.addressLine1, b.addressLine2, b.city, b.state, b.country].filter(Boolean).join(", ");
}
