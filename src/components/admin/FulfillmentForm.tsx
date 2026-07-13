"use client";

import { PackageCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function FulfillmentForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "SHIPPED",
        carrier: carrier || undefined,
        trackingNumber: trackingNumber || undefined
      })
    });
    if (response.ok) {
      router.refresh();
      return;
    }
    setError("Could not update this order.");
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-2 border-t border-black/10 pt-4 sm:grid-cols-[10rem_1fr_auto]">
      <input value={carrier} onChange={(event) => setCarrier(event.target.value)} className="field bg-white! text-sm" placeholder="Carrier (USPS)" aria-label="Shipping carrier" />
      <input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} className="field bg-white! font-mono text-sm" placeholder="Tracking number · optional" aria-label="Tracking number" />
      <button disabled={busy} className="button-primary min-h-0! py-2.5! text-[0.65rem]!"><PackageCheck size={15} /> {busy ? "Saving…" : "Mark shipped"}</button>
      {error ? <p className="text-sm text-[#9a2f1d] sm:col-span-3">{error}</p> : null}
    </form>
  );
}
