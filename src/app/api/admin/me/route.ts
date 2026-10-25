import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  return NextResponse.json({ id: auth.session.id, email: auth.session.email });
}
