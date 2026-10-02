'use server';

import { getCartDrawerView } from '@/features/cart/get-cart-drawer-view';
import type { CartDrawerBundle } from '@/features/cart/get-cart-drawer-view';
import { setCartOrderMode, type CartOrderMode } from '@/features/cart/order-mode';
import type { Locale } from '@/lib/i18n/config';
import type { Currency } from '@/lib/money/currency';

/** Loads the group basket and the personal cart together. */
export async function loadCartDrawerViewAction(
  locale: Locale,
  currency: Currency,
): Promise<CartDrawerBundle> {
  return getCartDrawerView(locale, currency);
}

/** Remembers whether the open group session should shop as a regular order. */
export async function setCartOrderModeAction(mode: CartOrderMode): Promise<void> {
  await setCartOrderMode(mode);
}
