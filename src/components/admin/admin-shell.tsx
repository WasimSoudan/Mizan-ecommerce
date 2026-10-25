import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { getSession } from "@/lib/auth";
import { text } from "@/lib/copy";
import type { Locale } from "@/types";

export async function AdminShell({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect(`/${locale}/admin/login`);

  const labels = text(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{session.email}</p>
          <h1 className="font-display text-4xl text-green">{labels.adminTitle}</h1>
        </div>
        <SignOutButton locale={locale} label={labels.signOut} pendingLabel={labels.signingOut} />
      </div>
      <AdminNav locale={locale} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
