"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users, type UserRole } from "@/db/schema";
import { requireActionUser } from "@/lib/admin-helpers";
import { authorize, hashPassword } from "@/lib/auth";
import type { ActionState } from "@/lib/types";
import { str, toIntOrNull } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(120),
  email: z.string().trim().email("Enter a valid email.").max(200),
  password: z.string().min(10, "Password must be at least 10 characters."),
  role: z.enum(["admin", "editor"]),
});

export async function createUser(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireActionUser("admin");
  if (!auth.ok) return auth.state;
  const parsed = createSchema.safeParse({ name: fd.get("name"), email: fd.get("email"), password: fd.get("password"), role: fd.get("role") });
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join(" ") };
  const email = parsed.data.email.toLowerCase();
  const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (exists) return { error: "A user with that email already exists." };
  await db.insert(users).values({ name: parsed.data.name, email, passwordHash: await hashPassword(parsed.data.password), role: parsed.data.role as UserRole });
  return { ok: true, message: "User created." };
}

export async function resetPassword(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize();
  if (!session) return { error: "Please sign in again." };
  const id = toIntOrNull(fd.get("id"));
  const password = String(fd.get("password") ?? "");
  if (!id) return { error: "Invalid user." };
  if (session.role !== "admin" && session.userId !== id) return { error: "You can only change your own password." };
  if (password.length < 10) return { error: "Password must be at least 10 characters." };
  await db.update(users).set({ passwordHash: await hashPassword(password), updatedAt: new Date() }).where(eq(users.id, id));
  return { ok: true, message: "Password updated." };
}

export async function setRole(id: number, role: UserRole): Promise<void> {
  const session = await authorize("admin");
  if (!session || session.userId === id) return;
  if (role === "editor") {
    const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
    if (admins.length <= 1 && admins[0]?.id === id) return; // keep at least one admin
  }
  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id));
}

export async function deleteUser(id: number): Promise<void> {
  const session = await authorize("admin");
  if (!session || session.userId === id) return;
  await db.delete(users).where(eq(users.id, id));
}

export async function updateProfileName(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize();
  if (!session) return { error: "Please sign in again." };
  const name = str(fd.get("name"));
  if (name.length < 2) return { error: "Name is required." };
  await db.update(users).set({ name, updatedAt: new Date() }).where(eq(users.id, session.userId));
  return { ok: true, message: "Name updated (shown after your next sign-in)." };
}
