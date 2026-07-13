import { describe, expect, it } from "vitest";
import { matchesCatalogQuery, normalizeCatalogText } from "./catalog-search";

const knit = {
  searchText:
    "Rust Rib Knit ARKET Knitwear M Like new Rust Cotton and wool blend relaxed travel layer"
};

describe("catalog keyword search", () => {
  it("normalizes case, accents, and repeated whitespace", () => {
    expect(normalizeCatalogText("  MÉRINO   Knit  ")).toBe("merino knit");
  });

  it("matches every keyword regardless of order", () => {
    expect(matchesCatalogQuery(knit, "arket rust")).toBe(true);
    expect(matchesCatalogQuery(knit, "WOOL travel")).toBe(true);
  });

  it("rejects an item when one keyword is absent", () => {
    expect(matchesCatalogQuery(knit, "arket denim")).toBe(false);
  });

  it("treats an empty query as a match", () => {
    expect(matchesCatalogQuery(knit, "   ")).toBe(true);
  });
});
