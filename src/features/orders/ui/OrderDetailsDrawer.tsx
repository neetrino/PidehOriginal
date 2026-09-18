'use client';

import { SideSheet } from '@/components/ui/SideSheet';
import {
  ADMIN_BADGE,
  orderStatusBadgeClass,
  paymentStatusBadgeClass,
} from '@/features/admin/ui/status-badge';
import type { AdminOrderDetailView } from '@/features/orders/application/order-detail-view';
import { OrderDetailsDrawerItems } from '@/features/orders/ui/OrderDetailsDrawerItems';
import { OrderDetailsDrawerParticipants } from '@/features/orders/ui/OrderDetailsDrawerParticipants';
import { OrderDetailsDrawerShipping } from '@/features/orders/ui/OrderDetailsDrawerShipping';
import { OrderDetailsDrawerSummary } from '@/features/orders/ui/OrderDetailsDrawerSummary';
import { OrderDetailsDrawerTotals } from '@/features/orders/ui/OrderDetailsDrawerTotals';
import { orderDrawerStatusLabel } from '@/features/orders/ui/order-drawer-format';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type OrderDetailsDrawerProps = {
  open: boolean;
  onClose: () => void;
  detail: AdminOrderDetailView | null;
  error: string | null;
  isLoading: boolean;
  copy: Dictionary['admin'];
};

export function OrderDetailsDrawer({
  open,
  onClose,
  detail,
  error,
  isLoading,
  copy,
}: OrderDetailsDrawerProps) {
  const isGroup = detail?.participants != null && detail.participants.length > 0;
  const labels = copy.orders.statusLabels;

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      ariaLabel={copy.orders.drawer.ariaLabel}
      variant="admin"
      zIndexClassName="z-[200]"
    >
      <div
        className={
          isGroup
            ? 'shrink-0 px-5 py-4 sm:px-6'
            : 'shrink-0 border-b-2 border-[#1e1e1e]/10 px-5 py-4 sm:px-6'
        }
      >
        <h2 className="font-display text-2xl leading-[0.95] text-[#1e1e1e] uppercase sm:text-3xl">
          {copy.orders.drawer.title}
        </h2>
        {detail && isGroup ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">#{detail.orderNumber}</span>
            <span className="inline-flex rounded-full bg-[#1a4d3a] px-2.5 py-0.5 text-xs font-bold text-white">
              {copy.orders.kindSwitcher.group}
            </span>
            <span className={`${ADMIN_BADGE} ${orderStatusBadgeClass(detail.status)}`}>
              {orderDrawerStatusLabel(detail.status, labels)}
            </span>
            <span className={`${ADMIN_BADGE} ${paymentStatusBadgeClass(detail.paymentStatus)}`}>
              {orderDrawerStatusLabel(detail.paymentStatus, labels)}
            </span>
          </div>
        ) : null}
        {detail && !isGroup ? (
          <p className="mt-1 text-sm text-gray-500">#{detail.orderNumber}</p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
        {isLoading ? (
          <p className="py-4 text-sm text-gray-600">{copy.orders.drawer.loading}</p>
        ) : null}
        {error ? <p className="py-4 text-sm text-red-700">{error}</p> : null}
        {!isLoading && !error && detail ? (
          <>
            <OrderDetailsDrawerSummary detail={detail} copy={copy} variant={isGroup ? 'customer' : 'full'} />
            <OrderDetailsDrawerShipping
              detail={detail}
              copy={copy}
              variant={isGroup ? 'address' : 'full'}
            />
            {isGroup && detail.participants ? (
              <OrderDetailsDrawerParticipants
                detail={detail}
                participants={detail.participants}
                copy={copy}
              />
            ) : (
              <OrderDetailsDrawerItems detail={detail} copy={copy} />
            )}
            <OrderDetailsDrawerTotals
              detail={detail}
              copy={copy}
              variant={isGroup ? 'group' : 'full'}
            />
          </>
        ) : null}
      </div>
    </SideSheet>
  );
}
