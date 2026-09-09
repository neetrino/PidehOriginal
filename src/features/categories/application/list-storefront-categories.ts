import 'server-only';

import { and, asc, eq, isNotNull, isNull, or, sql } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

import { getDb } from '@/db/client';
import {
  categories,
  mediaAssets,
  productCategories,
  products,
  type LocaleTranslation,
} from '@/db/schema';
import { CACHE_TAGS, PUBLIC_CACHE_REVALIDATE_SECONDS } from '@/lib/cache/tags';
import type { Locale } from '@/lib/i18n/config';
import { mediaPublicUrl } from '@/lib/media/public-url';

export type StorefrontCategoryCard = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  /** Active products linked to the category. */
  productCount: number;
};

function translationFor(
  translations: (typeof categories.$inferSelect)['translations'],
  locale: Locale,
): LocaleTranslation | null {
  return translations[locale] ?? translations.hy ?? translations.en ?? null;
}

async function loadStorefrontCategories(locale: Locale): Promise<StorefrontCategoryCard[]> {
  const rows = await getDb()
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.status, 'ACTIVE'),
        isNull(categories.deletedAt),
        isNull(categories.parentId),
      ),
    )
    .orderBy(asc(categories.sortOrder), asc(categories.createdAt));

  if (rows.length === 0) {
    return [];
  }

  const [mediaRows, countRows] = await Promise.all([
    getDb()
      .select({
        categoryId: mediaAssets.categoryId,
        objectKey: mediaAssets.objectKey,
      })
      .from(mediaAssets)
      .where(
        and(
          isNotNull(mediaAssets.categoryId),
          eq(mediaAssets.uploadStatus, 'READY'),
          or(
            eq(mediaAssets.isPrimary, true),
            eq(mediaAssets.role, 'PRIMARY'),
            eq(mediaAssets.role, 'COVER'),
          ),
        ),
      ),
    getDb()
      .select({
        categoryId: productCategories.categoryId,
        total: sql<number>`count(*)::int`,
      })
      .from(productCategories)
      .innerJoin(products, eq(productCategories.productId, products.id))
      .where(and(eq(products.status, 'ACTIVE'), isNull(products.deletedAt)))
      .groupBy(productCategories.categoryId),
  ]);

  const images = new Map<string, string>();
  const counts = new Map(countRows.map((row) => [row.categoryId, row.total] as const));
  const rowIds = new Set(rows.map((row) => row.id));
  for (const media of mediaRows) {
    if (!media.categoryId || images.has(media.categoryId)) continue;
    if (!rowIds.has(media.categoryId)) continue;
    images.set(media.categoryId, mediaPublicUrl(media.objectKey));
  }

  return rows
    .map((row) => {
      const translation = translationFor(row.translations, locale);
      const slug = translation?.slug?.trim();
      if (!translation?.title || !slug) {
        return null;
      }

      return {
        id: row.id,
        title: translation.title,
        slug,
        imageUrl: images.get(row.id) ?? null,
        productCount: counts.get(row.id) ?? 0,
      } satisfies StorefrontCategoryCard;
    })
    .filter((item): item is StorefrontCategoryCard => item !== null);
}

/** Active root categories for the storefront home grid (tag-cached). */
export async function listStorefrontCategories(locale: Locale): Promise<StorefrontCategoryCard[]> {
  return unstable_cache(
    async () => loadStorefrontCategories(locale),
    ['storefront-categories', locale],
    {
      // Products tag included: the card shows how many products each category has.
      tags: [CACHE_TAGS.categories, CACHE_TAGS.products],
      revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    },
  )();
}
