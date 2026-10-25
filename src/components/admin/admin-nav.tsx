"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { text } from "@/lib/copy";
import type { Locale } from "@/types";

export function AdminNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const labels = text(locale);
  const links = [
    { href: `/${locale}/admin`, label: labels.overview, exact: true },
    { href: `/${locale}/admin/categories`, label: labels.categories, exact: false },
    { href: `/${locale}/admin/products`, label: labels.products, exact: false },
    { href: `/${locale}`, label: labels.viewShop, exact: true },
  ];

  return (
    <nav className="mt-6 flex flex-wrap gap-2">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-3 py-1.5 text-sm ${
              active ? "bg-green text-white" : "border border-line bg-card"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
