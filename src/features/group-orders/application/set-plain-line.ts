import 'server-only';

import { and, eq } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { groupOrderItems, products } from '@/db/schema';
import { getActiveGroupSessionItemCount } from '@/features/group-orders/application/active-session-cart';
import {
  addGroupOrderItem,
  removeGroupOrderItem,
  updateGroupOrderItemQuantity,
  type GroupOrderMutationResult,
} from '@/features/group-orders/application/items';

type PlainLineFailure = Extract<GroupOrderMutationResult, { ok: false }>;

export type SetGroupPlainLineResult =
  | { ok: true; quantity: number; itemCount: number }
  | PlainLineFailure;

const PLAIN_KEY = '';

async function readLine(
  participantId: string,
  productId: string,
): Promise<{ id: string; quantity: number } | null> {
  const [row] = await getDb()
    .select({ id: groupOrderItems.id, quantity: groupOrderItems.quantity })
    .from(groupOrderItems)
    .where(
      and(
        eq(groupOrderItems.participantId, participantId),
        eq(groupOrderItems.productId, productId),
        eq(groupOrderItems.selectionKey, PLAIN_KEY),
      ),
    )
    .limit(1);

  return row ?? null;
}

async function readStock(productId: string): Promise<number | null> {
  const [product] = await getDb()
    .select({ stock: products.stockOnHand, status: products.status })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product || product.status !== 'ACTIVE') return null;
  return product.stock;
}

async function finish(
  participantId: string,
  productId: string,
  failed?: PlainLineFailure,
): Promise<SetGroupPlainLineResult> {
  if (failed) return failed;
  const line = await readLine(participantId, productId);
  return {
    ok: true,
    quantity: line?.quantity ?? 0,
    itemCount: (await getActiveGroupSessionItemCount()) ?? 0,
  };
}

/**
 * Sets the participant's unmodified group-order line to an absolute quantity.
 * Zero removes the line. Stock and the spend limit still apply.
 */
export async function setGroupPlainLineQuantity(
  inviteToken: string,
  participantId: string,
  productId: string,
  quantity: number,
): Promise<SetGroupPlainLineResult> {
  const stock = await readStock(productId);
  if (stock === null) return { ok: false, error: 'Product unavailable.' };

  const next = quantity < 1 ? 0 : Math.min(quantity, stock);
  const existing = await readLine(participantId, productId);
  const failed = await applyGroupQuantity(inviteToken, productId, next, existing?.id);
  return finish(participantId, productId, failed);
}

async function applyGroupQuantity(
  inviteToken: string,
  productId: string,
  next: number,
  itemId: string | undefined,
): Promise<PlainLineFailure | undefined> {
  if (next < 1) {
    if (!itemId) return undefined;
    const removed = await removeGroupOrderItem({ inviteToken, itemId });
    return removed.ok ? undefined : removed;
  }

  if (itemId) {
    const updated = await updateGroupOrderItemQuantity({ inviteToken, itemId, quantity: next });
    return updated.ok ? undefined : updated;
  }

  const added = await addGroupOrderItem({ inviteToken, productId, quantity: next });
  return added.ok ? undefined : added;
}
