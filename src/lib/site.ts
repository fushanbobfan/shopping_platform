const configuredName = process.env.NEXT_PUBLIC_SHOP_NAME?.trim();
const configuredShippingCents = Number.parseInt(
  process.env.NEXT_PUBLIC_SHIPPING_CENTS || "0",
  10
);

export const siteConfig = {
  name: configuredName || "Mike's store",
  shortName: "MS",
  owner: process.env.NEXT_PUBLIC_SHOP_OWNER?.trim() || "Mike",
  location:
    process.env.NEXT_PUBLIC_SHOP_LOCATION?.trim() || "Los Angeles, CA",
  email: process.env.NEXT_PUBLIC_SHOP_EMAIL?.trim() || "",
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || "",
  shippingCents:
    Number.isFinite(configuredShippingCents) && configuredShippingCents >= 0
      ? configuredShippingCents
      : 0,
  description:
    "A rotating edit of well-worn favorites from Mike's personal wardrobe.",
  shippingNote:
    process.env.NEXT_PUBLIC_SHIPPING_NOTE?.trim() ||
    "Ships within the United States."
} as const;

export function absoluteUrl(path = "") {
  const base = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
