import { NextResponse } from "next/server";
import { pgCode } from "@/lib/db";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function dbErrorResponse(error: unknown, fallback: string) {
  console.error(error);
  if (pgCode(error) === "23503") return jsonError("That category does not exist.", 400);
  if (pgCode(error) === "23514") {
    return jsonError("Price and stock must be zero or greater.", 400);
  }
  return jsonError(fallback, 500);
}
