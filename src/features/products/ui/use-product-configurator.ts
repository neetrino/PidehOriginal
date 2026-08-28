"use client";

import { useMemo, useState, useTransition } from "react";

import { addProductToActiveCart } from "@/features/group-orders/application/add-to-active";
import type { ProductModifierChoice } from "@/features/products/types";
import {
  formatPdpAmount,
  sharedPositivePrice,
} from "@/features/products/ui/format-pdp-price";
import type { Locale } from "@/lib/i18n/config";
import type { Currency } from "@/lib/money/currency";

type UseProductConfiguratorArgs = {
  locale: Locale;
  currency: Currency;
  fxRate: string;
  productId: string;
  stockOnHand: number;
  basePriceAmount: number;
  compareAtAmount: number | null;
  additions: ProductModifierChoice[];
  addedLabel: string;
  errorLabel: string;
};

export function useProductConfigurator({
  locale,
  currency,
  fxRate,
  productId,
  stockOnHand,
  basePriceAmount,
  compareAtAmount,
  additions,
  addedLabel,
  errorLabel,
}: UseProductConfiguratorArgs) {
  const maxQty = Math.max(stockOnHand, 0);
  const disabled = maxQty < 1;
  const [quantity, setQuantity] = useState(maxQty > 0 ? 1 : 0);
  const [additionIds, setAdditionIds] = useState<string[]>([]);
  const [exceptionIds, setExceptionIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const additionExtras = useMemo(() => {
    const byId = new Map(additions.map((row) => [row.id, row.priceAmount]));
    return additionIds.reduce((sum, id) => sum + (byId.get(id) ?? 0), 0);
  }, [additionIds, additions]);

  const formatAmount = (amount: number) =>
    formatPdpAmount(amount, fxRate, currency, locale);

  const extraHintPrice = sharedPositivePrice(
    additions.map((row) => row.priceAmount),
  );

  function clearStatus(): void {
    setMessage(null);
    setError(null);
  }

  function changeQuantity(next: number): void {
    if (disabled) return;
    setQuantity(Math.min(Math.max(1, next), maxQty));
    clearStatus();
  }

  function resetSelection(): void {
    if (disabled) return;
    setQuantity(1);
    setAdditionIds([]);
    setExceptionIds([]);
    clearStatus();
  }

  function handleAdd(): void {
    if (disabled || quantity < 1) return;
    clearStatus();
    startTransition(async () => {
      try {
        const result = await addProductToActiveCart(productId, quantity, {
          modifierIds: [...additionIds, ...exceptionIds],
        });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setMessage(addedLabel);
      } catch {
        setError(errorLabel);
      }
    });
  }

  const qty = Math.max(quantity, 1);
  const compareTotal =
    compareAtAmount == null
      ? null
      : (compareAtAmount + additionExtras) * qty;

  return {
    maxQty,
    disabled,
    quantity,
    additionIds,
    exceptionIds,
    message,
    error,
    pending,
    extraHintPrice,
    formatAmount,
    unitPriceFormatted: formatAmount(basePriceAmount),
    totalFormatted: formatAmount((basePriceAmount + additionExtras) * qty),
    compareAtTotalFormatted:
      compareTotal == null ? null : formatAmount(compareTotal),
    setAdditionIds,
    setExceptionIds,
    changeQuantity,
    resetSelection,
    handleAdd,
  };
}
