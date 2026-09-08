import "server-only";

import { listCatalogProducts } from "@/features/products/application/list-catalog-products";
import {
  CATALOG_PAGE_SIZES,
  type CatalogFilters,
} from "@/features/products/schemas/catalog-list";
import type { CatalogProduct } from "@/features/products/types";
import type { Locale } from "@/lib/i18n/config";
import type { Currency } from "@/lib/money/currency";

/** Products shown per category block on the mobile menu (Figma 366:464 = 2×2). */
export const CATALOG_SECTION_PRODUCT_LIMIT = 4;

/** The catalog query only accepts fixed page sizes, so trim the smallest one. */
const SECTION_PAGE_SIZE = CATALOG_PAGE_SIZES[0];

export type CatalogSectionCategory = {
  slug: string;
  title: string;
};

export type CatalogSection = CatalogSectionCategory & {
  products: CatalogProduct[];
  /** Total matches in the category, so the caller can offer a "see all" link. */
  total: number;
};

/**
 * Groups the catalog into one block per active root category, keeping the
 * shopper's current filters (search, price, availability) applied.
 * Categories without matches are omitted.
 */
export async function listCatalogSections(
  locale: Locale,
  categories: readonly CatalogSectionCategory[],
  filters: CatalogFilters,
  displayCurrency: Currency,
  limit: number = CATALOG_SECTION_PRODUCT_LIMIT,
): Promise<CatalogSection[]> {
  const results = await Promise.all(
    categories.map(async (category) => {
      const page = await listCatalogProducts(
        locale,
        {
          ...filters,
          category: category.slug,
          page: 1,
          pageSize: SECTION_PAGE_SIZE,
        },
        displayCurrency,
      );

      return {
        slug: category.slug,
        title: category.title,
        products: page.products.slice(0, limit),
        total: page.total,
      };
    }),
  );

  return results.filter((section) => section.products.length > 0);
}
