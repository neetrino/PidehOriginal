import 'server-only';

import { and, eq, sql } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { cartItems, products } from '@/db/schema';
import { getCartWithItems, getOrCreateCart, revalidateCartPaths } from '@/features/cart/cart';
import { createId } from '@/lib/id';

/** Cart line with no modifiers — the line the product card edits. */
const PLAIN_SELECTION_KEY = '';

/**
 * Quantities of unmodified cart lines for the given products.
 * Missing ids are absent (treat as zero). Does not create a cart.
 */
export async function getPlainCartQuantities(
  productIds: readonly string[],
): Promise<Record<string, number>> {
  if (productIds.length === 0) return {};

  const wanted = new Set(productIds);
  const { items } = await getCartWithItems();
  const quantities: Record<string, number> = {};

  for (const row of items) {
    if (row.item.selectionKey !== PLAIN_SELECTION_KEY) continue;
    if (!wanted.has(row.item.productId)) continue;
    quantities[row.item.productId] = row.item.quantity;
  }

  return quantities;
}

async function countCartItems(cartId: string): Promise<number> {
  const [row] = await getDb()
    .select({
      total: sql<number>`coalesce(sum(${cartItems.quantity}), 0)::int`,
    })
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId));

  return row?.total ?? 0;
}

/**
 * Sets the unmodified cart line to an absolute quantity.
 * Zero removes the line. The result is capped by stock on hand.
 */
export async function setPlainCartQuantity(
  productId: string,
  quantity: number,
): Promise<{ quantity: number; itemCount: number }> {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error('Invalid quantity.');
  }

  const [cart, [product]] = await Promise.all([
    getOrCreateCart(),
    getDb()
      .select({
        id: products.id,
        stock: products.stockOnHand,
        status: products.status,
      })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1),
  ]);

  if (!product || product.status !== 'ACTIVE') {
    throw new Error('Product unavailable.');
  }

  const nextQty = quantity < 1 ? 0 : Math.min(quantity, product.stock);
  await writePlainLine(cart.id, productId, nextQty, product.stock);
  const itemCount = await countCartItems(cart.id);
  await revalidateCartPaths({ layout: false });
  return { quantity: nextQty, itemCount };
}

async function writePlainLine(
  cartId: string,
  productId: string,
  nextQty: number,
  stock: number,
): Promise<void> {
  const db = getDb();
  const [existing] = await db
    .select({ id: cartItems.id })
    .from(cartItems)
    .where(
      and(
        eq(cartItems.cartId, cartId),
        eq(cartItems.productId, productId),
        eq(cartItems.selectionKey, PLAIN_SELECTION_KEY),
      ),
    )
    .limit(1);

  if (nextQty < 1) {
    if (existing) await db.delete(cartItems).where(eq(cartItems.id, existing.id));
    return;
  }

  if (stock < 1) throw new Error('Product unavailable.');

  if (existing) {
    await db
      .update(cartItems)
      .set({ quantity: nextQty, updatedAt: new Date() })
      .where(eq(cartItems.id, existing.id));
    return;
  }

  await db.insert(cartItems).values({
    id: createId(),
    cartId,
    productId,
    selectionKey: PLAIN_SELECTION_KEY,
    quantity: nextQty,
  });
}
