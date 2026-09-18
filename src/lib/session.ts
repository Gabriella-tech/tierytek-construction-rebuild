/**
 * Session tokens (JWT, HS256) — edge-safe (used by proxy.ts and server code).
 * No database or Node-only imports here.
 */
import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@/db/schema";

export const SESSION_COOKIE = "tt_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = {
  userId: number;
  role: UserRole;
  name: string;
  email: string;
};

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be set (min 16 chars) in production.");
    }
    return new TextEncoder().encode("tierytek-development-secret-do-not-use-in-production");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role, name: payload.name, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub) return null;
    return {
      userId: Number(payload.sub),
      role: (payload.role as UserRole) ?? "editor",
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
    };
  } catch {
    return null;
  }
}
