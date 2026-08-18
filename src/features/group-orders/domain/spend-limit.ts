/**
 * Per-participant spend limit rules (merchandise subtotal only).
 */

export type SpendLimitCheck =
  | { ok: true }
  | { ok: false; reason: "EXCEEDS_LIMIT"; limitAmount: number; subtotalAmount: number };

/** Null/undefined limit means unlimited. */
export function checkSpendLimit(
  subtotalAmount: number,
  spendLimitAmount: number | null | undefined,
): SpendLimitCheck {
  if (spendLimitAmount == null) {
    return { ok: true };
  }
  if (subtotalAmount <= spendLimitAmount) {
    return { ok: true };
  }
  return {
    ok: false,
    reason: "EXCEEDS_LIMIT",
    limitAmount: spendLimitAmount,
    subtotalAmount,
  };
}

export function isSuccessfulParticipantPayment(
  status: string,
): boolean {
  return status === "PAID" || status === "MARKED_RECEIVED";
}
