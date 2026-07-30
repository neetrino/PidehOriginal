import { describe, expect, it } from "vitest";

import {
  buildCatalogQueryString,
  hasActiveCatalogFilters,
  parseCatalogSearchParams,
} from "@/features/products/application/catalog-search-params";

describe("parseCatalogSearchParams", () => {
  it("applies safe defaults", () => {
    expect(parseCatalogSearchParams({})).toEqual({
      sort: "newest",
      page: 1,
      pageSize: 24,
    });
  });

  it("parses valid filter params", () => {
    expect(
      parseCatalogSearchParams({
        q: "  oak  ",
        minPrice: "1000",
        maxPrice: "5000",
        category: "tables",
        inStock: "true",
        onSale: "true",
        sort: "price_asc",
        page: "2",
        pageSize: "12",
      }),
    ).toMatchObject({
      q: "oak",
      minPrice: 1000,
      maxPrice: 5000,
      category: "tables",
      inStock: true,
      onSale: true,
      sort: "price_asc",
      page: 2,
      pageSize: 12,
    });
  });

  it("falls back on invalid sort/pageSize while keeping filters", () => {
    expect(
      parseCatalogSearchParams({
        sort: "cheap",
        pageSize: "99",
        category: "tables",
        inStock: "true",
      }),
    ).toMatchObject({
      sort: "newest",
      page: 1,
      pageSize: 24,
      category: "tables",
      inStock: true,
    });
  });
});

describe("buildCatalogQueryString", () => {
  it("omits defaults", () => {
    expect(
      buildCatalogQueryString({
        sort: "newest",
        page: 1,
        pageSize: 24,
      }),
    ).toBe("");
  });

  it("includes active filters and resets page via overrides", () => {
    const query = buildCatalogQueryString(
      {
        sort: "popular",
        page: 3,
        pageSize: 12,
        category: "chairs",
        inStock: true,
      },
      { page: 1 },
    );
    expect(query).toContain("sort=popular");
    expect(query).toContain("category=chairs");
    expect(query).toContain("inStock=true");
    expect(query).toContain("pageSize=12");
    expect(query).not.toContain("page=");
  });
});

describe("hasActiveCatalogFilters", () => {
  it("ignores sort/pagination-only state", () => {
    expect(
      hasActiveCatalogFilters({
        sort: "price_desc",
        page: 2,
        pageSize: 48,
      }),
    ).toBe(false);
  });

  it("detects filter presence", () => {
    expect(
      hasActiveCatalogFilters({
        sort: "newest",
        page: 1,
        pageSize: 24,
        onSale: true,
      }),
    ).toBe(true);
  });
});
