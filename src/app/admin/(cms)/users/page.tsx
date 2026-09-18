import { asc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ActionForm } from "@/components/admin/ActionForm";
import { ConfirmButton } from "@/components/admin/client";
import { Badge, Card, Field, FormGrid, Input, PageHeader, Select, buttonClass } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { createUser, deleteUser, resetPassword, setRole } from "./actions";

export const metadata = { title: "Users" };

export default async function UsersPage() {
  const me = await requireUser("admin");
  const rows = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt }).from(users).orderBy(asc(users.createdAt));
  return (
    <>
      <PageHeader title="Users" description="Administrators manage everything including settings and users. Editors manage content and enquiries only." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {rows.map((u) => (
            <Card key={u.id}>
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-neutral-900">{u.name} {u.id === me.userId && <span className="text-xs font-normal text-neutral-500">(you)</span>}</p>
                  <p className="text-sm text-neutral-500">{u.email} · joined {formatDate(u.createdAt)}</p>
                </div>
                <Badge tone={u.role === "admin" ? "orange" : "blue"}>{u.role}</Badge>
                {u.id !== me.userId && (
                  <>
                    <form action={setRole.bind(null, u.id, u.role === "admin" ? "editor" : "admin")}><button className={buttonClass.secondary}>Make {u.role === "admin" ? "editor" : "admin"}</button></form>
                    <ConfirmButton action={deleteUser.bind(null, u.id)} message={`Remove ${u.email}? They will no longer be able to sign in.`}>Remove</ConfirmButton>
                  </>
                )}
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium text-brand">Reset password</summary>
                <div className="mt-3 max-w-sm">
                  <ActionForm action={resetPassword} submitLabel="Set new password">
                    <input type="hidden" name="id" value={u.id} />
                    <Field label="New password" htmlFor={`pw-${u.id}`} hint="At least 10 characters."><Input id={`pw-${u.id}`} name="password" type="password" minLength={10} autoComplete="new-password" required /></Field>
                  </ActionForm>
                </div>
              </details>
            </Card>
          ))}
        </div>
        <Card title="Add user">
          <ActionForm action={createUser} submitLabel="Create user">
            <FormGrid>
              <Field label="Name" htmlFor="name" required><Input id="name" name="name" required /></Field>
              <Field label="Email" htmlFor="email" required><Input id="email" name="email" type="email" required /></Field>
              <Field label="Temporary password" htmlFor="password" required><Input id="password" name="password" type="password" minLength={10} autoComplete="new-password" required /></Field>
              <Field label="Role" htmlFor="role"><Select id="role" name="role" defaultValue="editor"><option value="editor">Editor</option><option value="admin">Administrator</option></Select></Field>
            </FormGrid>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
