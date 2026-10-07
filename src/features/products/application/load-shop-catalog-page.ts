'use server';

import { getActivePlainCartQuantities } from '@/features/cart/get-active-plain-quantities';
import { listCatalogProducts } from '@/features/products/application/list-catalog-products';
import { catalogFiltersSchema } from '@/features/products/schemas/catalog-list';
import type { ShopGridItem } from '@/features/products/ui/shop-grid-item';
import { getWishlistProductIds } from '@/features/wishlist/queries';
import { isLocale } from '@/lib/i18n/config';
import { createDisplayPriceFormatter, getSelectedCurrency } from '@/lib/money/display-price';

export type ShopCatalogPage = {
  products: ShopGridItem[];
  total: number;
  page: number;
};

/**
 * Next shop-page slice for infinite scroll. Filters are validated again here.
 */
export async function loadShopCatalogPageAction(
  locale: string,
  rawFilters: unknown,
): Promise<ShopCatalogPage> {
  if (!isLocale(locale)) {
    throw new Error('Invalid locale.');
  }

  const filters = catalogFiltersSchema.parse(rawFilters);
  const currency = await getSelectedCurrency();
  const catalog = await listCatalogProducts(locale, filters, currency);
  const formatPrice = await createDisplayPriceFormatter(locale, currency);
  const ids = catalog.products.map((product) => product.id);
  const [wishlistIds, cartQuantities] = await Promise.all([
    getWishlistProductIds(ids),
    getActivePlainCartQuantities(ids),
  ]);

  return {
    page: catalog.page,
    total: catalog.total,
    products: catalog.products.map((product) => {
      const compareAt =
        product.compareAtAmount != null ? formatPrice(product.compareAtAmount) : null;

      return {
        product,
        priceFormatted: formatPrice(product.priceAmount).formatted,
        compareAtFormatted: compareAt?.formatted ?? null,
        inWishlist: wishlistIds.has(product.id),
        cartQuantity: cartQuantities[product.id] ?? 0,
      };
    }),
  };
}
