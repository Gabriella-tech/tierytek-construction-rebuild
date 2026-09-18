import Link from "next/link";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, Checkbox, Field, FormGrid, Input, PageHeader, Textarea } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth";
import { PAGE_DEFINITIONS } from "@/lib/page-fields";
import { getSiteSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/utils";
import { saveSeo } from "../settings/actions";

export const metadata = { title: "SEO" };

export default async function SeoPage() {
  await requireUser("admin");
  const { seo } = await getSiteSettings();
  return (
    <>
      <PageHeader title="SEO" description="Site-wide search settings. Per-page titles and descriptions are edited on each page, service, project and article." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActionForm action={saveSeo}>
            <Card title="Defaults">
              <div className="space-y-5">
                <FormGrid>
                  <Field label="Site name" htmlFor="siteName"><Input id="siteName" name="siteName" defaultValue={seo.siteName} /></Field>
                  <Field label="Title template" htmlFor="titleTemplate" hint="%s is replaced by the page title."><Input id="titleTemplate" name="titleTemplate" defaultValue={seo.titleTemplate} /></Field>
                  <Field label="Founding year (optional)" htmlFor="foundingYear" hint="Only if accurate; used in Organization structured data."><Input id="foundingYear" name="foundingYear" defaultValue={seo.foundingYear} maxLength={4} /></Field>
                  <Field label="Google Search Console verification code" htmlFor="googleSiteVerification" hint="The content value of the HTML tag Google gives you."><Input id="googleSiteVerification" name="googleSiteVerification" defaultValue={seo.googleSiteVerification} /></Field>
                </FormGrid>
                <Field label="Default meta description" htmlFor="defaultDescription" hint="Used when a page has no description of its own (~160 characters)."><Textarea id="defaultDescription" name="defaultDescription" rows={3} defaultValue={seo.defaultDescription} maxLength={320} /></Field>
                <Checkbox name="robotsIndex" label="Allow search engines to index the website" hint="Untick only while the site is under construction." defaultChecked={seo.robotsIndex} />
              </div>
            </Card>
          </ActionForm>
        </div>
        <div className="space-y-6">
          <Card title="Search Console checklist">
            <ol className="list-decimal space-y-2 pl-5 text-sm text-neutral-700">
              <li>Set <code className="rounded bg-neutral-100 px-1">SITE_URL</code> to <strong>{siteUrl()}</strong> in the hosting environment.</li>
              <li>Paste the verification code above and save.</li>
              <li>Submit the sitemap: <Link href="/sitemap.xml" target="_blank" className="text-brand underline">/sitemap.xml</Link></li>
              <li>Check <Link href="/robots.txt" target="_blank" className="text-brand underline">/robots.txt</Link> allows crawling.</li>
            </ol>
          </Card>
          <Card title="Page SEO">
            <ul className="space-y-1 text-sm">
              {PAGE_DEFINITIONS.map((p) => (<li key={p.slug}><Link href={`/admin/pages/${p.slug}`} className="text-brand hover:underline">{p.title}</Link> <span className="text-neutral-400">{p.path}</span></li>))}
            </ul>
            <p className="mt-3 text-xs text-neutral-500">Services, projects and articles each have their own SEO fields in their edit screens.</p>
          </Card>
        </div>
      </div>
    </>
  );
}
