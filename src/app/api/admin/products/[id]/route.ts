import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbErrorResponse, jsonError } from "@/lib/http";
import { updateProduct } from "@/services/products";
import { parseId, parseProduct, readJson } from "@/lib/validations";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) return jsonError("Product not found.", 404);

  const parsed = parseProduct(await readJson(request));
  if (!parsed.ok) return jsonError(parsed.error, 400);

  try {
    const product = await updateProduct(id, parsed.data);
    if (!product) return jsonError("Product not found.", 404);
    return NextResponse.json(product);
  } catch (error) {
    return dbErrorResponse(error, "Could not save the product.");
  }
}
