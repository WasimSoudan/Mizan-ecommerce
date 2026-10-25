"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, fieldClass, secondaryButtonClass } from "@/components/field-styles";
import { text } from "@/lib/copy";
import { formatPrice, pickName } from "@/lib/format";
import type { ClientCategory, ClientProduct, Locale } from "@/types";

type FormState = {
  category_id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: string;
  image_url: string;
  stock_quantity: string;
  is_active: boolean;
};

function emptyForm(categoryId: string): FormState {
  return {
    category_id: categoryId,
    name_en: "",
    name_ar: "",
    description_en: "",
    description_ar: "",
    price: "",
    image_url: "",
    stock_quantity: "0",
    is_active: true,
  };
}

export function ProductManager({
  locale,
  categories,
  initialProducts,
}: {
  locale: Locale;
  categories: ClientCategory[];
  initialProducts: ClientProduct[];
}) {
  const labels = text(locale);
  const router = useRouter();
  const firstCategory = categories[0] ? String(categories[0].id) : "";
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(firstCategory));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function edit(product: ClientProduct) {
    setEditingId(product.id);
    setForm({
      category_id: String(product.category_id),
      name_en: product.name_en,
      name_ar: product.name_ar,
      description_en: product.description_en ?? "",
      description_ar: product.description_ar ?? "",
      price: product.price,
      image_url: product.image_url ?? "",
      stock_quantity: String(product.stock_quantity),
      is_active: product.is_active,
    });
    setError("");
    setNotice("");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");

    const response = await fetch(
      editingId ? `/api/admin/products/${editingId}` : "/api/admin/products",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: Number(form.category_id),
          name_en: form.name_en,
          name_ar: form.name_ar,
          description_en: form.description_en,
          description_ar: form.description_ar,
          price: form.price,
          image_url: form.image_url,
          stock_quantity: Number(form.stock_quantity),
          is_active: form.is_active,
        }),
      },
    );
    const payload = (await response.json().catch(() => null)) as
      | (ClientProduct & { error?: string })
      | null;

    if (!response.ok || !payload || payload.error || !payload.id) {
      setError(payload?.error ?? labels.saveFailed);
      setPending(false);
      return;
    }

    const saved: ClientProduct = {
      id: payload.id,
      category_id: payload.category_id,
      name_en: payload.name_en,
      name_ar: payload.name_ar,
      description_en: payload.description_en,
      description_ar: payload.description_ar,
      price: payload.price,
      image_url: payload.image_url,
      stock_quantity: payload.stock_quantity,
      is_active: payload.is_active,
      category_name_en: payload.category_name_en,
      category_name_ar: payload.category_name_ar,
    };

    setProducts((current) => {
      const exists = current.some((product) => product.id === saved.id);
      return exists
        ? current.map((product) => (product.id === saved.id ? saved : product))
        : [saved, ...current];
    });
    setNotice(labels.saved);
    if (!editingId) setForm(emptyForm(firstCategory));
    setPending(false);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form onSubmit={onSubmit} className="h-fit space-y-3 rounded-3xl border border-line bg-card p-5">
        <h2 className="font-display text-2xl text-green">
          {editingId ? labels.editProduct : labels.newProduct}
        </h2>
        {categories.length === 0 ? <p className="text-sm text-clay">{labels.noCategories}</p> : null}
        <label className="block text-sm">
          <span className="mb-1 block text-muted">{labels.categories}</span>
          <select
            required
            value={form.category_id}
            onChange={(event) => update("category_id", event.target.value)}
            className={fieldClass}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name_en} / {category.name_ar}
                {category.is_active ? "" : ` · ${labels.hidden}`}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">{labels.englishName}</span>
          <input
            required
            maxLength={200}
            value={form.name_en}
            onChange={(event) => update("name_en", event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">{labels.arabicName}</span>
          <input
            required
            maxLength={200}
            dir="rtl"
            value={form.name_ar}
            onChange={(event) => update("name_ar", event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">{labels.descriptionEn}</span>
          <textarea
            rows={3}
            value={form.description_en}
            onChange={(event) => update("description_en", event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">{labels.descriptionAr}</span>
          <textarea
            rows={3}
            dir="rtl"
            value={form.description_ar}
            onChange={(event) => update("description_ar", event.target.value)}
            className={fieldClass}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="mb-1 block text-muted">{labels.price}</span>
            <input
              required
              inputMode="decimal"
              value={form.price}
              onChange={(event) => update("price", event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">{labels.stock}</span>
            <input
              required
              inputMode="numeric"
              value={form.stock_quantity}
              onChange={(event) => update("stock_quantity", event.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">{labels.imageUrl}</span>
          <input
            type="url"
            value={form.image_url}
            onChange={(event) => update("image_url", event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) => update("is_active", event.target.checked)}
          />
          {labels.active}
        </label>
        {error ? <p className="text-sm text-clay">{error}</p> : null}
        {notice ? <p className="text-sm text-green">{notice}</p> : null}
        <div className="flex gap-2">
          <button type="submit" disabled={pending || categories.length === 0} className={buttonClass}>
            {pending ? labels.saving : labels.save}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm(firstCategory));
                setError("");
              }}
              className={secondaryButtonClass}
            >
              {labels.cancel}
            </button>
          ) : null}
        </div>
      </form>

      <ul className="space-y-3">
        {products.map((product) => (
          <li
            key={product.id}
            className="flex gap-3 rounded-2xl border border-line bg-card p-3"
          >
            <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-[#e7efe9]">
              {product.image_url ? (
                <img src={product.image_url} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{pickName(product, locale)}</p>
              <p className="text-sm text-muted">
                {pickName(
                  { name_en: product.category_name_en, name_ar: product.category_name_ar },
                  locale,
                )}
              </p>
              <p className="text-sm">
                {formatPrice(product.price, locale)} · {product.stock_quantity}
                {product.is_active ? "" : ` · ${labels.hidden}`}
              </p>
            </div>
            <button type="button" onClick={() => edit(product)} className={secondaryButtonClass}>
              {labels.editProduct}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
