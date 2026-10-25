import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbErrorResponse, jsonError } from "@/lib/http";
import { createProduct, listProducts } from "@/services/products";
import { parseProduct, readJson } from "@/lib/validations";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    return NextResponse.json(await listProducts({ activeOnly: false }));
  } catch (error) {
    console.error(error);
    return jsonError("Could not load products.", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const parsed = parseProduct(await readJson(request));
  if (!parsed.ok) return jsonError(parsed.error, 400);

  try {
    const product = await createProduct(parsed.data);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return dbErrorResponse(error, "Could not save the product.");
  }
}
