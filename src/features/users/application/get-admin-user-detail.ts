'use server';

import { getCustomerBonusSummary } from '@/features/bonuses';
import { listCustomerGiftCards } from '@/features/gift-cards';
import { listCouponsAssignedToUser } from '@/features/promotions';
import { getAdminUserById } from '@/features/users/application/queries';
import type { AdminUserDetail } from '@/features/users/application/queries';
import type { CustomerBonusSummary } from '@/features/bonuses';
import type { CustomerGiftCardListItem } from '@/features/gift-cards';
import type { UserAssignedCoupon } from '@/features/promotions';
import { requireAdmin } from '@/lib/auth/policies';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { err, ok, type Result } from '@/lib/result';

export type AdminUserDrawerDetail = {
  user: AdminUserDetail['user'];
  recentOrders: AdminUserDetail['recentOrders'];
  bonuses: CustomerBonusSummary;
  giftCards: CustomerGiftCardListItem[];
  coupons: UserAssignedCoupon[];
};

/**
 * Admin-only fetch of a user profile for the users list drawer.
 */
export async function getAdminUserDetailAction(
  locale: string,
  userId: string,
): Promise<Result<AdminUserDrawerDetail>> {
  if (!isLocale(locale)) {
    return err('INVALID_LOCALE', 'Invalid locale.');
  }

  const trimmed = userId.trim();
  if (!trimmed || trimmed.length > 64) {
    return err('VALIDATION_ERROR', 'Invalid user id.');
  }

  await requireAdmin(locale as Locale);

  const detail = await getAdminUserById(trimmed);
  if (!detail) {
    return err('NOT_FOUND', 'User not found.');
  }

  const [bonuses, giftCards, coupons] = await Promise.all([
    getCustomerBonusSummary(detail.user.id, { limit: 10 }),
    listCustomerGiftCards(detail.user.id, detail.user.email),
    listCouponsAssignedToUser(detail.user.id),
  ]);

  return ok({
    user: detail.user,
    recentOrders: detail.recentOrders,
    bonuses,
    giftCards,
    coupons,
  });
}
