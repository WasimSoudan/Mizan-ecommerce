import Link from "next/link";
import { DatabaseMessage } from "@/components/database-message";
import { ProductCard } from "@/components/product-card";
import { text } from "@/lib/copy";
import { formatNumber, pickName } from "@/lib/format";
import { listCategories } from "@/services/categories";
import { listProducts } from "@/services/products";
import { parseId } from "@/lib/validations";
import type { Locale } from "@/types";

export async function Catalog({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const labels = text(locale);
  const params = await searchParams;
  const selectedCategory = params.category ? parseId(params.category) : null;
  const search = params.q?.trim().slice(0, 100) ?? "";

  try {
    const [categories, products] = await Promise.all([
      listCategories(true),
      listProducts({
        activeOnly: true,
        categoryId: selectedCategory ?? undefined,
        search,
      }),
    ]);

    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay">
            {labels.brand}
          </p>
          <h1 className="mt-2 font-display text-5xl leading-none text-green sm:text-6xl">
            {labels.tagline}
          </h1>
          <p className="mt-4 text-muted">
            {formatNumber(products.length, locale)} {labels.pieces}
          </p>
        </div>

        <form action={`/${locale}`} className="mt-8 flex flex-col gap-3 sm:flex-row">
          {selectedCategory ? (
            <input type="hidden" name="category" value={selectedCategory} />
          ) : null}
          <input
            name="q"
            defaultValue={search}
            placeholder={labels.searchPlaceholder}
            className="w-full rounded-full border border-line bg-card px-4 py-3 outline-none focus:border-green"
          />
          <button
            type="submit"
            className="rounded-full bg-green px-6 py-3 text-sm font-semibold text-white"
          >
            {labels.search}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-2">
          <CategoryLink locale={locale} active={!selectedCategory} q={search} categoryId={null}>
            {labels.allCategories}
          </CategoryLink>
          {categories.map((category) => (
            <CategoryLink
              key={category.id}
              locale={locale}
              active={selectedCategory === category.id}
              q={search}
              categoryId={category.id}
            >
              {pickName(category, locale)}
            </CategoryLink>
          ))}
        </div>

        {products.length === 0 ? (
          <p className="mt-16 text-center text-muted">{labels.noMatches}</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error(error);
    return <DatabaseMessage locale={locale} />;
  }
}

function CategoryLink({
  locale,
  categoryId,
  q,
  active,
  children,
}: {
  locale: Locale;
  categoryId: number | null;
  q: string;
  active: boolean;
  children: string;
}) {
  const params = new URLSearchParams();
  if (categoryId) params.set("category", String(categoryId));
  if (q) params.set("q", q);
  const query = params.toString();
  const href = query ? `/${locale}?${query}` : `/${locale}`;

  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-sm ${
        active ? "bg-green text-white" : "border border-line bg-card text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
