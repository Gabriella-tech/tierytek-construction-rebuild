"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { countUsers, hashPassword, signIn } from "@/lib/auth";
import type { ActionState } from "@/lib/types";
import { str } from "@/lib/utils";

const attempts = new Map<string, { count: number; until: number }>();

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = str(formData.get("email")).toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = str(formData.get("next"));
  if (!email || !password) return { error: "Enter your email and password." };

  const lock = attempts.get(email);
  if (lock && lock.count >= 8 && Date.now() < lock.until) {
    return { error: "Too many failed attempts. Please wait 10 minutes and try again." };
  }
  const result = await signIn(email, password);
  if (!result.ok) {
    const cur = attempts.get(email) ?? { count: 0, until: 0 };
    attempts.set(email, { count: cur.count + 1, until: Date.now() + 10 * 60 * 1000 });
    return { error: result.error };
  }
  attempts.delete(email);
  redirect(next.startsWith("/admin") ? next : "/admin/dashboard");
}

const setupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  password: z.string().min(10, "Use at least 10 characters."),
});

/** First-run only: creates the initial administrator when no users exist. */
export async function setupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if ((await countUsers()) > 0) return { error: "An administrator already exists. Please sign in." };
  const parsed = setupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join(" ") };
  await db.insert(users).values({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    passwordHash: await hashPassword(parsed.data.password),
    role: "admin",
  });
  await signIn(parsed.data.email, parsed.data.password);
  redirect("/admin/dashboard");
}
