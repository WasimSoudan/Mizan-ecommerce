import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { findAdminByEmail, SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { readJson } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await readJson(request);
  const email =
    body && typeof body === "object" && "email" in body && typeof body.email === "string"
      ? body.email.trim()
      : "";
  const password =
    body && typeof body === "object" && "password" in body && typeof body.password === "string"
      ? body.password
      : "";

  if (!email || !password) {
    return jsonError("Email or password is incorrect.", 401);
  }

  try {
    const admin = await findAdminByEmail(email);
    const matches = admin ? await bcrypt.compare(password, admin.password_hash) : false;
    if (!admin || !matches) {
      return jsonError("Email or password is incorrect.", 401);
    }

    const token = await signSession({ id: admin.id, email: admin.email });
    const response = NextResponse.json({ email: admin.email });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error(error);
    return jsonError("Could not sign in.", 500);
  }
}
