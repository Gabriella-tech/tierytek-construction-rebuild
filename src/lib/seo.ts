/**
 * SEO helpers: Next.js metadata builder + JSON-LD structured data.
 * Structured data only ever includes information that exists in settings —
 * no ratings, reviews, awards or invented facts.
 */
import type { Metadata } from "next";
import type { Insight, Service } from "@/db/schema";
import type { SiteSettings } from "@/lib/settings";
import { formatAddress } from "@/lib/settings";
import { absoluteUrl, siteUrl, truncate } from "@/lib/utils";

export type MetaInput = {
  title?: string | { absolute: string };
  description?: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  noIndex?: boolean;
  publishedTime?: string;
};

export function buildMetadata(s: SiteSettings, input: MetaInput): Metadata {
  const description = truncate(input.description || s.seo.defaultDescription, 160);
  const url = absoluteUrl(input.path);
  const image = input.image ? absoluteUrl(input.image) : undefined;
  const title = input.title ?? s.seo.siteName;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: s.seo.robotsIndex && !input.noIndex ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: input.type ?? "website",
      title: typeof title === "string" ? title : s.seo.siteName,
      description,
      url,
      siteName: s.seo.siteName,
      locale: "en_NG",
      ...(image ? { images: [{ url: image }] } : {}),
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: typeof title === "string" ? title : s.seo.siteName,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

type JsonLdObject = Record<string, unknown>;

export function organizationJsonLd(s: SiteSettings, logoUrl?: string | null): JsonLdObject {
  const b = s.business;
  const sameAs = Object.values(s.social).filter(Boolean);
  const data: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": ["Organization", "GeneralContractor"],
    "@id": `${siteUrl()}/#organization`,
    name: b.displayName,
    url: siteUrl(),
  };
  if (b.legalName) data.legalName = b.legalName;
  if (logoUrl) data.logo = absoluteUrl(logoUrl);
  if (b.phones[0]) data.telephone = b.phones[0];
  if (b.email) data.email = b.email;
  if (b.addressLine1 || b.city) {
    data.address = {
      "@type": "PostalAddress",
      streetAddress: [b.addressLine1, b.addressLine2].filter(Boolean).join(", "),
      addressLocality: b.city,
      addressRegion: b.state,
      addressCountry: b.country || "NG",
    };
  }
  if (b.serviceAreas.length) data.areaServed = b.serviceAreas.map((name) => ({ "@type": "Place", name }));
  if (sameAs.length) data.sameAs = sameAs;
  if (s.seo.foundingYear) data.foundingDate = s.seo.foundingYear;
  if (b.hours.length) data.openingHours = b.hours;
  return data;
}

export function websiteJsonLd(s: SiteSettings): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl()}/#website`,
    name: s.seo.siteName,
    url: siteUrl(),
    publisher: { "@id": `${siteUrl()}/#organization` },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceJsonLd(service: Service, s: SiteSettings, image?: string | null): JsonLdObject {
  const data: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: truncate(service.seoDescription || service.excerpt, 300),
    url: absoluteUrl(`/services/${service.slug}`),
    provider: { "@id": `${siteUrl()}/#organization` },
  };
  if (service.category) data.serviceType = service.category;
  if (s.business.serviceAreas.length) data.areaServed = s.business.serviceAreas.map((name) => ({ "@type": "Place", name }));
  if (image) data.image = absoluteUrl(image);
  return data;
}

export function articleJsonLd(post: Insight, s: SiteSettings, image?: string | null): JsonLdObject {
  const data: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: truncate(post.seoDescription || post.excerpt, 300),
    url: absoluteUrl(`/insights/${post.slug}`),
    datePublished: (post.publishedAt ?? post.createdAt).toISOString(),
    dateModified: post.updatedAt.toISOString(),
    publisher: { "@id": `${siteUrl()}/#organization` },
  };
  if (post.author) data.author = { "@type": "Person", name: post.author };
  else data.author = { "@type": "Organization", name: s.business.displayName };
  if (image) data.image = absoluteUrl(image);
  return data;
}

export function formatPostalAddress(s: SiteSettings): string {
  return formatAddress(s.business);
}
