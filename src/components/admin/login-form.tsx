"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, fieldClass } from "@/components/field-styles";
import { text } from "@/lib/copy";
import type { Locale } from "@/types";

export function LoginForm({ locale }: { locale: Locale }) {
  const labels = text(locale);
  const router = useRouter();
  const [email, setEmail] = useState("admin@mizan.shop");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(payload?.error ?? labels.invalidLogin);
      setPending(false);
      return;
    }

    router.push(`/${locale}/admin`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-3xl border border-line bg-card p-6">
      <label className="block text-sm">
        <span className="mb-1 block text-muted">{labels.email}</span>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">{labels.password}</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={fieldClass}
        />
      </label>
      {error ? <p className="text-sm text-clay">{error}</p> : null}
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? labels.signingIn : labels.signIn}
      </button>
      <p className="text-sm text-muted">{labels.loginHint}</p>
    </form>
  );
}
