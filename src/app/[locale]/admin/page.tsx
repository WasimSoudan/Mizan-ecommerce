import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DatabaseMessage } from "@/components/database-message";
import { text } from "@/lib/copy";
import { formatNumber } from "@/lib/format";
import { assertLocale } from "@/lib/locale";
import { getDashboardStats } from "@/services/products";

export const metadata = { title: "Admin" };

export default function AdminHomePage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense fallback={<p className="px-4 py-10 text-muted">…</p>}>
      <Overview params={params} />
    </Suspense>
  );
}

async function Overview({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const labels = text(locale);

  let stats;
  try {
    stats = await getDashboardStats();
  } catch (error) {
    console.error(error);
    return <DatabaseMessage locale={locale} />;
  }

  const cards = [
    [labels.statCategories, stats.categories],
    [labels.statProducts, stats.products],
    [labels.statActive, stats.active_products],
    [labels.statOut, stats.out_of_stock],
  ] as const;

  return (
    <AdminShell locale={locale}>
      <div>
        <p className="max-w-2xl text-muted">{labels.overviewBody}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, value]) => (
            <article key={label} className="rounded-3xl border border-line bg-card p-5">
              <p className="text-sm text-muted">{label}</p>
              <p className="mt-2 font-display text-4xl text-green">{formatNumber(value, locale)}</p>
            </article>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
