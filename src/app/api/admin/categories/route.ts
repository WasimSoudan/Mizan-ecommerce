import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbErrorResponse, jsonError } from "@/lib/http";
import { createCategory, listCategories } from "@/services/categories";
import { parseCategory, readJson } from "@/lib/validations";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    return NextResponse.json(await listCategories(false));
  } catch (error) {
    console.error(error);
    return jsonError("Could not load categories.", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const parsed = parseCategory(await readJson(request));
  if (!parsed.ok) return jsonError(parsed.error, 400);

  try {
    const category = await createCategory(parsed.data);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return dbErrorResponse(error, "Could not save the category.");
  }
}
