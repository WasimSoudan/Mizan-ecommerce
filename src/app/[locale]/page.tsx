import { Suspense } from "react";
import { Catalog } from "@/components/catalog";
import { ChatLauncher } from "@/components/chat-launcher";
import { assertLocale } from "@/lib/locale";

export default function Home({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <HomeCatalog params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function HomeCatalog({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const locale = assertLocale((await params).locale);
  return (
    <>
      <Catalog locale={locale} searchParams={searchParams} />
      <ChatLauncher locale={locale} />
    </>
  );
}

function CatalogFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="h-24 max-w-xl animate-pulse rounded-3xl bg-line" />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="aspect-[4/5] animate-pulse rounded-3xl bg-line" />
        ))}
      </div>
    </div>
  );
}
