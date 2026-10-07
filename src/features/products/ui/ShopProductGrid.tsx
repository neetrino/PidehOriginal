import { ShopInfiniteGrid } from '@/features/products/ui/ShopInfiniteGrid';
import type { ShopGridItem } from '@/features/products/ui/shop-grid-item';
import type { CatalogFilters } from '@/features/products/schemas/catalog-list';
import type { CatalogProduct } from '@/features/products/types';
import type { Locale } from '@/lib/i18n/config';

type PricedProduct = {
  product: CatalogProduct;
  priceFormatted: string;
  compareAtFormatted: string | null;
};

type ShopProductGridProps = {
  locale: Locale;
  filters: CatalogFilters;
  products: readonly PricedProduct[];
  total: number;
  wishlistIds: ReadonlySet<string>;
  cartQuantities: Readonly<Record<string, number>>;
  isSignedIn: boolean;
  emptyTitle: string;
  emptyDescription: string;
  wishlistLabel: string;
  orderLabel: string;
  outOfStockLabel: string;
  prepTimeLabel: string;
};

function toGridItems(
  products: readonly PricedProduct[],
  wishlistIds: ReadonlySet<string>,
  cartQuantities: Readonly<Record<string, number>>,
): ShopGridItem[] {
  return products.map((item) => ({
    product: item.product,
    priceFormatted: item.priceFormatted,
    compareAtFormatted: item.compareAtFormatted,
    inWishlist: wishlistIds.has(item.product.id),
    cartQuantity: cartQuantities[item.product.id] ?? 0,
  }));
}

export function ShopProductGrid({
  locale,
  filters,
  products,
  total,
  wishlistIds,
  cartQuantities,
  isSignedIn,
  emptyTitle,
  emptyDescription,
  wishlistLabel,
  orderLabel,
  outOfStockLabel,
  prepTimeLabel,
}: ShopProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-[26px] bg-white px-6 py-16 text-center shadow-[0px_12px_14px_rgba(31,20,8,0.11)]">
        <h2 className="text-lg font-semibold text-[#1e1e1e]">{emptyTitle}</h2>
        <p className="font-noto-armenian mt-2 text-sm text-[#6b6b6b]">{emptyDescription}</p>
      </div>
    );
  }

  const listKey = [
    filters.q ?? '',
    filters.category ?? '',
    filters.sort,
    filters.minPrice ?? '',
    filters.maxPrice ?? '',
    filters.inStock ? '1' : '0',
    filters.onSale ? '1' : '0',
  ].join('|');

  return (
    <ShopInfiniteGrid
      key={listKey}
      locale={locale}
      filters={{ ...filters, page: 1 }}
      initialItems={toGridItems(products, wishlistIds, cartQuantities)}
      total={total}
      isSignedIn={isSignedIn}
      wishlistLabel={wishlistLabel}
      orderLabel={orderLabel}
      outOfStockLabel={outOfStockLabel}
      prepTimeLabel={prepTimeLabel}
    />
  );
}
