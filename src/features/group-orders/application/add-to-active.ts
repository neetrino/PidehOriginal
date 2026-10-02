'use server';

import { addToCart } from '@/features/cart/cart';
import { setPlainCartQuantity } from '@/features/cart/plain-line';
import { addGroupOrderItem } from '@/features/group-orders/application/items';
import { setGroupPlainLineQuantity } from '@/features/group-orders/application/set-plain-line';
import { peekCartOrderMode } from '@/features/cart/order-mode';
import { peekGroupOrderSession } from '@/features/group-orders/session';

/**
 * Adds to the active group order when a session cookie is present;
 * otherwise falls back to the personal cart.
 */
export type AddProductToActiveCartResult =
  | { ok: true; target: 'group' | 'cart'; itemCount: number }
  | {
      ok: false;
      error: string;
      code?: 'SPEND_LIMIT_EXCEEDED';
      limitAmount?: number;
    };

export async function addProductToActiveCart(
  productId: string,
  quantity: number,
  options?: { modifierIds?: string[]; customerNote?: string },
): Promise<AddProductToActiveCartResult> {
  const session = await peekGroupOrderSession();
  if (
    session.inviteToken &&
    session.participantId &&
    (await peekCartOrderMode()) === 'group'
  ) {
    const result = await addGroupOrderItem({
      inviteToken: session.inviteToken,
      productId,
      quantity,
      modifierIds: options?.modifierIds,
      customerNote: options?.customerNote,
    });
    if (!result.ok) return result;
    const { getActiveGroupSessionItemCount } =
      await import('@/features/group-orders/application/active-session-cart');
    return { ok: true, target: 'group', itemCount: (await getActiveGroupSessionItemCount()) ?? 0 };
  }

  try {
    const itemCount = await addToCart(productId, quantity, options);
    return { ok: true, target: 'cart', itemCount };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unable to add to cart.',
    };
  }
}

export type SetActiveCartQuantityResult =
  | { ok: true; target: 'group' | 'cart'; quantity: number; itemCount: number }
  | {
      ok: false;
      error: string;
      code?: 'SPEND_LIMIT_EXCEEDED';
      limitAmount?: number;
    };

/**
 * Sets how many of this product (without modifiers) sit in the active cart.
 * Zero removes the line and restores the card's order button.
 */
export async function setActiveCartProductQuantity(
  productId: string,
  quantity: number,
): Promise<SetActiveCartQuantityResult> {
  if (!Number.isInteger(quantity) || quantity < 0) {
    return { ok: false, error: 'Invalid quantity.' };
  }

  const session = await peekGroupOrderSession();
  if (
    session.inviteToken &&
    session.participantId &&
    (await peekCartOrderMode()) === 'group'
  ) {
    const result = await setGroupPlainLineQuantity(
      session.inviteToken,
      session.participantId,
      productId,
      quantity,
    );
    if (!result.ok) return result;
    return { ok: true, target: 'group', quantity: result.quantity, itemCount: result.itemCount };
  }

  try {
    const result = await setPlainCartQuantity(productId, quantity);
    return { ok: true, target: 'cart', quantity: result.quantity, itemCount: result.itemCount };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unable to update cart.',
    };
  }
}
