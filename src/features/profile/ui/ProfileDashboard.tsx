'use client';

import { AppLink } from '@/components/ui/AppLink';
import { fadeUp } from '@/components/motion/presets';
import { StaggerGroup, StaggerItem } from '@/components/motion/StaggerGroup';
import { formatYerevanDateTime } from '@/features/delivery/domain/delivery-schedule';
import { orderDrawerStatusLabel } from '@/features/orders/ui/order-drawer-format';
import { ProfilePageHeading } from '@/features/profile/ui/ProfilePageHeading';
import { ProfileStatCard } from '@/features/profile/ui/ProfileStatCard';
import { PROFILE_LIST_CARD, PROFILE_PANEL } from '@/features/profile/ui/profile-ui-classes';
import type { ProfileRecentOrder } from '@/features/profile/application/dashboard-queries';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/config';
import { formatMoneyAmount } from '@/lib/money/format';

type ProfileDashboardProps = {
  locale: Locale;
  firstName: string;
  dictionary: Dictionary['profile'];
  statusLabels: Dictionary['admin']['orders']['statusLabels'];
  stats: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalSpent: number;
  };
  recentOrders: readonly ProfileRecentOrder[];
};

export function ProfileDashboard({
  locale,
  firstName,
  dictionary,
  statusLabels,
  stats,
  recentOrders,
}: ProfileDashboardProps) {
  return (
    <section className="profile-sheet-keep-frame space-y-8">
      <ProfilePageHeading
        eyebrow={dictionary.loyaltyEyebrow}
        title={dictionary.dashboard}
        description={`${dictionary.welcome}, ${firstName}.`}
      />

      <StaggerGroup className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StaggerItem variants={fadeUp}>
          <ProfileStatCard label={dictionary.totalOrders} value={stats.totalOrders} />
        </StaggerItem>
        <StaggerItem variants={fadeUp}>
          <ProfileStatCard label={dictionary.pendingOrders} value={stats.pendingOrders} />
        </StaggerItem>
        <StaggerItem variants={fadeUp}>
          <ProfileStatCard label={dictionary.completedOrders} value={stats.completedOrders} />
        </StaggerItem>
        <StaggerItem variants={fadeUp}>
          <ProfileStatCard label={dictionary.totalSpent} value={stats.totalSpent} suffix=" AMD" />
        </StaggerItem>
      </StaggerGroup>

      <div className={`${PROFILE_PANEL} p-5 sm:p-7`}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#1e1e1e]">{dictionary.recentOrders}</h2>
          <AppLink
            href={`/${locale}/profile/orders`}
            prefetchPolicy="intent"
            className="text-sm font-bold text-[#ff6b00] underline-offset-2 hover:underline"
          >
            {dictionary.viewAllOrders}
          </AppLink>
        </div>

        {recentOrders.length === 0 ? (
          <p className="rounded-2xl bg-[#fff8e7] px-4 py-6 text-sm text-[#1e1e1e]/65">
            {dictionary.noOrders}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <RecentOrderCard
                  locale={locale}
                  order={order}
                  orderNumberLabel={dictionary.orderNumber}
                  statusLabel={orderDrawerStatusLabel(order.status, statusLabels)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function RecentOrderCard({
  locale,
  order,
  orderNumberLabel,
  statusLabel,
}: {
  locale: Locale;
  order: ProfileRecentOrder;
  orderNumberLabel: string;
  statusLabel: string;
}) {
  return (
    <AppLink
      href={`/${locale}/profile/orders?order=${encodeURIComponent(order.orderNumber)}`}
      prefetchPolicy="intent"
      className={`${PROFILE_LIST_CARD} flex items-center justify-between gap-3 transition hover:bg-[#fff8e7]`}
    >
      <span className="min-w-0">
        <span className="block font-bold text-[#1e1e1e]">
          {orderNumberLabel} {order.orderNumber}
        </span>
        <span className="mt-1 block text-sm text-[#1e1e1e]/55">
          {formatYerevanDateTime(order.placedAt)}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="rounded-full bg-[#fff8e7] px-2.5 py-1 text-xs font-bold text-[#ff6b00]">
          {statusLabel}
        </span>
        <span className="text-sm font-bold text-[#1e1e1e]">
          {formatMoneyAmount(order.totalAmount, 'AMD', locale)}
        </span>
      </span>
    </AppLink>
  );
}
