import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/client";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "./actions";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Tierytek Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CmsLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return (
    <AdminShell user={user} logoutAction={logoutAction}>
      {children}
    </AdminShell>
  );
}
