import type { CategoryInput, ProductInput } from "@/types";

type Parsed<T> = { ok: true; data: T } | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requiredText(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

function optionalText(value: unknown) {
  if (value == null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseActive(value: unknown) {
  return value !== false && value !== "false" && value !== 0 && value !== "0";
}

export function parseId(value: string) {
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  return id;
}

export function parseCategory(body: unknown): Parsed<CategoryInput> {
  if (!isRecord(body)) return { ok: false, error: "Invalid request body." };

  const nameEn = requiredText(body.name_en, 100);
  const nameAr = requiredText(body.name_ar, 100);
  if (!nameEn) {
    return { ok: false, error: "English name is required (max 100 characters)." };
  }
  if (!nameAr) {
    return { ok: false, error: "Arabic name is required (max 100 characters)." };
  }

  return {
    ok: true,
    data: { name_en: nameEn, name_ar: nameAr, is_active: parseActive(body.is_active) },
  };
}

export function parseProduct(body: unknown): Parsed<ProductInput> {
  if (!isRecord(body)) return { ok: false, error: "Invalid request body." };

  const categoryId =
    typeof body.category_id === "number"
      ? body.category_id
      : typeof body.category_id === "string"
        ? Number(body.category_id)
        : NaN;
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return { ok: false, error: "Choose a category." };
  }

  const nameEn = requiredText(body.name_en, 200);
  const nameAr = requiredText(body.name_ar, 200);
  if (!nameEn) {
    return { ok: false, error: "English name is required (max 200 characters)." };
  }
  if (!nameAr) {
    return { ok: false, error: "Arabic name is required (max 200 characters)." };
  }

  const descriptionEn = optionalText(body.description_en);
  const descriptionAr = optionalText(body.description_ar);
  if (descriptionEn === undefined || descriptionAr === undefined) {
    return { ok: false, error: "Descriptions must be text." };
  }

  const price = parsePrice(body.price);
  if (!price) return { ok: false, error: "Enter a price with up to 2 decimal places." };

  const stock = parseStock(body.stock_quantity);
  if (stock == null) return { ok: false, error: "Stock must be a whole number, 0 or more." };

  const imageUrl = parseImage(body.image_url);
  if (imageUrl === undefined) {
    return { ok: false, error: "Image URL must start with http:// or https://." };
  }

  return {
    ok: true,
    data: {
      category_id: categoryId,
      name_en: nameEn,
      name_ar: nameAr,
      description_en: descriptionEn,
      description_ar: descriptionAr,
      price,
      image_url: imageUrl,
      stock_quantity: stock,
      is_active: parseActive(body.is_active),
    },
  };
}

function parsePrice(value: unknown) {
  const raw = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) return null;
  const amount = Number(raw);
  if (amount > 9999999999.99) return null;
  return amount.toFixed(2);
}

function parseStock(value: unknown) {
  const number =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value.trim())
        ? Number(value.trim())
        : NaN;
  if (!Number.isInteger(number) || number < 0 || number > 1_000_000) return null;
  return number;
}

function parseImage(value: unknown) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 2000) return undefined;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return trimmed;
  } catch {
    return undefined;
  }
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
