import 'server-only';

import { and, eq, isNull, or, sql } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

import { getDb } from '@/db/client';
import { categories, mediaAssets, productCategories, products } from '@/db/schema';
import {
  resolveOrbitPideImageUrls,
  type OrbitPideImageRow,
} from '@/features/home/application/orbit-pide-images';
import { CACHE_TAGS, PUBLIC_CACHE_REVALIDATE_SECONDS } from '@/lib/cache/tags';
import { mediaPublicUrl } from '@/lib/media/public-url';

function productSlug(translations: (typeof products.$inferSelect)['translations']): string {
  return translations.en?.slug ?? translations.hy?.slug ?? translations.ru?.slug ?? '';
}

async function loadOrbitPideImageRows(): Promise<OrbitPideImageRow[]> {
  const rows = await getDb()
    .select({
      translations: products.translations,
      objectKey: mediaAssets.objectKey,
    })
    .from(products)
    .innerJoin(productCategories, eq(productCategories.productId, products.id))
    .innerJoin(categories, eq(categories.id, productCategories.categoryId))
    .innerJoin(mediaAssets, eq(mediaAssets.productId, products.id))
    .where(
      and(
        eq(products.status, 'ACTIVE'),
        isNull(products.deletedAt),
        eq(mediaAssets.uploadStatus, 'READY'),
        or(eq(mediaAssets.isPrimary, true), eq(mediaAssets.role, 'PRIMARY')),
        sql`(
          ${categories.translations}->'hy'->>'slug' = 'pide'
          OR ${categories.translations}->'en'->>'slug' = 'pide'
        )`,
      ),
    );

  return rows
    .map((row) => ({
      slug: productSlug(row.translations),
      url: mediaPublicUrl(row.objectKey),
    }))
    .filter((row) => row.slug.length > 0);
}

/** Distinct pide product photos for the desktop categories orbit. */
export async function listOrbitPideImageUrls(): Promise<string[]> {
  return unstable_cache(
    async () => resolveOrbitPideImageUrls(await loadOrbitPideImageRows()),
    ['orbit-pide-images-v3'],
    {
      tags: [CACHE_TAGS.products],
      revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    },
  )();
}
