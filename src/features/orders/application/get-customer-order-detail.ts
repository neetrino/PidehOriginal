'use server';

import { canCustomerAccessOrder } from '@/features/orders/application/customer-order-access';
import {
  getAdminOrderDetailView,
  type AdminOrderDetailView,
} from '@/features/orders/application/order-detail-view';
import { requireUser } from '@/lib/auth/policies';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { err, ok, type Result } from '@/lib/result';
import { getAdminOrderByNumber } from '@/features/orders/application/queries';

/**
 * Customer fetch of a single order for the profile order details drawer.
 * Returns NOT_FOUND when the order is missing, or the viewer is neither the
 * owner nor an ACTIVE group-order participant.
 * Group orders include per-participant breakdown so members can be distinguished.
 */
export async function getCustomerOrderDetailAction(
  locale: string,
  orderNumber: string,
): Promise<Result<AdminOrderDetailView>> {
  if (!isLocale(locale)) {
    return err('INVALID_LOCALE', 'Invalid locale.');
  }

  const trimmed = orderNumber.trim();
  if (!trimmed || trimmed.length > 64) {
    return err('VALIDATION_ERROR', 'Invalid order number.');
  }

  const user = await requireUser(locale as Locale);
  const loaded = await getAdminOrderByNumber(trimmed);

  if (!loaded) {
    return err('NOT_FOUND', 'Order not found.');
  }

  const allowed = await canCustomerAccessOrder({
    userId: user.id,
    orderUserId: loaded.order.userId,
    groupOrderId: loaded.order.groupOrderId,
  });
  if (!allowed) {
    return err('NOT_FOUND', 'Order not found.');
  }

  const detail = await getAdminOrderDetailView(trimmed, locale as Locale);
  if (!detail) {
    return err('NOT_FOUND', 'Order not found.');
  }

  return ok(detail);
}
