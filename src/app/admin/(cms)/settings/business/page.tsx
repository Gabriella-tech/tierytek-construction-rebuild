import { ActionForm } from "@/components/admin/ActionForm";
import { Alert, Card, Field, FormGrid, Input, PageHeader, Textarea } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { saveBusiness } from "../actions";

export const metadata = { title: "Business information" };

export default async function BusinessPage() {
  await requireUser("admin");
  const { business: b } = await getSiteSettings();
  return (
    <>
      <PageHeader title="Business information" description="Shown in the header, footer, Contact page and in structured data for Google. Keep it identical to your Google Business Profile." />
      <div className="mb-4">
        <Alert tone="orange">
          <strong>Please confirm:</strong> the previous website used several company names (“Tierytek Construction”, “Tierytek Construction Steel Company”, “Tierytek Constructions Steel Company”) and the two phone numbers appear shorter than standard Nigerian numbers. Correct them here — nothing has been guessed.
        </Alert>
      </div>
      <ActionForm action={saveBusiness}>
        <Card title="Company">
          <FormGrid>
            <Field label="Display name" htmlFor="displayName" required><Input id="displayName" name="displayName" defaultValue={b.displayName} required /></Field>
            <Field label="Legal / registered name" htmlFor="legalName" hint="Used in structured data."><Input id="legalName" name="legalName" defaultValue={b.legalName} /></Field>
            <Field label="Tagline" htmlFor="tagline"><Input id="tagline" name="tagline" defaultValue={b.tagline} /></Field>
            <Field label="Copyright name" htmlFor="copyrightName" hint="Appears as “© {year} {name}. All rights reserved.”"><Input id="copyrightName" name="copyrightName" defaultValue={b.copyrightName} /></Field>
          </FormGrid>
          <div className="mt-5"><Field label="Footer description" htmlFor="footerAbout"><Textarea id="footerAbout" name="footerAbout" rows={3} defaultValue={b.footerAbout} /></Field></div>
        </Card>
        <Card title="Address & contact">
          <FormGrid>
            <Field label="Address line 1" htmlFor="addressLine1"><Input id="addressLine1" name="addressLine1" defaultValue={b.addressLine1} /></Field>
            <Field label="Address line 2" htmlFor="addressLine2"><Input id="addressLine2" name="addressLine2" defaultValue={b.addressLine2} /></Field>
            <Field label="City" htmlFor="city"><Input id="city" name="city" defaultValue={b.city} /></Field>
            <Field label="State" htmlFor="state"><Input id="state" name="state" defaultValue={b.state} /></Field>
            <Field label="Country" htmlFor="country"><Input id="country" name="country" defaultValue={b.country} /></Field>
            <Field label="Email" htmlFor="email"><Input id="email" name="email" type="email" defaultValue={b.email} /></Field>
            <Field label="Phone numbers" htmlFor="phones" hint="One per line, e.g. +234 801 234 5678"><Textarea id="phones" name="phones" rows={3} defaultValue={b.phones.join("\n")} /></Field>
            <Field label="WhatsApp number" htmlFor="whatsapp" hint="Full international format. Leave blank to hide the WhatsApp button."><Input id="whatsapp" name="whatsapp" defaultValue={b.whatsapp} placeholder="+234…" /></Field>
            <Field label="Business hours" htmlFor="hours" hint="One per line, e.g. Mon–Fri 08:00–17:00"><Textarea id="hours" name="hours" rows={3} defaultValue={b.hours.join("\n")} /></Field>
            <Field label="Service areas" htmlFor="serviceAreas" hint="One per line, only areas you genuinely serve."><Textarea id="serviceAreas" name="serviceAreas" rows={3} defaultValue={b.serviceAreas.join("\n")} /></Field>
          </FormGrid>
        </Card>
        <Card title="Map">
          <FormGrid>
            <Field label="Google Maps link" htmlFor="mapLink" hint="The 'Share' link from Google Maps."><Input id="mapLink" name="mapLink" defaultValue={b.mapLink} /></Field>
            <Field label="Google Maps embed URL (optional)" htmlFor="mapEmbedUrl" hint="From Google Maps → Share → Embed a map → copy only the src URL. Leave blank to show a link instead of an embedded map."><Input id="mapEmbedUrl" name="mapEmbedUrl" defaultValue={b.mapEmbedUrl} /></Field>
          </FormGrid>
        </Card>
      </ActionForm>
    </>
  );
}
