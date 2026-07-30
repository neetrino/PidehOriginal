import {
  CATALOG_FILTER_PARAM_KEYS,
  catalogFiltersSchema,
  DEFAULT_CATALOG_PAGE_SIZE,
  DEFAULT_CATALOG_SORT,
  type CatalogFilters,
} from "@/features/products/schemas/catalog-list";

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function parseOptionalFlag(
  value: string | undefined,
): true | undefined {
  if (value === "true" || value === "1") {
    return true;
  }
  return undefined;
}

function parseOptionalInt(
  value: string | undefined,
): number | undefined {
  if (value == null || value.trim() === "") {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const EMPTY_FILTERS: CatalogFilters = {
  sort: DEFAULT_CATALOG_SORT,
  page: 1,
  pageSize: DEFAULT_CATALOG_PAGE_SIZE,
};

/**
 * Parses and normalizes storefront catalog URL search params (CAT-001/002).
 * Invalid values fall back to safe defaults instead of failing the page.
 */
export function parseCatalogSearchParams(
  raw: Record<string, string | string[] | undefined>,
): CatalogFilters {
  const minPrice = parseOptionalInt(firstParam(raw.minPrice));
  const maxPrice = parseOptionalInt(firstParam(raw.maxPrice));

  const parsed = catalogFiltersSchema.safeParse({
    q: firstParam(raw.q) || undefined,
    minPrice,
    maxPrice:
      minPrice != null && maxPrice != null && maxPrice < minPrice
        ? undefined
        : maxPrice,
    category: firstParam(raw.category)?.trim() || undefined,
    inStock: parseOptionalFlag(firstParam(raw.inStock)),
    onSale: parseOptionalFlag(firstParam(raw.onSale)),
    sort: firstParam(raw.sort) ?? DEFAULT_CATALOG_SORT,
    page: firstParam(raw.page) ?? "1",
    pageSize: firstParam(raw.pageSize) ?? String(DEFAULT_CATALOG_PAGE_SIZE),
  });

  if (!parsed.success) {
    // Recover sort/pagination when only filter fields are invalid.
    const fallback = catalogFiltersSchema.safeParse({
      sort: firstParam(raw.sort) ?? DEFAULT_CATALOG_SORT,
      page: firstParam(raw.page) ?? "1",
      pageSize: firstParam(raw.pageSize) ?? String(DEFAULT_CATALOG_PAGE_SIZE),
    });
    return fallback.success ? fallback.data : EMPTY_FILTERS;
  }

  return {
    ...parsed.data,
    q: parsed.data.q || undefined,
    category: parsed.data.category || undefined,
  };
}

/** Builds a catalog query string, omitting default values. */
export function buildCatalogQueryString(
  filters: CatalogFilters,
  overrides: Partial<CatalogFilters> = {},
): string {
  const merged: CatalogFilters = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (merged.q) params.set("q", merged.q);
  if (merged.minPrice != null) params.set("minPrice", String(merged.minPrice));
  if (merged.maxPrice != null) params.set("maxPrice", String(merged.maxPrice));
  if (merged.category) params.set("category", merged.category);
  if (merged.inStock) params.set("inStock", "true");
  if (merged.onSale) params.set("onSale", "true");
  if (merged.sort !== DEFAULT_CATALOG_SORT) params.set("sort", merged.sort);
  if (merged.pageSize !== DEFAULT_CATALOG_PAGE_SIZE) {
    params.set("pageSize", String(merged.pageSize));
  }
  if (merged.page > 1) params.set("page", String(merged.page));

  return params.toString();
}

/** True when any non-pagination catalog filter is active. */
export function hasActiveCatalogFilters(filters: CatalogFilters): boolean {
  return Boolean(
    filters.q ||
      filters.minPrice != null ||
      filters.maxPrice != null ||
      filters.category ||
      filters.inStock ||
      filters.onSale,
  );
}

export function catalogHref(
  locale: string,
  filters: CatalogFilters,
  overrides: Partial<CatalogFilters> = {},
): string {
  const query = buildCatalogQueryString(filters, overrides);
  return query
    ? `/${locale}/products?${query}`
    : `/${locale}/products`;
}

/** Clears only catalog filter params (keeps unrelated URL keys out by design). */
export function clearCatalogFiltersHref(locale: string): string {
  return `/${locale}/products`;
}

export function isCatalogFilterParam(key: string): boolean {
  return (CATALOG_FILTER_PARAM_KEYS as readonly string[]).includes(key);
}
