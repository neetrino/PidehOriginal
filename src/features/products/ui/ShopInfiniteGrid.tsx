'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { StaggerGroup, StaggerItem } from '@/components/motion/StaggerGroup';
import { cardShelf } from '@/components/motion/presets';
import { HomeProductCard } from '@/features/home/ui/HomeProductCard';
import { loadShopCatalogPageAction } from '@/features/products/application/load-shop-catalog-page';
import type { CatalogFilters } from '@/features/products/schemas/catalog-list';
import type { ShopGridItem } from '@/features/products/ui/shop-grid-item';
import type { Locale } from '@/lib/i18n/config';

type ShopInfiniteGridProps = {
  locale: Locale;
  filters: CatalogFilters;
  initialItems: readonly ShopGridItem[];
  total: number;
  isSignedIn: boolean;
  wishlistLabel: string;
  orderLabel: string;
  outOfStockLabel: string;
  prepTimeLabel: string;
};

function ShopGridCards({
  locale,
  items,
  isSignedIn,
  wishlistLabel,
  orderLabel,
  outOfStockLabel,
  prepTimeLabel,
}: {
  locale: Locale;
  items: readonly ShopGridItem[];
  isSignedIn: boolean;
  wishlistLabel: string;
  orderLabel: string;
  outOfStockLabel: string;
  prepTimeLabel: string;
}) {
  return (
    <StaggerGroup
      play="mount"
      className="grid grid-cols-2 items-stretch justify-items-stretch gap-[13px] overflow-visible lg:grid-cols-3 xl:grid-cols-4"
      stagger={0.08}
      delayChildren={0.04}
    >
      {items.map((item, index) => (
        <StaggerItem
          key={item.product.id}
          variants={cardShelf}
          className="relative z-0 h-full w-full min-w-0 overflow-visible hover:z-50"
        >
          <HomeProductCard
            href={`/${locale}/products/${item.product.translation.slug}`}
            title={item.product.translation.title}
            description={item.product.translation.description ?? null}
            priceFormatted={item.priceFormatted}
            compareAtFormatted={item.compareAtFormatted}
            imageUrl={item.product.imageUrl}
            inStock={item.product.stockOnHand > 0}
            priority={index < 4}
            locale={locale}
            productId={item.product.id}
            inWishlist={item.inWishlist}
            cartQuantity={item.cartQuantity}
            maxQuantity={item.product.stockOnHand}
            isSignedIn={isSignedIn}
            wishlistLabel={wishlistLabel}
            orderLabel={orderLabel}
            outOfStockLabel={outOfStockLabel}
            prepTimeLabel={prepTimeLabel}
            className="max-w-none"
          />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}

/** Start the next slice before the shopper reaches the last row. */
const SHOP_PREFETCH_MARGIN_PX = 800;

function mergeShopItems(
  current: readonly ShopGridItem[],
  next: readonly ShopGridItem[],
): ShopGridItem[] {
  const seen = new Set(current.map((item) => item.product.id));
  const extra = next.filter((item) => !seen.has(item.product.id));
  return extra.length === 0 ? [...current] : [...current, ...extra];
}

export function ShopInfiniteGrid({
  locale,
  filters,
  initialItems,
  total: initialTotal,
  isSignedIn,
  wishlistLabel,
  orderLabel,
  outOfStockLabel,
  prepTimeLabel,
}: ShopInfiniteGridProps) {
  const [items, setItems] = useState<ShopGridItem[]>(() => [...initialItems]);
  const [total, setTotal] = useState(initialTotal);
  const pageRef = useRef(filters.page);
  const countRef = useRef(items.length);
  const pendingRef = useRef(false);
  const armedRef = useRef(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = items.length < total;
  countRef.current = items.length;

  const appendNextPage = useCallback(async (): Promise<void> => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    const nextPage = pageRef.current + 1;

    try {
      const result = await loadShopCatalogPageAction(locale, { ...filters, page: nextPage });
      pageRef.current = result.page;
      setTotal(result.products.length === 0 ? countRef.current : result.total);
      setItems((current) => mergeShopItems(current, result.products));
    } catch {
      armedRef.current = true;
    } finally {
      pendingRef.current = false;
    }
  }, [filters, locale]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return undefined;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting) {
        armedRef.current = true;
        return;
      }
      if (!armedRef.current || pendingRef.current) return;
      armedRef.current = false;
      void appendNextPage();
    }, { rootMargin: `0px 0px ${SHOP_PREFETCH_MARGIN_PX}px 0px` });

    observer.observe(node);
    return () => observer.disconnect();
  }, [appendNextPage, hasMore]);

  return (
    <>
      <ShopGridCards
        locale={locale}
        items={items}
        isSignedIn={isSignedIn}
        wishlistLabel={wishlistLabel}
        orderLabel={orderLabel}
        outOfStockLabel={outOfStockLabel}
        prepTimeLabel={prepTimeLabel}
      />
      {hasMore ? <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" /> : null}
    </>
  );
}
