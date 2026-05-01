"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { t } from "@/lib/i18n";

export function MarkShippedButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function click() {
    setBusy(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SHIPPED" })
    });
    if (res.ok) router.refresh();
    setBusy(false);
  }

  return (
    <button
      onClick={click}
      disabled={busy}
      className="text-xs px-2 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
    >
      {busy ? "…" : t.admin.orders.markShipped}
    </button>
  );
}
