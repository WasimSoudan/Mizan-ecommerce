import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { listProducts } from "@/services/products";
import { parseId } from "@/lib/validations";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const categoryRaw = url.searchParams.get("categoryId");
  let categoryId: number | undefined;

  if (categoryRaw) {
    const parsed = parseId(categoryRaw);
    if (!parsed) return jsonError("Invalid category.", 400);
    categoryId = parsed;
  }

  try {
    const products = await listProducts({
      activeOnly: true,
      categoryId,
      search: url.searchParams.get("q") ?? undefined,
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return jsonError("Could not load products.", 500);
  }
}
