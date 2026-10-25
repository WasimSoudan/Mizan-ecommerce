import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-display text-4xl text-green">This page is not on the shelf.</h1>
      <p className="mt-3 text-muted">هذه الصفحة غير موجودة.</p>
      <Link
        href="/en"
        className="mt-6 inline-flex rounded-full bg-green px-4 py-2 text-sm font-semibold text-white"
      >
        Mizan
      </Link>
    </section>
  );
}
