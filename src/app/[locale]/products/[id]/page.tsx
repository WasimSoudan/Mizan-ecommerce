import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DatabaseMessage } from "@/components/database-message";
import { text } from "@/lib/copy";
import { formatNumber, formatPrice, pickDescription, pickName } from "@/lib/format";
import { assertLocale } from "@/lib/locale";
import { getPublicProduct } from "@/services/products";
import { parseId } from "@/lib/validations";

export const metadata = { title: "Product" };

export default function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10 text-muted">…</div>}>
      <ProductDetail params={params} />
    </Suspense>
  );
}

async function ProductDetail({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id: rawId } = await params;
  const locale = assertLocale(rawLocale);
  const id = parseId(rawId);
  if (!id) notFound();

  try {
    const product = await getPublicProduct(id);
    if (!product) notFound();

    const labels = text(locale);
    const name = pickName(product, locale);
    const category = pickName(
      { name_en: product.category_name_en, name_ar: product.category_name_ar },
      locale,
    );
    const description = pickDescription(product, locale);
    const available = product.stock_quantity > 0;

    return (
      <article className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[2rem] border border-line bg-[#e7efe9]">
          {product.image_url ? (
            <img src={product.image_url} alt={name} className="aspect-square w-full object-cover" />
          ) : (
            <div className="flex aspect-square items-center justify-center font-display text-7xl text-green">
              {name.slice(0, 1)}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <Link
            href={`/${locale}?category=${product.category_id}`}
            className="text-sm uppercase tracking-[0.16em] text-muted"
          >
            {category}
          </Link>
          <h1 className="mt-3 font-display text-5xl leading-none text-green">{name}</h1>
          <p className="mt-5 font-display text-3xl text-clay">{formatPrice(product.price, locale)}</p>
          <p className={`mt-3 text-sm font-semibold ${available ? "text-green" : "text-clay"}`}>
            {available
              ? `${formatNumber(product.stock_quantity, locale)} · ${labels.inStock}`
              : labels.outOfStock}
          </p>
          {description ? <p className="mt-6 max-w-xl text-lg leading-8">{description}</p> : null}
          <Link href={`/${locale}`} className="mt-8 text-sm font-semibold text-green">
            {labels.backToShop}
          </Link>
        </div>
      </article>
    );
  } catch (error) {
    console.error(error);
    return <DatabaseMessage locale={locale} />;
  }
}
