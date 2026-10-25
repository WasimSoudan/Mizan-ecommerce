import { query } from "@/lib/db";
import type { Category, CategoryInput } from "@/types";

export async function listCategories(activeOnly: boolean) {
  return query<Category>(
    `SELECT id, name_en, name_ar, is_active, created_at
     FROM categories
     ${activeOnly ? "WHERE is_active = TRUE" : ""}
     ORDER BY name_en ASC, id ASC`,
  );
}

export async function createCategory(input: CategoryInput) {
  const rows = await query<Category>(
    `INSERT INTO categories (name_en, name_ar, is_active)
     VALUES ($1, $2, $3)
     RETURNING id, name_en, name_ar, is_active, created_at`,
    [input.name_en, input.name_ar, input.is_active],
  );
  return rows[0];
}

export async function updateCategory(id: number, input: CategoryInput) {
  const rows = await query<Category>(
    `UPDATE categories
     SET name_en = $1, name_ar = $2, is_active = $3
     WHERE id = $4
     RETURNING id, name_en, name_ar, is_active, created_at`,
    [input.name_en, input.name_ar, input.is_active, id],
  );
  return rows[0] ?? null;
}
