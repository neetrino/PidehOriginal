'use client';

import { formatYerevanDateTime } from '@/features/delivery/domain/delivery-schedule';
import type { AdminUnseenOrderAlert } from '@/features/orders/application/queries';
import { adminPaymentMethodLabel } from '@/features/orders/domain/payment-method-label';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import type { Currency } from '@/lib/money/currency';
import { formatMoneyAmount } from '@/lib/money/format';

type AlertCopy = Dictionary['admin']['orders']['newOrderAlert'];

type AlertDetailRowProps = {
  label: string;
  value: string;
  valueStrong?: boolean;
};

function AlertDetailRow({ label, value, valueStrong = false }: AlertDetailRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#e8edf2] py-3.5 last:border-b-0">
      <span className="text-[15px] text-[#8b95a1]">{label}</span>
      <span
        className={`text-right text-[15px] text-[#1e1e1e] ${
          valueStrong ? 'font-bold' : 'font-medium'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

type NewOrderAlertPopupProps = {
  locale: string;
  copy: AlertCopy;
  order: AdminUnseenOrderAlert;
  waitingCount: number;
  onHeard: () => void;
};

/**
 * Centered new-order alert matching the admin kitchen mockup (brand orange accents).
 */
export function NewOrderAlertPopup({
  locale,
  copy,
  order,
  waitingCount,
  onHeard,
}: NewOrderAlertPopupProps) {
  const waiting = String(waitingCount);
  const header = copy.header.replace('{count}', waiting);
  const title = copy.orderTitle.replace('{orderNumber}', order.orderNumber);
  const heard = copy.heard.replace('{count}', waiting);

  return (
    <div
      className="fixed inset-0 z-[320] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="admin-new-order-title"
      aria-describedby="admin-new-order-desc"
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <div className="relative z-[1] w-full max-w-[420px] rounded-[28px] bg-white px-7 pt-7 pb-6 shadow-[0_24px_64px_rgba(30,30,30,0.22)]">
        <p className="text-[13px] font-bold tracking-[0.04em] text-[#ff6b00] uppercase">
          {header}
        </p>
        <h2
          id="admin-new-order-title"
          className="mt-2 text-[28px] leading-tight font-extrabold text-[#1e1e1e]"
        >
          {title}
        </h2>

        <div id="admin-new-order-desc" className="mt-5">
          <AlertDetailRow label={copy.customer} value={order.contactName} />
          <AlertDetailRow
            label={copy.total}
            value={formatMoneyAmount(order.totalAmount, order.baseCurrency as Currency, locale)}
            valueStrong
          />
          <AlertDetailRow
            label={copy.payment}
            value={adminPaymentMethodLabel(order.paymentMethod, copy.paymentMethods)}
          />
          <AlertDetailRow label={copy.placed} value={formatYerevanDateTime(order.placedAt)} />
        </div>

        <button
          type="button"
          onClick={onHeard}
          className="mt-6 inline-flex h-14 w-full cursor-pointer items-center justify-center rounded-2xl border-[3px] border-[#ff6b00] bg-[#ff6b00] px-5 text-[15px] font-extrabold text-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.35)] transition-colors hover:border-[#e85f00] hover:bg-[#e85f00]"
        >
          {heard}
        </button>
      </div>
    </div>
  );
}
