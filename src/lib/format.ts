import type { Locale } from "@/types";

export function formatPrice(value: string | number, locale: Locale) {
  const amount = typeof value === "number" ? value : Number(value);
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en").format(value);
}

export function pickName(
  row: { name_en: string; name_ar: string },
  locale: Locale,
) {
  return locale === "ar" ? row.name_ar : row.name_en;
}

export function pickDescription(
  row: { description_en: string | null; description_ar: string | null },
  locale: Locale,
) {
  return locale === "ar" ? row.description_ar : row.description_en;
}

export function toClientCategory(category: {
  id: number;
  name_en: string;
  name_ar: string;
  is_active: boolean;
}) {
  return {
    id: category.id,
    name_en: category.name_en,
    name_ar: category.name_ar,
    is_active: category.is_active,
  };
}

export function toClientProduct(product: {
  id: number;
  category_id: number;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  price: string;
  image_url: string | null;
  stock_quantity: number;
  is_active: boolean;
  category_name_en: string;
  category_name_ar: string;
}) {
  return {
    id: product.id,
    category_id: product.category_id,
    name_en: product.name_en,
    name_ar: product.name_ar,
    description_en: product.description_en,
    description_ar: product.description_ar,
    price: product.price,
    image_url: product.image_url,
    stock_quantity: product.stock_quantity,
    is_active: product.is_active,
    category_name_en: product.category_name_en,
    category_name_ar: product.category_name_ar,
  };
}
