import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductManager } from "@/components/admin/product-manager";
import { DatabaseMessage } from "@/components/database-message";
import { toClientCategory, toClientProduct } from "@/lib/format";
import { assertLocale } from "@/lib/locale";
import { listCategories } from "@/services/categories";
import { listProducts } from "@/services/products";

export const metadata = { title: "Products" };

export default function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense fallback={<p className="px-4 py-10 text-muted">…</p>}>
      <ProductsContent params={params} />
    </Suspense>
  );
}

async function ProductsContent({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);

  try {
    const [categories, products] = await Promise.all([
      listCategories(false),
      listProducts({ activeOnly: false }),
    ]);

    return (
      <AdminShell locale={locale}>
        <ProductManager
          locale={locale}
          categories={categories.map(toClientCategory)}
          initialProducts={products.map(toClientProduct)}
        />
      </AdminShell>
    );
  } catch (error) {
    console.error(error);
    return <DatabaseMessage locale={locale} />;
  }
}
