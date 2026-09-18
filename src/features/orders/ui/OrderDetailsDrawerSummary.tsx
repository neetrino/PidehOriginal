import type { ReactNode } from 'react';

import {
  ADMIN_BADGE,
  orderStatusBadgeClass,
  paymentStatusBadgeClass,
} from '@/features/admin/ui/status-badge';
import type { AdminOrderDetailView } from '@/features/orders/application/order-detail-view';
import {
  formatOrderDrawerMoney,
  formatOrderStatusLabel,
} from '@/features/orders/ui/order-drawer-format';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type OrderDetailsDrawerSummaryProps = {
  detail: AdminOrderDetailView;
  copy: Dictionary['admin'];
  variant?: 'full' | 'customer';
};

export function OrderDetailsDrawerSummary({
  detail,
  copy,
  variant = 'full',
}: OrderDetailsDrawerSummaryProps) {
  const d = copy.orders.drawer;
  const customer = (
    <section className={variant === 'customer' ? 'rounded-2xl border border-gray-200 px-5 py-4' : undefined}>
      <h3
        className={`mb-4 text-base font-semibold text-gray-900 ${
          variant === 'customer' ? 'uppercase tracking-wide' : ''
        }`}
      >
        {d.customer}
      </h3>
      <dl className="space-y-3 text-sm">
        <DetailRow label={d.name} value={detail.contactName} />
        <DetailRow label={d.phoneNumber} value={detail.contactPhone} />
        <DetailRow label={d.email} value={detail.contactEmail} />
      </dl>
    </section>
  );

  if (variant === 'customer') {
    return customer;
  }

  return (
    <div className="rounded-2xl border border-gray-200 px-5 py-4">
      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h3 className="mb-4 text-base font-semibold text-gray-900">{d.summary}</h3>
          <dl className="space-y-3 text-sm">
            <DetailRow label={d.orderNumber} value={detail.orderNumber} />
            <DetailRow
              label={d.total}
              value={formatOrderDrawerMoney(detail.totalAmount, detail.baseCurrency)}
            />
            <DetailRow
              label={d.status}
              value={
                <span className={`${ADMIN_BADGE} ${orderStatusBadgeClass(detail.status)}`}>
                  {formatOrderStatusLabel(detail.status)}
                </span>
              }
            />
            <DetailRow
              label={d.payment}
              value={
                <span className={`${ADMIN_BADGE} ${paymentStatusBadgeClass(detail.paymentStatus)}`}>
                  {formatOrderStatusLabel(detail.paymentStatus)}
                </span>
              }
            />
          </dl>
        </section>
        {customer}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  );
}
