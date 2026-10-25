import { notFound } from "next/navigation";
import type { Locale } from "@/types";

export const locales = ["en", "ar"] as const;

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "ar";
}

export function assertLocale(value: string): Locale {
  if (!isLocale(value)) notFound();
  return value;
}
