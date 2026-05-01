"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(t.admin.login.error);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto py-16">
      <h1 className="text-xl font-semibold mb-6">{t.admin.login.title}</h1>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-neutral-600">
            {t.admin.login.password}
          </span>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {t.admin.login.submit}
        </button>
      </form>
    </div>
  );
}
