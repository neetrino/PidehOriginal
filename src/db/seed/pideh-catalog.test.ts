import { describe, expect, it } from "vitest";

import {
  catalogProductObjectKey,
  loadPidehCatalog,
} from "@/db/seed/pideh-catalog";

describe("loadPidehCatalog", () => {
  it("loads 5 categories and 34 unique product slugs", () => {
    const catalog = loadPidehCatalog();
    const slugs = catalog.products.map((item) => item.slug);
    const categorySlugs = catalog.categories.map((item) => item.slug);

    expect(catalog.categories).toHaveLength(5);
    expect(catalog.products).toHaveLength(34);
    expect(new Set(slugs).size).toBe(34);
    expect(categorySlugs).toEqual([
      "combo",
      "pide",
      "snack",
      "sauces",
      "drinks",
    ]);
    expect(slugs).toEqual(
      expect.arrayContaining(["sprite", "fanta", "cheese-sauce"]),
    );
    expect(catalogProductObjectKey("sprite")).toBe(
      "catalog/products/sprite.webp",
    );
    expect(
      catalog.products.every((item) => !("image" in item)),
    ).toBe(true);
  });
});
