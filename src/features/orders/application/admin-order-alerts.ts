'use server';

import {
  getAdminUnseenOrdersSnapshot,
  markOrderAdminSeen,
  type AdminUnseenOrdersSnapshot,
} from '@/features/orders/application/queries';
import { requireAdmin } from '@/lib/auth/policies';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { err, ok, type Result } from '@/lib/result';

/**
 * Admin polling snapshot for unread (unopened) orders — badge + alert popup.
 */
export async function pollAdminUnseenOrdersAction(
  locale: string,
): Promise<Result<AdminUnseenOrdersSnapshot>> {
  if (!isLocale(locale)) {
    return err('INVALID_LOCALE', 'Invalid locale.');
  }

  await requireAdmin(locale as Locale);

  const snapshot = await getAdminUnseenOrdersSnapshot();
  return ok({
    count: snapshot.count,
    unseenIds: snapshot.unseenIds,
    latest: snapshot.latest.map((row) => ({
      ...row,
      placedAt: row.placedAt,
    })),
  });
}

/**
 * Marks an order as no longer "new" when an admin opens the details drawer.
 */
export async function markOrderAdminSeenAction(
  locale: string,
  orderNumber: string,
): Promise<Result<{ marked: boolean }>> {
  if (!isLocale(locale)) {
    return err('INVALID_LOCALE', 'Invalid locale.');
  }

  const trimmed = orderNumber.trim();
  if (!trimmed || trimmed.length > 64) {
    return err('VALIDATION_ERROR', 'Invalid order number.');
  }

  await requireAdmin(locale as Locale);

  const marked = await markOrderAdminSeen(trimmed);
  return ok({ marked });
}
