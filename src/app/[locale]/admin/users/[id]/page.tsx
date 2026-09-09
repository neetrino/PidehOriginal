import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Card } from '@/components/ui/Card';
import { ADMIN_PAGE_SUBTITLE } from '@/features/admin/ui/admin-form-classes';
import { AdminPageHeading } from '@/features/admin/ui/AdminPageHeading';
import { ADMIN_BADGE } from '@/features/admin/ui/status-badge';
import { getCustomerBonusSummary } from '@/features/bonuses';
import { listCustomerGiftCards } from '@/features/gift-cards';
import { listCouponsAssignedToUser } from '@/features/promotions';
import { getAdminUserById } from '@/features/users/application/queries';
import {
  getEligibleUserStatuses,
  isUserRole,
  isUserStatus,
} from '@/features/users/domain/user-lifecycle';
import { AdminUserLoyaltySections } from '@/features/users/ui/AdminUserLoyaltySections';
import { UpdateUserRoleForm } from '@/features/users/ui/UpdateUserRoleForm';
import { UpdateUserStatusForm } from '@/features/users/ui/UpdateUserStatusForm';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type AdminUserDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

function userStatusBadgeClass(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === 'ACTIVE') return 'bg-green-100 text-green-800';
  if (normalized === 'PENDING' || normalized === 'INVITED') {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (normalized === 'SUSPENDED' || normalized === 'BANNED' || normalized === 'ANONYMIZED') {
    return 'bg-red-100 text-red-800';
  }
  return 'bg-gray-100 text-gray-800';
}

function userRoleBadgeClass(role: string): string {
  return role.toUpperCase() === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
}

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const { locale, id } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const t = dictionary.admin;

  const detail = await getAdminUserById(id);
  if (!detail) {
    notFound();
  }

  const { user, recentOrders } = detail;
  const [bonuses, giftCards, coupons] = await Promise.all([
    getCustomerBonusSummary(user.id, { limit: 10 }),
    listCustomerGiftCards(user.id, user.email),
    listCouponsAssignedToUser(user.id),
  ]);

  const role = isUserRole(user.role) ? user.role : null;
  const status = isUserStatus(user.status) ? user.status : null;
  const eligibleStatuses = status ? getEligibleUserStatuses(status) : [];
  const isAnonymized = status === 'ANONYMIZED';
  const d = t.users.detail;

  return (
    <section>
      <div className="mb-6">
        <p className={`mb-1 ${ADMIN_PAGE_SUBTITLE}`}>
          <Link
            href={`/${locale}/admin/users`}
            className="font-medium text-gray-700 hover:underline"
          >
            {t.users.breadcrumb}
          </Link>
        </p>
        <AdminPageHeading title={`${user.firstName} ${user.lastName}`} description={user.email} />
      </div>

      <Card className="mb-6 p-6">
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <p className="text-gray-700">
            {d.role}{' '}
            <span className={`${ADMIN_BADGE} ${userRoleBadgeClass(user.role)}`}>{user.role}</span>
          </p>
          <p className="text-gray-700">
            {d.status}{' '}
            <span className={`${ADMIN_BADGE} ${userStatusBadgeClass(user.status)}`}>
              {user.status}
            </span>
          </p>
          <p className="text-gray-700">{d.phone.replace('{phone}', user.phone ?? t.common.none)}</p>
          <p className="text-gray-700">
            {d.emailVerified.replace(
              '{value}',
              user.emailVerifiedAt
                ? user.emailVerifiedAt.toISOString().slice(0, 10)
                : d.emailVerifiedNo,
            )}
          </p>
          <p className="text-gray-700">
            {d.lastLogin.replace(
              '{value}',
              user.lastLoginAt
                ? user.lastLoginAt.toISOString().slice(0, 16).replace('T', ' ')
                : d.lastLoginNever,
            )}
          </p>
          <p className="text-gray-700">
            {d.created.replace('{date}', user.createdAt.toISOString().slice(0, 10))}
          </p>
        </div>
      </Card>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {role ? (
          <UpdateUserRoleForm
            locale={locale}
            userId={user.id}
            currentRole={role}
            disabled={isAnonymized}
            copy={t}
          />
        ) : (
          <p className="text-sm text-red-700">{d.unknownRole}</p>
        )}
        {status ? (
          <UpdateUserStatusForm
            locale={locale}
            userId={user.id}
            currentStatus={status}
            eligibleStatuses={eligibleStatuses}
            copy={t}
          />
        ) : (
          <p className="text-sm text-red-700">{d.unknownStatus}</p>
        )}
      </div>

      <AdminUserLoyaltySections
        locale={locale}
        bonuses={bonuses}
        giftCards={giftCards}
        coupons={coupons}
        recentOrders={recentOrders}
        copy={{
          bonusesTitle: d.bonusesTitle,
          availableBalance: d.availableBalance,
          totalEarned: d.totalEarned,
          totalRedeemed: d.totalRedeemed,
          noBonusHistory: d.noBonusHistory,
          orderLabel: d.orderLabel,
          bonusTypes: d.bonusTypes,
          giftCardsTitle: d.giftCardsTitle,
          noGiftCards: d.noGiftCards,
          giftCardBalance: d.giftCardBalance,
          giftCardStatuses: d.giftCardStatuses,
          couponsTitle: d.couponsTitle,
          noCoupons: d.noCoupons,
          couponActive: d.couponActive,
          couponInactive: d.couponInactive,
          couponExpires: d.couponExpires,
          couponNoExpiry: d.couponNoExpiry,
          percentOff: d.percentOff,
          fixedAmount: d.fixedAmount,
          recentOrders: d.recentOrders,
          noOrders: d.noOrders,
        }}
      />
    </section>
  );
}
