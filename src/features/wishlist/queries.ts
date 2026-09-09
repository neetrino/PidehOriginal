import 'server-only';

import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getDb } from '@/db/client';
import { products, wishlistItems } from '@/db/schema';
import { getActiveProductsByIds, type CatalogProduct } from '@/features/products/queries';
import { getCurrentUser } from '@/lib/auth/session';
import { createId } from '@/lib/id';
import type { Locale } from '@/lib/i18n/config';

async function countWishlistItems(userId: string): Promise<number> {
  const [row] = await getDb()
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, userId));

  return row?.count ?? 0;
}

/** Returns wishlist item count for the signed-in user (0 for guests). */
export async function getWishlistCount(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) {
    return 0;
  }

  return countWishlistItems(user.id);
}

/** Product IDs currently on the viewer's wishlist. */
export async function getWishlistProductIds(productIds?: string[]): Promise<Set<string>> {
  const user = await getCurrentUser();
  if (!user) {
    return new Set();
  }

  const conditions = [eq(wishlistItems.userId, user.id)];
  if (productIds && productIds.length > 0) {
    conditions.push(inArray(wishlistItems.productId, productIds));
  }

  const rows = await getDb()
    .select({ productId: wishlistItems.productId })
    .from(wishlistItems)
    .where(and(...conditions));

  return new Set(rows.map((row) => row.productId));
}

/** Whether a product is on the viewer's wishlist. */
export async function isProductInWishlist(productId: string): Promise<boolean> {
  const ids = await getWishlistProductIds([productId]);
  return ids.has(productId);
}

/** Active catalog products on the viewer's wishlist (ordered by wishlist add time). */
export async function listWishlistProducts(locale: Locale): Promise<CatalogProduct[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const links = await getDb()
    .select({ productId: wishlistItems.productId })
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, user.id))
    .orderBy(desc(wishlistItems.createdAt));

  if (links.length === 0) {
    return [];
  }

  const wishedIds = links.map((row) => row.productId);
  const active = await getActiveProductsByIds(locale, wishedIds);
  const byId = new Map(active.map((product) => [product.id, product]));

  return wishedIds
    .map((id) => byId.get(id))
    .filter((product): product is CatalogProduct => product != null);
}

/**
 * Adds or removes a product from the signed-in user's wishlist.
 * Guests must sign in first (caller redirects).
 *
 * Returns the resulting badge count so the caller can update the header without
 * a server re-render.
 */
export async function toggleWishlist(productId: string): Promise<{
  inWishlist: boolean;
  count: number;
}> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHENTICATED');
  }

  // Independent reads run together: every round-trip delays the heart filling.
  const [[product], [existing]] = await Promise.all([
    getDb()
      .select({
        id: products.id,
        status: products.status,
        deletedAt: products.deletedAt,
      })
      .from(products)
      .where(and(eq(products.id, productId), isNull(products.deletedAt)))
      .limit(1),
    getDb()
      .select({ id: wishlistItems.id })
      .from(wishlistItems)
      .where(and(eq(wishlistItems.userId, user.id), eq(wishlistItems.productId, productId)))
      .limit(1),
  ]);

  if (!product || product.status !== 'ACTIVE') {
    throw new Error('PRODUCT_UNAVAILABLE');
  }

  if (existing) {
    await getDb().delete(wishlistItems).where(eq(wishlistItems.id, existing.id));
  } else {
    await getDb().insert(wishlistItems).values({
      id: createId(),
      userId: user.id,
      productId,
    });
  }

  const count = await countWishlistItems(user.id);
  revalidateWishlistPaths();
  return { inWishlist: !existing, count };
}

/**
 * Invalidates the wishlist page only — the header badge is updated on the
 * client, so the storefront layout is left untouched.
 */
function revalidateWishlistPaths(): void {
  revalidatePath('/[locale]/wishlist', 'page');
}
