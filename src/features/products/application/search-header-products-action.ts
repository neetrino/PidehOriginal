"use server";

import { listCatalogProducts } from "@/features/products/application/list-catalog-products";
import {
  DEFAULT_CATALOG_SORT,
  catalogFiltersSchema,
} from "@/features/products/schemas/catalog-list";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createDisplayPriceFormatter } from "@/lib/money/display-price";
import { isCurrency, type Currency } from "@/lib/money/currency";

export type HeaderSearchProduct = {
  id: string;
  title: string;
  href: string;
  imageUrl: string | null;
  priceFormatted: string;
  compareAtFormatted: string | null;
  inStock: boolean;
};

export type HeaderSearchResult = {
  products: HeaderSearchProduct[];
  total: number;
  query: string;
};

const HEADER_SEARCH_PAGE_SIZE = 12;

/**
 * Live header search — returns a slim catalog slice for the popup.
 */
export async function searchHeaderProductsAction(
  locale: Locale,
  currency: Currency,
  rawQuery: string,
): Promise<HeaderSearchResult> {
  if (!isLocale(locale)) {
    throw new Error("Invalid locale.");
  }
  if (!isCurrency(currency)) {
    throw new Error("Invalid currency.");
  }

  const query = rawQuery.trim().slice(0, 100);
  if (!query) {
    return { products: [], total: 0, query: "" };
  }

  const filters = catalogFiltersSchema.parse({
    q: query,
    sort: DEFAULT_CATALOG_SORT,
    page: 1,
    pageSize: HEADER_SEARCH_PAGE_SIZE,
  });

  const [catalog, formatPrice] = await Promise.all([
    listCatalogProducts(locale, filters, currency),
    createDisplayPriceFormatter(locale, currency),
  ]);

  return {
    query,
    total: catalog.total,
    products: catalog.products.map((product) => {
      const compareAt =
        product.compareAtAmount != null
          ? formatPrice(product.compareAtAmount)
          : null;

      return {
        id: product.id,
        title: product.translation.title,
        href: `/${locale}/products/${product.translation.slug}`,
        imageUrl: product.imageUrl,
        priceFormatted: formatPrice(product.priceAmount).formatted,
        compareAtFormatted: compareAt?.formatted ?? null,
        inStock: product.stockOnHand > 0,
      };
    }),
  };
}
