import { text } from "@/lib/copy";
import type { Locale } from "@/types";

export function DatabaseMessage({ locale }: { locale: Locale }) {
  const labels = text(locale);

  return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-display text-4xl text-green">{labels.dbTitle}</h1>
      <p className="mt-4 text-muted">{labels.dbBody}</p>
    </section>
  );
}
