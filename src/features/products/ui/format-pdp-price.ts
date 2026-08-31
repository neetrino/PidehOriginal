import type { Locale } from "@/lib/i18n/config";
import { convertAmount } from "@/lib/money/convert";
import { defaultCurrency, type Currency } from "@/lib/money/currency";
import { formatMoneyAmount } from "@/lib/money/format";

/** Formats a catalog AMD amount into the shopper's display currency. */
export function formatPdpAmount(
  baseAmountAmd: number,
  rate: string,
  currency: Currency,
  locale: Locale,
): string {
  const converted = convertAmount(
    baseAmountAmd,
    rate,
    defaultCurrency,
    currency,
  );
  return formatMoneyAmount(converted.amount, currency, locale);
}

export function sharedPositivePrice(
  amounts: readonly number[],
): number | null {
  const first = amounts[0];
  if (first === undefined || first <= 0) {
    return null;
  }
  return amounts.every((amount) => amount === first) ? first : null;
}
