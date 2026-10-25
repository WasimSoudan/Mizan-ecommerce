"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, fieldClass, secondaryButtonClass } from "@/components/field-styles";
import { text } from "@/lib/copy";
import type { ClientCategory, Locale } from "@/types";

type FormState = {
  name_en: string;
  name_ar: string;
  is_active: boolean;
};

const emptyForm: FormState = { name_en: "", name_ar: "", is_active: true };

export function CategoryManager({
  locale,
  initialCategories,
}: {
  locale: Locale;
  initialCategories: ClientCategory[];
}) {
  const labels = text(locale);
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  function edit(category: ClientCategory) {
    setEditingId(category.id);
    setForm({
      name_en: category.name_en,
      name_ar: category.name_ar,
      is_active: category.is_active,
    });
    setError("");
    setNotice("");
  }

  function cancel() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");

    const response = await fetch(
      editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    );
    const payload = (await response.json().catch(() => null)) as
      | (ClientCategory & { error?: string })
      | null;

    if (!response.ok || !payload || payload.error) {
      setError(payload?.error ?? labels.saveFailed);
      setPending(false);
      return;
    }

    const saved: ClientCategory = {
      id: payload.id,
      name_en: payload.name_en,
      name_ar: payload.name_ar,
      is_active: payload.is_active,
    };
    setCategories((current) => {
      const exists = current.some((category) => category.id === saved.id);
      const next = exists
        ? current.map((category) => (category.id === saved.id ? saved : category))
        : [saved, ...current];
      return next.sort((a, b) => a.name_en.localeCompare(b.name_en) || a.id - b.id);
    });
    setNotice(labels.saved);
    if (!editingId) setForm(emptyForm);
    setPending(false);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <form onSubmit={onSubmit} className="h-fit space-y-3 rounded-3xl border border-line bg-card p-5">
        <h2 className="font-display text-2xl text-green">
          {editingId ? labels.editCategory : labels.newCategory}
        </h2>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">{labels.englishName}</span>
          <input
            required
            maxLength={100}
            value={form.name_en}
            onChange={(event) => setForm({ ...form, name_en: event.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">{labels.arabicName}</span>
          <input
            required
            maxLength={100}
            dir="rtl"
            value={form.name_ar}
            onChange={(event) => setForm({ ...form, name_ar: event.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
          />
          {labels.active}
        </label>
        {error ? <p className="text-sm text-clay">{error}</p> : null}
        {notice ? <p className="text-sm text-green">{notice}</p> : null}
        <div className="flex gap-2">
          <button type="submit" disabled={pending} className={buttonClass}>
            {pending ? labels.saving : labels.save}
          </button>
          {editingId ? (
            <button type="button" onClick={cancel} className={secondaryButtonClass}>
              {labels.cancel}
            </button>
          ) : null}
        </div>
      </form>

      <ul className="space-y-3">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card px-4 py-3"
          >
            <div>
              <p className="font-semibold">{category.name_en}</p>
              <p className="text-sm text-muted" dir="rtl">
                {category.name_ar}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={category.is_active ? "text-sm text-green" : "text-sm text-clay"}>
                {category.is_active ? labels.active : labels.hidden}
              </span>
              <button type="button" onClick={() => edit(category)} className={secondaryButtonClass}>
                {labels.editCategory}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
