import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { isLocale } from "@/lib/locale";

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense fallback={<div className="h-16 border-b border-line bg-paper" />}>
      <LocaleFrame params={params}>{children}</LocaleFrame>
    </Suspense>
  );
}

async function LocaleFrame({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <SiteHeader locale={locale} />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-line py-8 text-center text-sm text-muted">
        Mizan · ميزان
      </footer>
    </>
  );
}
