import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { listCategories } from "@/services/categories";

export async function GET() {
  try {
    const categories = await listCategories(true);
    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);
    return jsonError("Could not load categories.", 500);
  }
}
