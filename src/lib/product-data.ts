import { z } from "zod";

export const productCategories = [
  "Outerwear",
  "Knitwear",
  "Shirts",
  "Trousers",
  "Denim",
  "Footwear",
  "Accessories",
  "Other"
] as const;

export const productConditions = [
  "New with tags",
  "Like new",
  "Excellent",
  "Good",
  "Worn"
] as const;

export const productStatuses = [
  "AVAILABLE",
  "RESERVED",
  "SOLD",
  "HIDDEN"
] as const;

const optionalText = z.string().trim().max(120).nullable().optional();

export const productInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  brand: optionalText,
  description: z.string().trim().min(10).max(5000),
  story: z.string().trim().max(3000).nullable().optional(),
  priceCents: z.number().int().positive().max(10_000_000),
  compareAtCents: z.number().int().positive().max(10_000_000).nullable().optional(),
  size: optionalText,
  category: optionalText,
  condition: optionalText,
  color: optionalText,
  material: optionalText,
  measurements: z.record(z.string(), z.string().trim().max(80)).optional(),
  featured: z.boolean().optional().default(false),
  status: z.enum(productStatuses).optional(),
  images: z
    .array(z.string().url().max(2000))
    .min(1)
    .max(10)
});

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 180);
}

export const statusLabels: Record<(typeof productStatuses)[number], string> = {
  AVAILABLE: "Live",
  RESERVED: "In checkout",
  SOLD: "Sold",
  HIDDEN: "Draft"
};
