import Stripe from "stripe";

// Instantiate lazily so `next build` (which imports server components that
// transitively import this file) doesn't fail when the env var isn't set yet.
// Missing key only matters at runtime.
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder",
  { apiVersion: "2025-02-24.acacia" }
);

export function allowedShippingCountries(): Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] {
  const raw = process.env.STRIPE_ALLOWED_COUNTRIES ?? "US,CA,GB,AU,JP,SG,HK,CN";
  return raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean) as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[];
}
