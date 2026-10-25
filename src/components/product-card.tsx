import Link from "next/link";
import { text } from "@/lib/copy";
import { formatNumber, formatPrice, pickName } from "@/lib/format";
import type { Locale, Product } from "@/types";

export function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  const labels = text(locale);
  const name = pickName(product, locale);
  const category = pickName(
    { name_en: product.category_name_en, name_ar: product.category_name_ar },
    locale,
  );
  const available = product.stock_quantity > 0;

  return (
    <Link
      href={`/${locale}/products/${product.id}`}
      className="group overflow-hidden rounded-3xl border border-line bg-card transition hover:-translate-y-0.5 hover:border-green"
    >
      <div className="aspect-[4/5] bg-[#e7efe9]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-5xl text-green">
            {name.slice(0, 1)}
          </div>
        )}
      </div>
      <div className="space-y-1 px-4 py-4">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">{category}</p>
        <h2 className="font-display text-2xl leading-tight">{name}</h2>
        <div className="flex items-center justify-between gap-3 pt-2 text-sm">
          <span className="font-semibold text-clay">{formatPrice(product.price, locale)}</span>
          <span className={available ? "text-green" : "text-clay"}>
            {available
              ? `${formatNumber(product.stock_quantity, locale)} · ${labels.inStock}`
              : labels.outOfStock}
          </span>
        </div>
      </div>
    </Link>
  );
}
