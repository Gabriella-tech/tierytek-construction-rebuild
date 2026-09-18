/**
 * Server-side authentication helpers (Node runtime only).
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, type UserRole } from "@/db/schema";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySessionToken, type SessionPayload } from "@/lib/session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** For pages: redirect to login (or dashboard when the role is insufficient). */
export async function requireUser(role?: UserRole): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (role === "admin" && session.role !== "admin") redirect("/admin/dashboard?denied=1");
  return session;
}

/** For server actions / route handlers: returns null instead of redirecting. */
export async function authorize(role?: UserRole): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session) return null;
  if (role === "admin" && session.role !== "admin") return null;
  return session;
}

export async function signIn(email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
  // Constant-time-ish: always run a compare even if the user does not exist.
  const valid = user ? await verifyPassword(password, user.passwordHash) : await bcrypt.compare(password, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalid");
  if (!user || !valid) return { ok: false, error: "Incorrect email or password." };
  const token = await signSession({ userId: user.id, role: user.role, name: user.name, email: user.email });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && (process.env.SITE_URL ?? "").startsWith("https"),
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function countUsers(): Promise<number> {
  const rows = await db.select({ id: users.id }).from(users);
  return rows.length;
}
