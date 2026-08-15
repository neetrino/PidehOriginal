"use client";

import { AppLink } from "@/components/ui/AppLink";
import { CartMoneyFlow } from "@/features/cart/ui/CartMoneyFlow";
import type { Currency } from "@/lib/money/currency";
import type { Locale } from "@/lib/i18n/config";

type CartDrawerTotalsProps = {
  locale: Locale;
  currency: Currency;
  subtotalLabel: string;
  shippingLabel: string;
  totalLabel: string;
  checkoutLabel: string;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  hasItems: boolean;
  onCheckout: () => void;
};

export function CartDrawerTotals({
  locale,
  currency,
  subtotalLabel,
  shippingLabel,
  totalLabel,
  checkoutLabel,
  subtotalAmount,
  shippingAmount,
  totalAmount,
  hasItems,
  onCheckout,
}: CartDrawerTotalsProps) {
  return (
    <div className="border-t border-[#ff6b00]/15 bg-[#ffd54a] px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-[#1e1e1e]/70">
          <dt>{subtotalLabel}</dt>
          <dd className="tabular-nums font-medium text-[#1e1e1e]">
            <CartMoneyFlow amount={subtotalAmount} currency={currency} />
          </dd>
        </div>
        <div className="flex items-center justify-between text-[#1e1e1e]/70">
          <dt>{shippingLabel}</dt>
          <dd className="tabular-nums font-medium text-[#1e1e1e]">
            <CartMoneyFlow amount={shippingAmount} currency={currency} />
          </dd>
        </div>
        <div className="flex items-center justify-between pt-1 text-base font-bold text-[#1e1e1e]">
          <dt>{totalLabel}</dt>
          <dd className="tabular-nums">
            <CartMoneyFlow amount={totalAmount} currency={currency} />
          </dd>
        </div>
      </dl>
      {hasItems ? (
        <AppLink
          href={`/${locale}/checkout`}
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
