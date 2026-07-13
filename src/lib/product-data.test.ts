import { describe, expect, it } from "vitest";
import { productInputSchema, slugify } from "./product-data";

describe("product input", () => {
  it("creates stable URL slugs", () => {
    expect(slugify("  Mike's Washed Denim / Jacket  ")).toBe(
      "mike-s-washed-denim-jacket"
    );
  });

  it("rejects a free or image-less product", () => {
    const result = productInputSchema.safeParse({
      name: "Test piece",
      slug: "test-piece",
      description: "A complete description of the test piece.",
      priceCents: 0,
      images: []
    });
    expect(result.success).toBe(false);
  });

  it("accepts a bounded garment payload", () => {
    const result = productInputSchema.safeParse({
      name: "Test piece",
      slug: "test-piece",
      description: "A complete description of the test piece.",
      priceCents: 5000,
      measurements: { chest: "22 in" },
      images: ["https://images.example.com/piece.webp"]
    });
    expect(result.success).toBe(true);
  });
});
