'use client';

import { SideSheet } from '@/components/ui/SideSheet';
import { ADMIN_BADGE } from '@/features/admin/ui/status-badge';
import type { AdminUserDrawerDetail } from '@/features/users/application/get-admin-user-detail';
import {
  getEligibleUserStatuses,
  isUserStatus,
} from '@/features/users/domain/user-lifecycle';
import { AdminUserLoyaltySections } from '@/features/users/ui/AdminUserLoyaltySections';
import { AdminUserOrderNotes } from '@/features/users/ui/AdminUserOrderNotes';
import { UpdateUserAdminCommentForm } from '@/features/users/ui/UpdateUserAdminCommentForm';
import { UserStatusControl } from '@/features/users/ui/UserStatusControl';
import { isLocale, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type AdminUserDetailsDrawerProps = {
  open: boolean;
  onClose: () => void;
  locale: string;
  detail: AdminUserDrawerDetail | null;
  error: string | null;
  isLoading: boolean;
  copy: Dictionary['admin'];
};

function userRoleBadgeClass(role: string): string {
  return role.toUpperCase() === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
}

function formatOptionalDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function formatOptionalDateTime(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 16).replace('T', ' ');
}

export function AdminUserDetailsDrawer({
  open,
  onClose,
  locale,
  detail,
  error,
  isLoading,
  copy,
}: AdminUserDetailsDrawerProps) {
  const language: Locale = isLocale(locale) ? locale : 'hy';
  const d = copy.users.detail;
  const user = detail?.user ?? null;
  const status = user && isUserStatus(user.status) ? user.status : null;
  const eligibleStatuses = status ? getEligibleUserStatuses(status) : [];
  const isAnonymized = status === 'ANONYMIZED';
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : '';

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      ariaLabel={copy.users.drawer.ariaLabel}
      variant="admin"
    >
      <div className="shrink-0 border-b-2 border-[#1e1e1e]/10 px-5 py-4 sm:px-6">
        <h2 className="font-display text-2xl leading-[0.95] text-[#1e1e1e] uppercase sm:text-3xl">
          {copy.users.drawer.title}
        </h2>
        {user ? <p className="mt-1 text-sm text-gray-500">{displayName}</p> : null}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
        {isLoading ? (
          <p className="py-4 text-sm text-gray-600">{copy.users.drawer.loading}</p>
        ) : null}
        {error ? <p className="py-4 text-sm text-red-700">{error}</p> : null}
        {!isLoading && !error && detail && user ? (
          <>
            <div className="rounded-2xl border border-gray-100 p-4">
              <div className="grid gap-3 text-sm md:grid-cols-2">
                <p className="text-gray-700">
                  {d.role}{' '}
                  <span className={`${ADMIN_BADGE} ${userRoleBadgeClass(user.role)}`}>
                    {user.role}
                  </span>
                </p>
                <p className="flex flex-wrap items-center gap-2 text-gray-700">
                  {d.status}{' '}
                  {status ? (
                    <UserStatusControl
                      locale={locale}
                      userId={user.id}
                      currentStatus={status}
                      eligibleStatuses={eligibleStatuses}
                      ariaLabel={copy.users.statusForm.newStatusAria}
                    />
                  ) : (
                    <span className="text-sm text-red-700">{d.unknownStatus}</span>
                  )}
                </p>
                <p className="text-gray-700">
                  {d.phone.replace('{phone}', user.phone ?? copy.common.none)}
                </p>
                <p className="text-gray-700">
                  {d.emailVerified.replace(
                    '{value}',
                    formatOptionalDate(user.emailVerifiedAt) ?? d.emailVerifiedNo,
                  )}
                </p>
                <p className="text-gray-700">
                  {d.lastLogin.replace(
                    '{value}',
                    formatOptionalDateTime(user.lastLoginAt) ?? d.lastLoginNever,
                  )}
                </p>
                <p className="text-gray-700">
                  {d.created.replace(
                    '{date}',
                    formatOptionalDate(user.createdAt) ?? copy.common.none,
                  )}
                </p>
                <p className="text-gray-700 md:col-span-2">{user.email}</p>
              </div>
            </div>

            <UpdateUserAdminCommentForm
              locale={locale}
              userId={user.id}
              initialComment={user.adminComment}
              disabled={isAnonymized}
              copy={copy}
            />

            <AdminUserOrderNotes
              key={user.id}
              locale={language}
              notes={detail.orderNotes}
              copy={copy}
            />

            <AdminUserLoyaltySections
              locale={language}
              bonuses={detail.bonuses}
              giftCards={detail.giftCards}
              coupons={detail.coupons}
              recentOrders={detail.recentOrders}
              adminCopy={copy}
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
          </>
        ) : null}
      </div>
    </SideSheet>
  );
}
