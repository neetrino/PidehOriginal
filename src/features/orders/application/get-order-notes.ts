'use server';

import {
  listOrderNotesByOrderNumber,
  type AdminOrderNote,
} from '@/features/orders/application/admin-order-notes';
import { requireAdmin } from '@/lib/auth/policies';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { err, ok, type Result } from '@/lib/result';

/** Admin-only fetch of internal notes for the order details drawer. */
export async function getAdminOrderNotesAction(
  locale: string,
  orderNumber: string,
): Promise<Result<AdminOrderNote[]>> {
  if (!isLocale(locale)) {
    return err('INVALID_LOCALE', 'Invalid locale.');
  }

  const trimmed = orderNumber.trim();
  if (!trimmed || trimmed.length > 64) {
    return err('VALIDATION_ERROR', 'Invalid order number.');
  }

  await requireAdmin(locale as Locale);

  return ok(await listOrderNotesByOrderNumber(trimmed));
}
