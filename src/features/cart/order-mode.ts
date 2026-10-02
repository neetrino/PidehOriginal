import 'server-only';

import { cookies } from 'next/headers';

import { peekGroupOrderSession } from '@/features/group-orders/session';

/** Which basket the storefront uses while a group-order session is open. */
export const CART_ORDER_MODE_COOKIE = 'pideh_cart_order_mode';

export type CartOrderMode = 'group' | 'personal';

/**
 * Group session defaults to the group basket.
 * `personal` keeps that session but shops the regular cart instead.
 */
export async function peekCartOrderMode(): Promise<CartOrderMode> {
  const session = await peekGroupOrderSession();
  if (!session.inviteToken || !session.participantId) {
    return 'personal';
  }

  const value = (await cookies()).get(CART_ORDER_MODE_COOKIE)?.value;
  return value === 'personal' ? 'personal' : 'group';
}

export async function setCartOrderMode(mode: CartOrderMode): Promise<void> {
  const store = await cookies();
  store.set(CART_ORDER_MODE_COOKIE, mode, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 48,
  });
}
