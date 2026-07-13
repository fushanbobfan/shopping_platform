"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }
      setError(data.error === "locked" ? "Too many attempts. Try again in 15 minutes." : "That password did not match.");
    } catch {
      setError("The studio could not be reached. Try again.");
    }
    setLoading(false);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-[#171714] p-12 text-[#f1ede4] lg:flex lg:flex-col lg:justify-between">
        <p className="font-black tracking-[-0.03em]">Mike&apos;s store</p>
        <p className="font-editorial max-w-lg text-7xl leading-[0.9]">The quiet side of the shop.</p>
        <p className="text-xs uppercase tracking-[0.14em] text-white/50">Private seller workspace</p>
      </div>
      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-black/55 hover:text-black"><ArrowLeft size={14} /> Back to store</Link>
          <LockKeyhole className="mt-14 text-[var(--accent)]" size={28} strokeWidth={1.6} />
          <h1 className="font-editorial mt-5 text-5xl">Studio sign in</h1>
          <p className="mt-3 text-sm leading-6 text-black/55">For Mike only. Access is rate-limited and expires after 12 hours.</p>
          <form onSubmit={submit} className="mt-8">
            <input
              type="text"
              name="username"
              autoComplete="username"
              value="mike"
              readOnly
              tabIndex={-1}
              aria-hidden="true"
              className="sr-only"
            />
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.12em]">Password</span>
              <input type="password" autoFocus autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="field mt-2 bg-white!" />
            </label>
            {error ? <p role="alert" className="mt-3 text-sm text-[#9a2f1d]">{error}</p> : null}
            <button disabled={loading} className="button-primary mt-6 w-full">
              {loading ? "Signing in…" : <>Enter studio <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
