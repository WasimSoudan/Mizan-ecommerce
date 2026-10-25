import Link from "next/link";
import { Suspense } from "react";
import { LocaleAttrs } from "@/components/locale-attrs";
import { LocaleSwitch } from "@/components/locale-switch";
import { text } from "@/lib/copy";
import type { Locale } from "@/types";

export function SiteHeader({ locale }: { locale: Locale }) {
  const labels = text(locale);

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur">
      <LocaleAttrs locale={locale} />
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href={`/${locale}`} className="font-display text-3xl leading-none text-green">
          {labels.brand}
        </Link>
        <p className="hidden text-sm text-muted sm:block">{labels.tagline}</p>
        <nav className="ms-auto flex items-center gap-4 text-sm">
          <Link href={`/${locale}`} className="hover:text-green">
            {labels.shop}
          </Link>
          <Link href={`/${locale}/admin`} className="hover:text-green">
            {labels.admin}
          </Link>
          <Suspense>
            <LocaleSwitch locale={locale} />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
