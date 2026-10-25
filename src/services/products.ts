import { query } from "@/lib/db";
import type { DashboardStats, Product, ProductInput } from "@/types";

const productColumns = (alias: string) => `
  ${alias}.id,
  ${alias}.category_id,
  ${alias}.name_en,
  ${alias}.name_ar,
  ${alias}.description_en,
  ${alias}.description_ar,
  ${alias}.price::text AS price,
  ${alias}.image_url,
  ${alias}.stock_quantity,
  ${alias}.is_active,
  ${alias}.created_at,
  ${alias}.updated_at
`;

type ProductFilters = {
  activeOnly: boolean;
  categoryId?: number;
  search?: string;
};

export async function listProducts(filters: ProductFilters) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.activeOnly) {
    conditions.push("p.is_active = TRUE");
    conditions.push("c.is_active = TRUE");
  }

  if (filters.categoryId) {
    params.push(filters.categoryId);
    conditions.push(`p.category_id = $${params.length}`);
  }

  const search = filters.search?.trim().slice(0, 100);
  if (search) {
    params.push(`%${search.replace(/[\\%_]/g, "\\$&")}%`);
    const placeholder = `$${params.length}`;
    conditions.push(
      `(p.name_en ILIKE ${placeholder} ESCAPE '\\'
        OR p.name_ar ILIKE ${placeholder} ESCAPE '\\'
        OR COALESCE(p.description_en, '') ILIKE ${placeholder} ESCAPE '\\'
        OR COALESCE(p.description_ar, '') ILIKE ${placeholder} ESCAPE '\\')`,
    );
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  return query<Product>(
    `SELECT ${productColumns("p")},
            c.name_en AS category_name_en,
            c.name_ar AS category_name_ar
     FROM products p
     JOIN categories c ON c.id = p.category_id
     ${where}
     ORDER BY p.created_at DESC, p.id DESC`,
    params,
  );
}

export async function getPublicProduct(id: number) {
  const rows = await query<Product>(
    `SELECT ${productColumns("p")},
            c.name_en AS category_name_en,
            c.name_ar AS category_name_ar
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE p.id = $1
       AND p.is_active = TRUE
       AND c.is_active = TRUE`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createProduct(input: ProductInput) {
  const rows = await query<Product>(
    `WITH inserted AS (
       INSERT INTO products (
         category_id, name_en, name_ar, description_en, description_ar,
         price, image_url, stock_quantity, is_active
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *
     )
     SELECT ${productColumns("inserted")},
            c.name_en AS category_name_en,
            c.name_ar AS category_name_ar
     FROM inserted
     JOIN categories c ON c.id = inserted.category_id`,
    [
      input.category_id,
      input.name_en,
      input.name_ar,
      input.description_en,
      input.description_ar,
      input.price,
      input.image_url,
      input.stock_quantity,
      input.is_active,
    ],
  );
  return rows[0];
}

export async function updateProduct(id: number, input: ProductInput) {
  const rows = await query<Product>(
    `WITH updated AS (
       UPDATE products
       SET category_id = $1,
           name_en = $2,
           name_ar = $3,
           description_en = $4,
           description_ar = $5,
           price = $6,
           image_url = $7,
           stock_quantity = $8,
           is_active = $9,
           updated_at = NOW()
       WHERE id = $10
       RETURNING *
     )
     SELECT ${productColumns("updated")},
            c.name_en AS category_name_en,
            c.name_ar AS category_name_ar
     FROM updated
     JOIN categories c ON c.id = updated.category_id`,
    [
      input.category_id,
      input.name_en,
      input.name_ar,
      input.description_en,
      input.description_ar,
      input.price,
      input.image_url,
      input.stock_quantity,
      input.is_active,
      id,
    ],
  );
  return rows[0] ?? null;
}

export async function getDashboardStats() {
  const rows = await query<DashboardStats>(
    `SELECT
       (SELECT COUNT(*)::int FROM categories) AS categories,
       (SELECT COUNT(*)::int FROM products) AS products,
       (SELECT COUNT(*)::int FROM products WHERE is_active) AS active_products,
       (SELECT COUNT(*)::int FROM products WHERE stock_quantity = 0) AS out_of_stock`,
  );
  return rows[0];
}
