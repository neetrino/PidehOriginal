import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatMoneyAmount } from "@/lib/money/format";

type SpendLimitErrorLike = {
  ok: false;
  code?: "SPEND_LIMIT_EXCEEDED";
  limitAmount?: number;
};

/** True when a group-order mutation failed because the per-person spend cap was hit. */
export function isSpendLimitExceededError(
  result: SpendLimitErrorLike,
): result is SpendLimitErrorLike & {
  code: "SPEND_LIMIT_EXCEEDED";
  limitAmount: number;
} {
  return (
    result.code === "SPEND_LIMIT_EXCEEDED" &&
    typeof result.limitAmount === "number"
  );
}

/** Browser alert when adding/updating items would exceed the group-order spend limit. */
export function alertSpendLimitExceeded(
  locale: Locale,
  limitAmount: number,
): void {
  if (typeof window === "undefined") return;
  const template = getDictionary(locale).groupOrder.spendLimitExceededAlert;
  const amount = formatMoneyAmount(limitAmount, "AMD", locale);
  window.alert(template.replace("{amount}", amount));
}

/** Alerts and returns true when the failure is a spend-limit exceedance. */
export function alertIfSpendLimitExceeded(
  locale: Locale,
  result: SpendLimitErrorLike,
): boolean {
  if (!isSpendLimitExceededError(result)) return false;
  alertSpendLimitExceeded(locale, result.limitAmount);
  return true;
}
