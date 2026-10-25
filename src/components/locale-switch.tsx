"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Locale } from "@/types";

export function LocaleSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  function choose(next: Locale) {
    if (next === locale) return;
    const parts = pathname.split("/");
    parts[1] = next;
    const nextPath = parts.join("/") || `/${next}`;
    const query = searchParams.toString();
    router.push(query ? `${nextPath}?${query}` : nextPath);
  }

  return (
    <div className="flex items-center rounded-full border border-line bg-card p-0.5 text-xs font-semibold">
      {(["en", "ar"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => choose(code)}
          className={`rounded-full px-2.5 py-1 ${
            locale === code ? "bg-green text-white" : "text-muted"
          }`}
        >
          {code === "en" ? "EN" : "ع"}
        </button>
      ))}
    </div>
  );
}
