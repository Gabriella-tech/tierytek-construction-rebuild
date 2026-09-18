import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Montserrat } from "next/font/google";
import { ensureSeededOnce } from "@/db/seed";
import { getSiteSettings } from "@/lib/settings";
import { getImage } from "@/lib/queries";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", weight: ["500", "600", "700", "800"], display: "swap" });

/* Content is managed in the CMS, so every page renders from the database on request. */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  await ensureSeededOnce();
  const s = await getSiteSettings();
  const [favicon, og] = await Promise.all([getImage(s.branding.faviconId), getImage(s.branding.ogImageId)]);
  const iconUrl = favicon?.original ?? "/icon.svg";
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: s.seo.siteName, template: s.seo.titleTemplate },
    description: s.seo.defaultDescription,
    applicationName: s.seo.siteName,
    robots: s.seo.robotsIndex ? { index: true, follow: true } : { index: false, follow: false },
    icons: favicon
      ? { icon: [{ url: iconUrl }], apple: [{ url: favicon.thumb }], shortcut: [{ url: iconUrl }] }
      : { icon: [{ url: "/icon.svg", type: "image/svg+xml" }] },
    openGraph: { type: "website", siteName: s.seo.siteName, locale: "en_NG", ...(og ? { images: [{ url: og.large, width: og.width, height: og.height }] } : {}) },
    twitter: { card: og ? "summary_large_image" : "summary" },
    ...(s.seo.googleSiteVerification ? { verification: { google: s.seo.googleSiteVerification } } : {}),
  };
}

export const viewport: Viewport = { themeColor: "#111111", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-NG" className={`${inter.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
