import { randomBytes } from "node:crypto";

export const CHECKOUT_SESSION_MINUTES = 30;
export const RESERVATION_GRACE_MINUTES = 2;

export function uniqueProductIds(ids: string[]) {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
}

export function checkoutExpiresAt(now = new Date()) {
  return new Date(now.getTime() + CHECKOUT_SESSION_MINUTES * 60_000);
}

export function reservationExpiresAt(now = new Date()) {
  return new Date(
    now.getTime() +
      (CHECKOUT_SESSION_MINUTES + RESERVATION_GRACE_MINUTES) * 60_000
  );
}

export function makePublicOrderId(now = new Date()) {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  return `MA-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export function ownsReservation(
  reservedByOrderId: string | null,
  orderId: string
) {
  return reservedByOrderId === orderId;
}
