import { describe, expect, it } from "vitest";
import {
  CHECKOUT_SESSION_MINUTES,
  RESERVATION_GRACE_MINUTES,
  checkoutExpiresAt,
  makePublicOrderId,
  ownsReservation,
  reservationExpiresAt,
  uniqueProductIds
} from "./orders";

describe("checkout reservation rules", () => {
  it("deduplicates and removes empty product ids", () => {
    expect(uniqueProductIds(["a", " a ", "", "b"])).toEqual(["a", "b"]);
  });

  it("keeps inventory reserved beyond the Stripe session expiry", () => {
    const now = new Date("2026-07-13T12:00:00.000Z");
    expect(checkoutExpiresAt(now).getTime() - now.getTime()).toBe(
      CHECKOUT_SESSION_MINUTES * 60_000
    );
    expect(reservationExpiresAt(now).getTime() - checkoutExpiresAt(now).getTime()).toBe(
      RESERVATION_GRACE_MINUTES * 60_000
    );
  });

  it("only treats the creating order as the reservation owner", () => {
    expect(ownsReservation("order-a", "order-a")).toBe(true);
    expect(ownsReservation("order-a", "order-b")).toBe(false);
    expect(ownsReservation(null, "order-a")).toBe(false);
  });

  it("creates human-readable, non-repeating order ids", () => {
    const now = new Date("2026-07-13T12:00:00.000Z");
    const first = makePublicOrderId(now);
    const second = makePublicOrderId(now);
    expect(first).toMatch(/^MA-20260713-[A-F0-9]{6}$/);
    expect(second).not.toBe(first);
  });
});
