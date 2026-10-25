import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbErrorResponse, jsonError } from "@/lib/http";
import { updateCategory } from "@/services/categories";
import { parseCategory, parseId, readJson } from "@/lib/validations";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) return jsonError("Category not found.", 404);

  const parsed = parseCategory(await readJson(request));
  if (!parsed.ok) return jsonError(parsed.error, 400);

  try {
    const category = await updateCategory(id, parsed.data);
    if (!category) return jsonError("Category not found.", 404);
    return NextResponse.json(category);
  } catch (error) {
    return dbErrorResponse(error, "Could not save the category.");
  }
}
