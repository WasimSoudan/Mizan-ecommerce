import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const SESSION_COOKIE = "admin_session";

export type Session = {
  id: number;
  email: string;
};

function getSecret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 16) {
    throw new Error("SESSION_SECRET must be set to at least 16 characters.");
  }
  return new TextEncoder().encode(value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function signSession(session: Session) {
  return new SignJWT({ email: session.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(session.id))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function readSession(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const id = Number(payload.sub);
    const email = payload.email;
    if (!Number.isInteger(id) || id <= 0 || typeof email !== "string" || !email) {
      return null;
    }
    return { id, email };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSession(token);
}

export async function findAdminByEmail(email: string) {
  const rows = await query<{ id: number; email: string; password_hash: string }>(
    `SELECT id, email, password_hash
     FROM admin_users
     WHERE LOWER(email) = LOWER($1)`,
    [email],
  );
  return rows[0] ?? null;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, error: null };
}
