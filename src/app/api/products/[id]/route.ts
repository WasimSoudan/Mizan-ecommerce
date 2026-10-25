import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { getPublicProduct } from "@/services/products";
import { parseId } from "@/lib/validations";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) return jsonError("Product not found.", 404);

  try {
    const product = await getPublicProduct(id);
    if (!product) return jsonError("Product not found.", 404);
    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return jsonError("Could not load the product.", 500);
  }
}
