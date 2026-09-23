'use client';

import { ClipboardList } from 'lucide-react';

import {
  ADMIN_BADGE,
  orderStatusBadgeClass,
  paymentStatusBadgeClass,
} from '@/features/admin/ui/status-badge';
import {
  AdminOrderDetailsDrawerBind,
  useAdminOrderDetailsDrawer,
} from '@/features/orders/ui/useAdminOrderDetailsDrawer';
import {
  AdminUserLoyaltySectionShell,
  formatLoyaltyDateTime,
  toLoyaltyCurrency,
} from '@/features/users/ui/admin-user-loyalty-shared';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { formatMoneyAmount } from '@/lib/money/format';

type RecentOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  baseCurrency: string;
  placedAt: Date | string;
};

type AdminUserRecentOrdersProps = {
  locale: Locale;
  orders: RecentOrder[];
  title: string;
  emptyLabel: string;
  copy: Dictionary['admin'];
};

function RecentOrderRow({
  order,
  locale,
  onOpen,
}: {
  order: RecentOrder;
  locale: Locale;
  onOpen: (orderNumber: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(order.orderNumber)}
        className="block w-full rounded-[18px] border border-[#1e1e1e]/10 p-3 text-left transition-colors hover:bg-[#fff8e7]/60"
      >
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-sm text-[#1e1e1e]">{order.orderNumber}</strong>
          <span className={`${ADMIN_BADGE} ${orderStatusBadgeClass(order.status)}`}>
            {order.status}
          </span>
          <span className={`${ADMIN_BADGE} ${paymentStatusBadgeClass(order.paymentStatus)}`}>
            {order.paymentStatus}
          </span>
        </div>
        <p className="mt-1 text-sm text-[#1e1e1e]/65">
          {formatMoneyAmount(order.totalAmount, toLoyaltyCurrency(order.baseCurrency), locale)}
          {' · '}
          {formatLoyaltyDateTime(order.placedAt, locale)}
        </p>
      </button>
    </li>
  );
}

export function AdminUserRecentOrders({
  locale,
  orders,
  title,
  emptyLabel,
  copy,
}: AdminUserRecentOrdersProps) {
  const drawer = useAdminOrderDetailsDrawer(locale);

  return (
    <>
      <AdminUserLoyaltySectionShell title={title} icon={ClipboardList}>
        {orders.length === 0 ? (
          <p className="text-sm text-[#1e1e1e]/50">{emptyLabel}</p>
        ) : (
          <ul className="space-y-2">
            {orders.map((order) => (
              <RecentOrderRow
                key={order.id}
                order={order}
                locale={locale}
                onOpen={drawer.openOrder}
              />
            ))}
          </ul>
        )}
      </AdminUserLoyaltySectionShell>
      <AdminOrderDetailsDrawerBind state={drawer} copy={copy} />
    </>
  );
}
