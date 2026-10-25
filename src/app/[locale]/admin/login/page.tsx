import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { getSession } from "@/lib/auth";
import { text } from "@/lib/copy";
import { assertLocale } from "@/lib/locale";

export const metadata = { title: "Sign in" };

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-center text-muted">…</div>}>
      <LoginGate params={params} />
    </Suspense>
  );
}

async function LoginGate({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const session = await getSession();
  if (session) redirect(`/${locale}/admin`);

  const labels = text(locale);

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-5xl text-green">{labels.signIn}</h1>
      <LoginForm locale={locale} />
    </section>
  );
}
