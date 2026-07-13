"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CancelReservationButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function cancel() {
    if (!window.confirm("Cancel this unpaid checkout and release its pieces?")) return;
    setBusy(true);
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" })
    });
    if (response.ok) router.refresh();
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={cancel}
      disabled={busy}
      className="mt-4 border border-[#9a2f1d] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#9a2f1d] hover:bg-[#9a2f1d] hover:text-white disabled:opacity-45"
    >
      {busy ? "Releasing…" : "Cancel and release pieces"}
    </button>
  );
}
