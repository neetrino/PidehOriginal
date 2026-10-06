'use client';

import { AppLink } from '@/components/ui/AppLink';
import { CartMoneyFlow } from '@/features/cart/ui/CartMoneyFlow';
import type { Currency } from '@/lib/money/currency';

type CartDrawerTotalsProps = {
  currency: Currency;
  totalLabel: string;
  checkoutLabel: string;
  checkoutHref: string;
  totalAmount: number;
  earnPoints: number;
  earnLabel: string;
  hasItems: boolean;
  onCheckout: () => void;
};

export function CartDrawerTotals({
  currency,
  totalLabel,
  checkoutLabel,
  checkoutHref,
  totalAmount,
  earnPoints,
  earnLabel,
  hasItems,
  onCheckout,
}: CartDrawerTotalsProps) {
  return (
    <div className="border-t border-[#ff6b00]/15 bg-[#ffd54a] px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <dl className="text-sm">
        <div className="flex items-center justify-between text-base font-bold text-[#1e1e1e]">
          <dt>{totalLabel}</dt>
          <dd className="tabular-nums">
            <CartMoneyFlow amount={totalAmount} currency={currency} />
          </dd>
        </div>
        {earnPoints > 0 ? (
          <div className="mt-2 flex items-center justify-between font-semibold text-[#1a4d3a]">
            <dt>{earnLabel}</dt>
            <dd className="tabular-nums">+{earnPoints}</dd>
          </div>
        ) : null}
      </dl>
      {hasItems ? (
        <AppLink
          href={checkoutHref}
          prefetchPolicy="intent"
          className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#ff6b00] px-4 text-sm font-bold text-white transition hover:brightness-110"
          onClick={onCheckout}
        >
          {checkoutLabel}
        </AppLink>
      ) : null}
    </div>
  );
}
