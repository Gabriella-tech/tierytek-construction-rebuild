"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ENQUIRY_STATUSES, enquiries, type EnquiryStatus } from "@/db/schema";
import { requireActionUser } from "@/lib/admin-helpers";
import { storage } from "@/lib/storage";
import type { ActionState } from "@/lib/types";
import { str, toIntOrNull } from "@/lib/utils";

export async function updateEnquiry(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireActionUser();
  if (!auth.ok) return auth.state;
  const id = toIntOrNull(fd.get("id"));
  const status = str(fd.get("status")) as EnquiryStatus;
  if (!id || !ENQUIRY_STATUSES.includes(status)) return { error: "Invalid request." };
  await db.update(enquiries).set({ status, notes: str(fd.get("notes")).slice(0, 5000), updatedAt: new Date() }).where(eq(enquiries.id, id));
  return { ok: true, message: "Enquiry updated." };
}

export async function setEnquiryStatus(id: number, status: EnquiryStatus): Promise<void> {
  if (!(await requireActionUser()).ok) return;
  if (!ENQUIRY_STATUSES.includes(status)) return;
  await db.update(enquiries).set({ status, updatedAt: new Date() }).where(eq(enquiries.id, id));
}

export async function deleteEnquiry(id: number): Promise<void> {
  if (!(await requireActionUser()).ok) return;
  const [row] = await db.select({ key: enquiries.attachmentKey }).from(enquiries).where(eq(enquiries.id, id));
  await db.delete(enquiries).where(eq(enquiries.id, id));
  if (row?.key) await storage.remove(row.key).catch(() => undefined);
  redirect("/admin/enquiries");
}
