'use client';

import { Button } from '@/components/ui/Button';
import {
  CHECKOUT_APPLY_BTN,
  CHECKOUT_FIELD,
  CHECKOUT_INSET,
  CHECKOUT_PANEL,
  CHECKOUT_PRIMARY_BTN,
} from '@/features/checkout/ui/checkout-ui-classes';

type CheckoutOrderSummaryProps = {
  title: string;
  couponTitle: string;
  couponPlaceholder: string;
  couponApplyLabel: string;
  couponApplyingLabel: string;
  giftCardTitle: string;
  giftCardPlaceholder: string;
  giftCardApplyLabel: string;
  giftCardApplyingLabel: string;
  giftCardInitialLabel: string;
  giftCardUsedLabel: string;
  giftCardRemainingLabel: string;
  giftCardPayableLabel: string;
  giftCardAppliedLabel: string;
  discountLabel: string;
  subtotalLabel: string;
  shippingLabel: string;
  taxLabel: string;
  totalLabel: string;
  participantsPrepaidLabel?: string;
  participantsPrepaidFormatted?: string | null;
  subtotalFormatted: string;
  shippingFormatted: string;
  taxFormatted: string;
  discountFormatted: string | null;
  totalFormatted: string;
  couponDraft: string;
  onCouponDraftChange: (value: string) => void;
  onApplyCoupon: () => void;
  couponError: string | null;
  isApplyingCoupon: boolean;
  giftCardDraft: string;
  onGiftCardDraftChange: (value: string) => void;
  onApplyGiftCard: () => void;
  giftCardError: string | null;
  isApplyingGiftCard: boolean;
  giftCardPreview: {
    code: string;
    initialAmount: number;
    redeemAmount: number;
    remainingBalance: number;
    payableAfter: number;
  } | null;
  formatMoney: (amount: number) => string;
  error: string | null;
  isSubmitting: boolean;
  placeOrderLabel: string;
  processingLabel: string;
  bonus?: {
    enabled: boolean;
    availableBalance: number;
    maxRedeem: number;
    useBonuses: boolean;
    redeemAmount: number;
    onToggle: (enabled: boolean) => void;
    onAmountChange: (amount: number) => void;
    onUseMax: () => void;
    labels: {
      title: string;
      available: string;
      useBonuses: string;
      amount: string;
      useMax: string;
      applied: string;
    };
    formatMoney: (amount: number) => string;
  };
};

export function CheckoutOrderSummary({
  title,
  couponTitle,
  couponPlaceholder,
  couponApplyLabel,
  couponApplyingLabel,
  giftCardTitle,
  giftCardPlaceholder,
  giftCardApplyLabel,
  giftCardApplyingLabel,
  giftCardInitialLabel,
  giftCardUsedLabel,
  giftCardRemainingLabel,
  giftCardPayableLabel,
  giftCardAppliedLabel,
  discountLabel,
  subtotalLabel,
  shippingLabel,
  taxLabel,
  totalLabel,
  participantsPrepaidLabel,
  participantsPrepaidFormatted,
  subtotalFormatted,
  shippingFormatted,
  taxFormatted,
  discountFormatted,
  totalFormatted,
  couponDraft,
  onCouponDraftChange,
  onApplyCoupon,
  couponError,
  isApplyingCoupon,
  giftCardDraft,
  onGiftCardDraftChange,
  onApplyGiftCard,
  giftCardError,
  isApplyingGiftCard,
  giftCardPreview,
  formatMoney,
  error,
  isSubmitting,
  placeOrderLabel,
  processingLabel,
  bonus,
}: CheckoutOrderSummaryProps) {
  return (
    <div>
      <aside className={`${CHECKOUT_PANEL} sticky top-[5.75rem] md:top-28`}>
        <h2 className="font-display mb-5 text-2xl leading-none text-[#1e1e1e] uppercase">{title}</h2>

        <div className={`mb-6 ${CHECKOUT_INSET}`}>
          <p className="mb-3 font-display text-sm leading-none tracking-wide text-[#ff6b00] uppercase">
            {couponTitle}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              name="couponCodeDraft"
              value={couponDraft}
              onChange={(event) => onCouponDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  onApplyCoupon();
                }
              }}
              placeholder={couponPlaceholder}
              autoComplete="off"
              disabled={isSubmitting || isApplyingCoupon}
              className={`${CHECKOUT_FIELD} min-w-0 flex-1 !bg-white`}
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              className={CHECKOUT_APPLY_BTN}
              disabled={isSubmitting || isApplyingCoupon || !couponDraft.trim()}
              onClick={onApplyCoupon}
            >
              {isApplyingCoupon ? couponApplyingLabel : couponApplyLabel}
            </Button>
          </div>
          {couponError ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {couponError}
            </p>
          ) : null}
        </div>

        <div className={`mb-6 ${CHECKOUT_INSET}`}>
          <p className="mb-3 font-display text-sm leading-none tracking-wide text-[#ff6b00] uppercase">
            {giftCardTitle}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              name="giftCardCodeDraft"
              value={giftCardDraft}
              onChange={(event) => onGiftCardDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  onApplyGiftCard();
                }
              }}
              placeholder={giftCardPlaceholder}
              autoComplete="off"
              disabled={isSubmitting || isApplyingGiftCard}
              className={`${CHECKOUT_FIELD} min-w-0 flex-1 !bg-white`}
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              className={CHECKOUT_APPLY_BTN}
              disabled={isSubmitting || isApplyingGiftCard || !giftCardDraft.trim()}
              onClick={onApplyGiftCard}
            >
              {isApplyingGiftCard ? giftCardApplyingLabel : giftCardApplyLabel}
            </Button>
          </div>
          {giftCardError ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {giftCardError}
            </p>
          ) : null}
          {giftCardPreview ? (
            <dl className="mt-3 space-y-1.5 rounded-2xl bg-white px-3 py-2.5 text-xs text-[#1e1e1e]/70">
              <div className="flex justify-between gap-3">
                <dt>{giftCardInitialLabel}</dt>
                <dd className="font-bold text-[#1e1e1e]">{formatMoney(giftCardPreview.initialAmount)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>{giftCardUsedLabel}</dt>
                <dd className="font-bold text-[#ff6b00]">{formatMoney(giftCardPreview.redeemAmount)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>{giftCardRemainingLabel}</dt>
                <dd className="font-bold text-[#1e1e1e]">
                  {formatMoney(giftCardPreview.remainingBalance)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>{giftCardPayableLabel}</dt>
                <dd className="font-bold text-[#1e1e1e]">{formatMoney(giftCardPreview.payableAfter)}</dd>
              </div>
            </dl>
          ) : null}
        </div>

        {bonus?.enabled ? (
          <div className={`mb-6 ${CHECKOUT_INSET}`}>
            <p className="font-display text-sm leading-none tracking-wide text-[#ff6b00] uppercase">
              {bonus.labels.title}
            </p>
            <p className="mt-2 text-xs text-[#1e1e1e]/55">
              {bonus.labels.available.replace('{amount}', bonus.formatMoney(bonus.availableBalance))}
            </p>
            <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-[#1e1e1e]">
              <input
                type="checkbox"
                checked={bonus.useBonuses}
                disabled={isSubmitting || bonus.maxRedeem <= 0}
                onChange={(event) => bonus.onToggle(event.target.checked)}
                className="h-4 w-4 rounded border-[#ff6b00]/40 text-[#ff6b00] accent-[#ff6b00] focus:ring-[#ff6b00]"
              />
              {bonus.labels.useBonuses}
            </label>
            {bonus.useBonuses ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={bonus.maxRedeem}
                  step={1}
                  value={bonus.redeemAmount || ''}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    bonus.onAmountChange(Number.isFinite(next) ? Math.max(0, Math.floor(next)) : 0);
                  }}
                  disabled={isSubmitting}
                  aria-label={bonus.labels.amount}
                  className={`${CHECKOUT_FIELD} min-w-0 flex-1 !bg-white`}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className={CHECKOUT_APPLY_BTN}
                  disabled={isSubmitting || bonus.maxRedeem <= 0}
                  onClick={bonus.onUseMax}
                >
                  {bonus.labels.useMax}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mb-5 space-y-2.5 text-sm">
          <div className="flex items-baseline justify-between gap-3 text-[#1e1e1e]/70">
            <span>{subtotalLabel}</span>
            <span className="font-bold text-[#1e1e1e]">{subtotalFormatted}</span>
          </div>
          {discountFormatted ? (
            <div className="flex items-baseline justify-between gap-3 text-[#1e1e1e]/70">
              <span>{discountLabel}</span>
              <span className="text-[#ff6b00]">-{discountFormatted}</span>
            </div>
          ) : null}
          {bonus?.useBonuses && bonus.redeemAmount > 0 ? (
            <div className="flex items-baseline justify-between gap-3 text-[#1e1e1e]/70">
              <span>{bonus.labels.applied}</span>
              <span className="text-[#ff6b00]">-{bonus.formatMoney(bonus.redeemAmount)}</span>
            </div>
          ) : null}
          {giftCardPreview && giftCardPreview.redeemAmount > 0 ? (
            <div className="flex items-baseline justify-between gap-3 text-[#1e1e1e]/70">
              <span>{giftCardAppliedLabel}</span>
              <span className="text-[#ff6b00]">-{formatMoney(giftCardPreview.redeemAmount)}</span>
            </div>
          ) : null}
          <div className="flex items-baseline justify-between gap-3 text-[#1e1e1e]/70">
            <span className="shrink-0">{shippingLabel}</span>
            <span className="max-w-[62%] text-right text-xs leading-snug font-bold text-[#1e1e1e]">
              {shippingFormatted}
            </span>
          </div>
          {participantsPrepaidFormatted && participantsPrepaidLabel ? (
            <div className="flex items-baseline justify-between gap-3 text-[#1e1e1e]/70">
              <span>{participantsPrepaidLabel}</span>
              <span className="text-[#ff6b00]">-{participantsPrepaidFormatted}</span>
            </div>
          ) : null}
          <div className="flex items-baseline justify-between gap-3 text-[#1e1e1e]/70">
            <span>{taxLabel}</span>
            <span className="font-bold text-[#1e1e1e]">{taxFormatted}</span>
          </div>
          <div className="mt-1 flex items-end justify-between gap-3 rounded-[18px] bg-[#fff8e7] px-4 py-3">
            <span className="font-display text-xl leading-none text-[#1e1e1e] uppercase">
              {totalLabel}
            </span>
            <span className="font-display text-2xl leading-none text-[#ff6b00]">{totalFormatted}</span>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className={CHECKOUT_PRIMARY_BTN}
          disabled={isSubmitting}
        >
          {isSubmitting ? processingLabel : placeOrderLabel}
        </Button>
      </aside>
    </div>
  );
}
