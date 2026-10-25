export type Locale = "en" | "ar";

export type Category = {
  id: number;
  name_en: string;
  name_ar: string;
  is_active: boolean;
  created_at: Date;
};

export type Product = {
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
  created_at: Date;
  updated_at: Date;
  category_name_en: string;
  category_name_ar: string;
};

export type CategoryInput = {
  name_en: string;
  name_ar: string;
  is_active: boolean;
};

export type ProductInput = {
  category_id: number;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  price: string;
  image_url: string | null;
  stock_quantity: number;
  is_active: boolean;
};

export type ClientCategory = {
  id: number;
  name_en: string;
  name_ar: string;
  is_active: boolean;
};

export type ClientProduct = {
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
};

export type DashboardStats = {
  categories: number;
  products: number;
  active_products: number;
  out_of_stock: number;
};
