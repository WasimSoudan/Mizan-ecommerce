import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { CategoryManager } from "@/components/admin/category-manager";
import { DatabaseMessage } from "@/components/database-message";
import { toClientCategory } from "@/lib/format";
import { assertLocale } from "@/lib/locale";
import { listCategories } from "@/services/categories";

export const metadata = { title: "Categories" };

export default function CategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense fallback={<p className="px-4 py-10 text-muted">…</p>}>
      <CategoriesContent params={params} />
    </Suspense>
  );
}

async function CategoriesContent({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);

  try {
    const categories = await listCategories(false);
    return (
      <AdminShell locale={locale}>
        <CategoryManager locale={locale} initialCategories={categories.map(toClientCategory)} />
      </AdminShell>
    );
  } catch (error) {
    console.error(error);
    return <DatabaseMessage locale={locale} />;
  }
}
