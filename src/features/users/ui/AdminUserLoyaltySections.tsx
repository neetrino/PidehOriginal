import Link from 'next/link';
import { ClipboardList, Coins, Gift, TicketPercent } from 'lucide-react';

import {
  ADMIN_BADGE,
  orderStatusBadgeClass,
  paymentStatusBadgeClass,
} from '@/features/admin/ui/status-badge';
import type { BonusTransactionView, CustomerBonusSummary } from '@/features/bonuses';
import type { CustomerGiftCardListItem } from '@/features/gift-cards';
import type { UserAssignedCoupon } from '@/features/promotions';
import {
  AdminUserLoyaltySectionShell,
  formatLoyaltyDateTime,
  toLoyaltyCurrency,
} from '@/features/users/ui/admin-user-loyalty-shared';
import type { Locale } from '@/lib/i18n/config';
import { formatMoneyAmount } from '@/lib/money/format';

type LoyaltyCopy = {
  bonusesTitle: string;
  availableBalance: string;
  totalEarned: string;
  totalRedeemed: string;
  noBonusHistory: string;
  orderLabel: string;
  bonusTypes: Record<string, string>;
  giftCardsTitle: string;
  noGiftCards: string;
  giftCardBalance: string;
  giftCardStatuses: Record<string, string>;
  couponsTitle: string;
  noCoupons: string;
  couponActive: string;
  couponInactive: string;
  couponExpires: string;
  couponNoExpiry: string;
  percentOff: string;
  fixedAmount: string;
  recentOrders: string;
  noOrders: string;
};

type RecentOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  baseCurrency: string;
  placedAt: Date | string;
};

type AdminUserLoyaltySectionsProps = {
  locale: Locale;
  bonuses: CustomerBonusSummary;
  giftCards: CustomerGiftCardListItem[];
  coupons: UserAssignedCoupon[];
  recentOrders: RecentOrder[];
  copy: LoyaltyCopy;
};

function formatCouponValue(coupon: UserAssignedCoupon, copy: LoyaltyCopy, locale: Locale): string {
  if (coupon.discountType === 'PERCENTAGE') {
    return copy.percentOff.replace('{value}', String(coupon.discountValue));
  }
  return copy.fixedAmount.replace(
    '{value}',
    formatMoneyAmount(coupon.discountValue, 'AMD', locale),
  );
}

function BonusTransactionRow({
  row,
  locale,
  copy,
}: {
  row: BonusTransactionView;
  locale: Locale;
  copy: LoyaltyCopy;
}) {
  const positive = row.delta > 0;
  const typeLabel = copy.bonusTypes[row.type] ?? row.type;

  return (
    <li className="flex flex-col gap-2 rounded-[18px] border border-[#1e1e1e]/10 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-[#1e1e1e]">{typeLabel}</p>
        <p
          className={`mt-0.5 text-base font-bold ${positive ? 'text-[#ff6b00]' : 'text-[#1e1e1e]'}`}
        >
          {positive ? '+' : ''}
          {formatMoneyAmount(row.delta, 'AMD', locale)}
        </p>
      </div>
      <div className="text-left text-xs text-[#1e1e1e]/55 sm:text-right">
        {row.orderNumber ? (
          <p>
            {copy.orderLabel} {row.orderNumber}
          </p>
        ) : null}
        <p>{formatLoyaltyDateTime(row.createdAt, locale)}</p>
      </div>
    </li>
  );
}

export function AdminUserLoyaltySections({
  locale,
  bonuses,
  giftCards,
  coupons,
  recentOrders,
  copy,
}: AdminUserLoyaltySectionsProps) {
  const stats = [
    { label: copy.availableBalance, value: bonuses.availableBalance },
    { label: copy.totalEarned, value: bonuses.totalEarned },
    { label: copy.totalRedeemed, value: bonuses.totalRedeemed },
  ] as const;

  return (
    <div className="space-y-4">
      <AdminUserLoyaltySectionShell title={copy.bonusesTitle} icon={Coins}>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[18px] bg-[#fff8e7] px-4 py-3">
              <p className="text-[11px] font-bold tracking-[0.12em] text-[#1e1e1e]/55 uppercase">
                {stat.label}
              </p>
              <p className="mt-1 text-xl font-bold text-[#1e1e1e]">
                {formatMoneyAmount(stat.value, 'AMD', locale)}
              </p>
            </div>
          ))}
        </div>
        {bonuses.transactions.length === 0 ? (
          <p className="text-sm text-[#1e1e1e]/50">{copy.noBonusHistory}</p>
        ) : (
          <ul className="space-y-2">
            {bonuses.transactions.map((row) => (
              <BonusTransactionRow key={row.id} row={row} locale={locale} copy={copy} />
            ))}
          </ul>
        )}
      </AdminUserLoyaltySectionShell>

      <AdminUserLoyaltySectionShell title={copy.giftCardsTitle} icon={Gift}>
        {giftCards.length === 0 ? (
          <p className="text-sm text-[#1e1e1e]/50">{copy.noGiftCards}</p>
        ) : (
          <ul className="space-y-2">
            {giftCards.map((card) => (
              <li key={card.id}>
                <Link
                  href={`/${locale}/admin/gift-cards/${card.id}`}
                  className="flex flex-col gap-2 rounded-[18px] border border-[#1e1e1e]/10 px-4 py-3 transition hover:bg-[#fff8e7]/60 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-[#1e1e1e]">{card.code}</p>
                    <p className="mt-0.5 text-xs text-[#1e1e1e]/55">
                      {copy.giftCardBalance}: {formatMoneyAmount(card.balanceAmount, 'AMD', locale)}
                    </p>
                  </div>
                  <span className={`${ADMIN_BADGE} bg-[#ffd54a]/50 text-[#1e1e1e]`}>
                    {copy.giftCardStatuses[card.status] ?? card.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AdminUserLoyaltySectionShell>

      <AdminUserLoyaltySectionShell title={copy.couponsTitle} icon={TicketPercent}>
        {coupons.length === 0 ? (
          <p className="text-sm text-[#1e1e1e]/50">{copy.noCoupons}</p>
        ) : (
          <ul className="space-y-2">
            {coupons.map((coupon) => (
              <li
                key={coupon.id}
                className="flex flex-col gap-2 rounded-[18px] border border-[#1e1e1e]/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-[#1e1e1e]">{coupon.code}</p>
                  <p className="mt-0.5 text-xs text-[#1e1e1e]/55">
                    {formatCouponValue(coupon, copy, locale)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#1e1e1e]/55 sm:justify-end">
                  <span
                    className={`${ADMIN_BADGE} ${
                      coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {coupon.isActive ? copy.couponActive : copy.couponInactive}
                  </span>
                  <span>
                    {coupon.endsAt
                      ? copy.couponExpires.replace(
                          '{date}',
                          (coupon.endsAt instanceof Date ? coupon.endsAt : new Date(coupon.endsAt))
                            .toISOString()
                            .slice(0, 10),
                        )
                      : copy.couponNoExpiry}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminUserLoyaltySectionShell>

      <AdminUserLoyaltySectionShell title={copy.recentOrders} icon={ClipboardList}>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-[#1e1e1e]/50">{copy.noOrders}</p>
        ) : (
          <ul className="space-y-2">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/${locale}/admin/orders/${order.orderNumber}`}
                  className="block rounded-[18px] border border-[#1e1e1e]/10 p-3 transition-colors hover:bg-[#fff8e7]/60"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm text-[#1e1e1e]">{order.orderNumber}</strong>
                    <span className={`${ADMIN_BADGE} ${orderStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                    <span
                      className={`${ADMIN_BADGE} ${paymentStatusBadgeClass(order.paymentStatus)}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#1e1e1e]/65">
                    {formatMoneyAmount(
                      order.totalAmount,
                      toLoyaltyCurrency(order.baseCurrency),
                      locale,
                    )}
                    {' · '}
                    {formatLoyaltyDateTime(order.placedAt, locale)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AdminUserLoyaltySectionShell>
    </div>
  );
}
