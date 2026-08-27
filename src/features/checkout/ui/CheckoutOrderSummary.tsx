"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
      <Card className="sticky top-4 rounded-2xl border border-gray-200/80 p-6 shadow-none">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">{title}</h2>

        <div className="mb-6 rounded-xl border border-gray-200 p-4">
          <p className="mb-3 text-sm text-gray-700">{couponTitle}</p>
          <div className="flex gap-2">
            <input
              type="text"
              name="couponCodeDraft"
              value={couponDraft}
              onChange={(event) => onCouponDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onApplyCoupon();
                }
              }}
              placeholder={couponPlaceholder}
              autoComplete="off"
              disabled={isSubmitting || isApplyingCoupon}
              className="h-11 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="h-11 shrink-0 rounded-lg px-4 text-sm"
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

        <div className="mb-6 rounded-xl border border-gray-200 p-4">
          <p className="mb-3 text-sm text-gray-700">{giftCardTitle}</p>
          <div className="flex gap-2">
            <input
              type="text"
              name="giftCardCodeDraft"
              value={giftCardDraft}
              onChange={(event) => onGiftCardDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onApplyGiftCard();
                }
              }}
              placeholder={giftCardPlaceholder}
              autoComplete="off"
              disabled={isSubmitting || isApplyingGiftCard}
              className="h-11 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="h-11 shrink-0 rounded-lg px-4 text-sm"
              disabled={
                isSubmitting || isApplyingGiftCard || !giftCardDraft.trim()
              }
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
            <dl className="mt-3 space-y-1 text-xs text-gray-600">
              <div className="flex justify-between gap-3">
                <dt>{giftCardInitialLabel}</dt>
                <dd>{formatMoney(giftCardPreview.initialAmount)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>{giftCardUsedLabel}</dt>
                <dd>{formatMoney(giftCardPreview.redeemAmount)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>{giftCardRemainingLabel}</dt>
                <dd>{formatMoney(giftCardPreview.remainingBalance)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>{giftCardPayableLabel}</dt>
                <dd>{formatMoney(giftCardPreview.payableAfter)}</dd>
              </div>
            </dl>
          ) : null}
        </div>

        {bonus?.enabled ? (
          <div className="mb-6 rounded-xl border border-gray-200 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {bonus.labels.title}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {bonus.labels.available.replace(
                    "{amount}",
                    bonus.formatMoney(bonus.availableBalance),
                  )}
                </p>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={bonus.useBonuses}
                  disabled={isSubmitting || bonus.maxRedeem <= 0}
                  onChange={(event) => bonus.onToggle(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
                />
                {bonus.labels.useBonuses}
              </label>
            </div>
            {bonus.useBonuses ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={bonus.maxRedeem}
                  step={1}
                  value={bonus.redeemAmount || ""}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    bonus.onAmountChange(
                      Number.isFinite(next) ? Math.max(0, Math.floor(next)) : 0,
                    );
                  }}
                  disabled={isSubmitting}
                  aria-label={bonus.labels.amount}
                  className="h-11 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="h-11 shrink-0 rounded-lg px-3 text-sm"
                  disabled={isSubmitting || bonus.maxRedeem <= 0}
                  onClick={bonus.onUseMax}
                >
                  {bonus.labels.useMax}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mb-6 space-y-4">
          <div className="flex justify-between text-gray-600">
            <span>{subtotalLabel}</span>
            <span>{subtotalFormatted}</span>
          </div>
          {discountFormatted ? (
            <div className="flex justify-between text-gray-600">
              <span>{discountLabel}</span>
              <span className="text-emerald-700">-{discountFormatted}</span>
            </div>
          ) : null}
          {bonus?.useBonuses && bonus.redeemAmount > 0 ? (
            <div className="flex justify-between text-gray-600">
              <span>{bonus.labels.applied}</span>
              <span className="text-emerald-700">
                -{bonus.formatMoney(bonus.redeemAmount)}
              </span>
            </div>
          ) : null}
          {giftCardPreview && giftCardPreview.redeemAmount > 0 ? (
            <div className="flex justify-between text-gray-600">
              <span>{giftCardAppliedLabel}</span>
              <span className="text-emerald-700">
                -{formatMoney(giftCardPreview.redeemAmount)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between text-gray-600">
            <span>{shippingLabel}</span>
            <span className="text-right">{shippingFormatted}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>{taxLabel}</span>
            <span>{taxFormatted}</span>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>{totalLabel}</span>
              <span>{totalFormatted}</span>
            </div>
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
          className="h-12 w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? processingLabel : placeOrderLabel}
        </Button>
      </Card>
    </div>
  );
}
