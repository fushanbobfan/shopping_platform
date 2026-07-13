"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteProductButton({ id, disabled = false }: { id: string; disabled?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function archive() {
    if (disabled || !window.confirm("Move this piece to drafts? It will disappear from the store.")) return;
    setBusy(true);
    const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (response.ok) router.refresh();
    setBusy(false);
  }

  return <button type="button" onClick={archive} disabled={busy || disabled} title={disabled ? "A reserved piece cannot be archived" : undefined} className="text-[#a83220] hover:text-[#6f2115] disabled:cursor-not-allowed disabled:opacity-35">{busy ? "Archiving…" : "Archive"}</button>;
}
