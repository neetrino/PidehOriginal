import 'server-only';

import { and, eq, inArray } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { groupOrderItems } from '@/db/schema';
import { peekCartOrderMode } from '@/features/cart/order-mode';
import { getPlainCartQuantities } from '@/features/cart/plain-line';
import { peekGroupOrderSession } from '@/features/group-orders/session';

/**
 * Unmodified line quantities for the cards on screen.
 * Uses the active group order when that session is open, otherwise the personal cart.
 */
export async function getActivePlainCartQuantities(
  productIds: readonly string[],
): Promise<Record<string, number>> {
  if (productIds.length === 0) return {};

  const session = await peekGroupOrderSession();
  if (
    session.inviteToken &&
    session.participantId &&
    (await peekCartOrderMode()) === 'group'
  ) {
    return readGroupPlainQuantities(session.participantId, productIds);
  }

  return getPlainCartQuantities(productIds);
}

async function readGroupPlainQuantities(
  participantId: string,
  productIds: readonly string[],
): Promise<Record<string, number>> {
  const rows = await getDb()
    .select({
      productId: groupOrderItems.productId,
      quantity: groupOrderItems.quantity,
    })
    .from(groupOrderItems)
    .where(
      and(
        eq(groupOrderItems.participantId, participantId),
        eq(groupOrderItems.selectionKey, ''),
        inArray(groupOrderItems.productId, [...productIds]),
      ),
    );

  const quantities: Record<string, number> = {};
  for (const row of rows) {
    quantities[row.productId] = row.quantity;
  }
  return quantities;
}
