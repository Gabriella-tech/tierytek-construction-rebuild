import { ActionForm } from "@/components/admin/ActionForm";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Alert, Card, PageHeader } from "@/components/admin/ui";
import { mediaLite } from "@/lib/admin-helpers";
import { requireUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { saveBranding } from "../actions";

export const metadata = { title: "Branding" };

export default async function BrandingPage() {
  await requireUser("admin");
  const { branding } = await getSiteSettings();
  const [logo, logoDark, favicon, og] = await Promise.all([mediaLite([branding.logoId]), mediaLite([branding.logoDarkId]), mediaLite([branding.faviconId]), mediaLite([branding.ogImageId])]);
  return (
    <>
      <PageHeader title="Branding" description="Upload the official Tierytek logo and icons. Until a logo is uploaded, a plain text wordmark is shown as a temporary placeholder." />
      <div className="mb-4"><Alert tone="orange">Use the official Tierytek logo files exactly as supplied — do not recolour or recreate them. PNG or SVG-exported PNG with a transparent background works best.</Alert></div>
      <ActionForm action={saveBranding}>
        <Card title="Logo">
          <div className="space-y-6">
            <MediaPicker name="logoId" label="Primary logo (on light backgrounds)" initial={logo} hint="Shown in the website header. Recommended: transparent PNG, at least 600px wide." />
            <MediaPicker name="logoDarkId" label="Logo for dark backgrounds (optional)" initial={logoDark} hint="Used in the footer and dark sections. Falls back to the primary logo." />
          </div>
        </Card>
        <Card title="Icons & sharing image">
          <div className="space-y-6">
            <MediaPicker name="faviconId" label="Favicon / site icon" initial={favicon} hint="Square image, at least 512×512px (PNG). Used for the browser tab, Apple touch icon and web app icon." />
            <MediaPicker name="ogImageId" label="Default social sharing image" initial={og} hint="1200×630px recommended. Shown when pages are shared on WhatsApp, LinkedIn, Facebook and X." />
          </div>
        </Card>
      </ActionForm>
    </>
  );
}
