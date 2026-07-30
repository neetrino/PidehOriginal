import { describe, expect, it } from "vitest";

import {
  applyFixedToListPrice,
  applyPercentageToListPrice,
  pickAutomaticDiscountPercent,
  resolveCatalogPrice,
} from "@/features/promotions/domain/resolve-automatic-discount";

describe("pickAutomaticDiscountPercent", () => {
  it("prefers product over category and global", () => {
    expect(
      pickAutomaticDiscountPercent({
        productPercent: 15,
        categoryPercents: [40, 20],
        globalPercent: 50,
      }),
    ).toEqual({ percent: 15, source: "product" });
  });

  it("uses the strongest category when no product rule exists", () => {
    expect(
      pickAutomaticDiscountPercent({
        categoryPercents: [10, 25, null, 5],
        globalPercent: 40,
      }),
    ).toEqual({ percent: 25, source: "category" });
  });

  it("falls back to global", () => {
    expect(
      pickAutomaticDiscountPercent({
        globalPercent: 10,
      }),
    ).toEqual({ percent: 10, source: "global" });
  });
});

describe("applyPercentageToListPrice", () => {
  it("computes sale and compare-at amounts", () => {
    expect(applyPercentageToListPrice(10_000, 10, "global")).toEqual({
      listAmount: 10_000,
      unitAmount: 9_000,
      compareAtAmount: 10_000,
      discountPercent: 10,
      source: "global",
    });
  });

  it("returns list price unchanged without a percent", () => {
    expect(applyPercentageToListPrice(2_500, null)).toEqual({
      listAmount: 2_500,
      unitAmount: 2_500,
      compareAtAmount: null,
      discountPercent: null,
      source: null,
    });
  });
});

describe("resolveCatalogPrice", () => {
  it("keeps manual compare-at when no automatic discount applies", () => {
    expect(
      resolveCatalogPrice({
        listAmount: 8_000,
        manualCompareAtAmount: 10_000,
      }),
    ).toMatchObject({
      unitAmount: 8_000,
      compareAtAmount: 10_000,
      discountPercent: null,
    });
  });

  it("lets automatic discount override manual compare-at", () => {
    expect(
      resolveCatalogPrice({
        listAmount: 8_000,
        productPercent: 25,
        manualCompareAtAmount: 12_000,
      }),
    ).toMatchObject({
      unitAmount: 6_000,
      compareAtAmount: 8_000,
      discountPercent: 25,
      source: "product",
    });
  });

  it("applies fixed product discount before category/global percent", () => {
    expect(
      resolveCatalogPrice({
        listAmount: 10_000,
        productDiscount: { type: "FIXED", value: 1_500 },
        categoryPercents: [50],
        globalPercent: 10,
      }),
    ).toMatchObject({
      unitAmount: 8_500,
      compareAtAmount: 10_000,
      source: "product",
    });
  });
});

describe("applyFixedToListPrice", () => {
  it("subtracts a fixed AMD amount", () => {
    expect(applyFixedToListPrice(5_000, 500, "product")).toEqual({
      listAmount: 5_000,
      unitAmount: 4_500,
      compareAtAmount: 5_000,
      discountPercent: 10,
      source: "product",
    });
  });
});
