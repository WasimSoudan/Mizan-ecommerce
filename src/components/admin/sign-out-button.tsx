"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { secondaryButtonClass } from "@/components/field-styles";
import type { Locale } from "@/types";

export function SignOutButton({
  locale,
  label,
  pendingLabel,
}: {
  locale: Locale;
  label: string;
  pendingLabel: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push(`/${locale}/admin/login`);
    router.refresh();
  }

  return (
    <button type="button" onClick={signOut} disabled={pending} className={secondaryButtonClass}>
      {pending ? pendingLabel : label}
    </button>
  );
}
