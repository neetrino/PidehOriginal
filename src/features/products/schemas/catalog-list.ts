import { z } from "zod";

export const CATALOG_SORT_VALUES = [
  "newest",
  "price_asc",
  "price_desc",
  "popular",
] as const;

export type CatalogSort = (typeof CATALOG_SORT_VALUES)[number];

export const CATALOG_PAGE_SIZES = [12, 24, 48] as const;

export type CatalogPageSize = (typeof CATALOG_PAGE_SIZES)[number];

export const DEFAULT_CATALOG_SORT: CatalogSort = "newest";
export const DEFAULT_CATALOG_PAGE_SIZE: CatalogPageSize = 24;

/** Inclusive ceiling for catalog price filter inputs (display major units). */
export const CATALOG_PRICE_FILTER_MAX = 100_000_000;

const pageSizeSchema = z.coerce
  .number()
  .int()
  .refine(
    (value): value is CatalogPageSize =>
      (CATALOG_PAGE_SIZES as readonly number[]).includes(value),
    { message: "Invalid page size" },
  );

export const catalogFiltersSchema = z
  .object({
    q: z.string().trim().max(100).optional(),
    minPrice: z.coerce
      .number()
      .int()
      .min(0)
      .max(CATALOG_PRICE_FILTER_MAX)
      .optional(),
    maxPrice: z.coerce
      .number()
      .int()
      .min(0)
      .max(CATALOG_PRICE_FILTER_MAX)
      .optional(),
    category: z.string().trim().max(120).optional(),
    inStock: z.literal(true).optional(),
    onSale: z.literal(true).optional(),
    sort: z.enum(CATALOG_SORT_VALUES).catch(DEFAULT_CATALOG_SORT),
    page: z.coerce.number().int().min(1).max(500).catch(1),
    pageSize: pageSizeSchema.catch(DEFAULT_CATALOG_PAGE_SIZE),
  })
  .superRefine((value, ctx) => {
    if (
      value.minPrice != null &&
      value.maxPrice != null &&
      value.maxPrice < value.minPrice
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["maxPrice"],
        message: "maxPrice must be >= minPrice",
      });
    }
  });

export type CatalogFilters = z.infer<typeof catalogFiltersSchema>;

export const CATALOG_FILTER_PARAM_KEYS = [
  "q",
  "minPrice",
  "maxPrice",
  "category",
  "inStock",
  "onSale",
  "sort",
  "page",
  "pageSize",
] as const;
