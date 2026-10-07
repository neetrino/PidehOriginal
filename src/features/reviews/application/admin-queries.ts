import 'server-only';

import { eq, inArray } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { products } from '@/db/schema';
import type { TranslationsJson } from '@/db/schema/catalog';
import {
  loadOrderReviewStats,
  loadOrderReviewsForProduct,
  loadProductReviewStats,
  loadProductReviews,
  type AdminProductReview,
  type ReviewSourceStats,
} from '@/features/reviews/application/admin-review-sources';
import type { Locale } from '@/lib/i18n/config';

export type { AdminProductReview } from '@/features/reviews/application/admin-review-sources';

export type AdminReviewedProduct = {
  productId: string;
  title: string;
  sku: string;
  reviewCount: number;
  pendingCount: number;
  averageRating: number;
  lastReviewAt: Date;
};

export type AdminProductReviewsView = {
  productId: string;
  title: string;
  sku: string;
  reviews: AdminProductReview[];
};

function productTitle(translations: TranslationsJson, locale: Locale, fallback: string): string {
  return (translations[locale] ?? translations.hy ?? translations.en)?.title ?? fallback;
}

function mergeStats(sources: ReviewSourceStats[][]): Map<string, ReviewSourceStats> {
  const merged = new Map<string, ReviewSourceStats>();
  for (const row of sources.flat()) {
    const current = merged.get(row.productId);
    if (!current) {
      merged.set(row.productId, { ...row });
      continue;
    }
    current.reviewCount += row.reviewCount;
    current.ratingSum += row.ratingSum;
    current.pendingCount += row.pendingCount;
    if (row.lastReviewAt && (!current.lastReviewAt || row.lastReviewAt > current.lastReviewAt)) {
      current.lastReviewAt = row.lastReviewAt;
    }
  }
  return merged;
}

/**
 * Products with at least one product-page or order review, most recently reviewed first.
 * Order reviews count toward every product contained in the reviewed order.
 */
export async function listAdminReviewedProducts(locale: Locale): Promise<AdminReviewedProduct[]> {
  const stats = mergeStats(await Promise.all([loadProductReviewStats(), loadOrderReviewStats()]));
  if (stats.size === 0) {
    return [];
  }

  const productRows = await getDb()
    .select({ id: products.id, sku: products.sku, translations: products.translations })
    .from(products)
    .where(inArray(products.id, [...stats.keys()]));

  return productRows
    .map((product) => {
      const row = stats.get(product.id);
      const reviewCount = row?.reviewCount ?? 0;
      return {
        productId: product.id,
        title: productTitle(product.translations, locale, product.sku),
        sku: product.sku,
        reviewCount,
        pendingCount: row?.pendingCount ?? 0,
        averageRating:
          reviewCount === 0 ? 0 : Math.round(((row?.ratingSum ?? 0) / reviewCount) * 10) / 10,
        lastReviewAt: row?.lastReviewAt ?? new Date(0),
      };
    })
    .sort((a, b) => b.lastReviewAt.getTime() - a.lastReviewAt.getTime());
}

/** All product-page and order reviews for one product; null when the product does not exist. */
export async function getAdminProductReviews(
  productId: string,
  locale: Locale,
): Promise<AdminProductReviewsView | null> {
  const [product] = await getDb()
    .select({ id: products.id, sku: products.sku, translations: products.translations })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    return null;
  }

  const [productReviews, orderReviews] = await Promise.all([
    loadProductReviews(productId),
    loadOrderReviewsForProduct(productId),
  ]);

  return {
    productId: product.id,
    title: productTitle(product.translations, locale, product.sku),
    sku: product.sku,
    reviews: [...productReviews, ...orderReviews].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    ),
  };
}
