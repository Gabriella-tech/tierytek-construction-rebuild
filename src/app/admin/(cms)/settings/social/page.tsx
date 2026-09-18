import { ActionForm } from "@/components/admin/ActionForm";
import { Card, Field, FormGrid, Input, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { saveSocial } from "../actions";

export const metadata = { title: "Social links" };

export default async function SocialPage() {
  await requireUser("admin");
  const { social } = await getSiteSettings();
  const items: Array<[keyof typeof social, string]> = [["facebook", "Facebook"], ["instagram", "Instagram"], ["linkedin", "LinkedIn"], ["x", "X (Twitter)"], ["youtube", "YouTube"], ["tiktok", "TikTok"]];
  return (
    <>
      <PageHeader title="Social links" description="Only filled-in links are shown in the footer and Contact page." />
      <ActionForm action={saveSocial}>
        <Card title="Profiles">
          <FormGrid>
            {items.map(([key, label]) => (
              <Field key={key} label={label} htmlFor={key}><Input id={key} name={key} type="url" defaultValue={social[key]} placeholder="https://" /></Field>
            ))}
          </FormGrid>
        </Card>
      </ActionForm>
    </>
  );
}
