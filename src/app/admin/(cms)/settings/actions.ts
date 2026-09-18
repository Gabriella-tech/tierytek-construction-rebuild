"use server";

import { parseIdList, requireActionUser, revalidateSite } from "@/lib/admin-helpers";
import { saveSetting } from "@/lib/settings";
import type { ActionState } from "@/lib/types";
import { parseLines, str } from "@/lib/utils";

function url(value: FormDataEntryValue | null): string {
  const v = str(value);
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export async function saveBranding(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireActionUser("admin");
  if (!auth.ok) return auth.state;
  await saveSetting("branding", {
    logoId: parseIdList(fd.get("logoId"))[0] ?? null,
    logoDarkId: parseIdList(fd.get("logoDarkId"))[0] ?? null,
    faviconId: parseIdList(fd.get("faviconId"))[0] ?? null,
    ogImageId: parseIdList(fd.get("ogImageId"))[0] ?? null,
  });
  revalidateSite();
  return { ok: true, message: "Branding saved." };
}

export async function saveBusiness(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireActionUser("admin");
  if (!auth.ok) return auth.state;
  const email = str(fd.get("email"));
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Enter a valid email address.", fieldErrors: { email: "Invalid email." } };
  await saveSetting("business", {
    displayName: str(fd.get("displayName")) || "Tierytek Construction",
    legalName: str(fd.get("legalName")),
    tagline: str(fd.get("tagline")),
    addressLine1: str(fd.get("addressLine1")),
    addressLine2: str(fd.get("addressLine2")),
    city: str(fd.get("city")),
    state: str(fd.get("state")),
    country: str(fd.get("country")),
    phones: parseLines(str(fd.get("phones"))),
    whatsapp: str(fd.get("whatsapp")),
    email,
    hours: parseLines(str(fd.get("hours"))),
    mapLink: url(fd.get("mapLink")),
    mapEmbedUrl: url(fd.get("mapEmbedUrl")),
    serviceAreas: parseLines(str(fd.get("serviceAreas"))),
    footerAbout: str(fd.get("footerAbout")),
    copyrightName: str(fd.get("copyrightName")),
  });
  revalidateSite();
  return { ok: true, message: "Business information saved." };
}

export async function saveSocial(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireActionUser("admin");
  if (!auth.ok) return auth.state;
  await saveSetting("social", {
    facebook: url(fd.get("facebook")),
    instagram: url(fd.get("instagram")),
    linkedin: url(fd.get("linkedin")),
    x: url(fd.get("x")),
    youtube: url(fd.get("youtube")),
    tiktok: url(fd.get("tiktok")),
  });
  revalidateSite();
  return { ok: true, message: "Social links saved." };
}

export async function saveSeo(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireActionUser("admin");
  if (!auth.ok) return auth.state;
  const template = str(fd.get("titleTemplate")) || "%s | Tierytek Construction";
  await saveSetting("seo", {
    siteName: str(fd.get("siteName")) || "Tierytek Construction",
    titleTemplate: template.includes("%s") ? template : `%s | ${template}`,
    defaultDescription: str(fd.get("defaultDescription")).slice(0, 320),
    robotsIndex: fd.get("robotsIndex") === "1",
    googleSiteVerification: str(fd.get("googleSiteVerification")).slice(0, 200),
    foundingYear: str(fd.get("foundingYear")).slice(0, 4),
  });
  revalidateSite();
  return { ok: true, message: "SEO settings saved." };
}
