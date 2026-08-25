/**
 * Loyalty bonus domain rules.
 * 1 bonus point = 1 AMD. Balance must never go negative.
 */

export const DEFAULT_BONUS_ACCRUAL_PERCENT = 1;
export const DEFAULT_BONUS_MAX_REDEEM_PERCENT = 20;

export type BonusSettings = {
  /** Percent of accrual base credited on DELIVERED (1–100). */
  accrualPercent: number;
  /** Max share of post-discount merchandise total payable with bonuses (1–100). */
  maxRedeemPercent: number;
  /** Days until earned bonuses expire; null = no expiry. */
  expiryDays: number | null;
};

export const DEFAULT_BONUS_SETTINGS: BonusSettings = {
  accrualPercent: DEFAULT_BONUS_ACCRUAL_PERCENT,
  maxRedeemPercent: DEFAULT_BONUS_MAX_REDEEM_PERCENT,
  expiryDays: null,
};

/** Merchandise amount eligible for accrual/redeem caps (excludes delivery). */
export function bonusEligibleMerchandiseAmount(
  subtotalAmount: number,
  discountAmount: number,
): number {
  return Math.max(0, subtotalAmount - discountAmount);
}

/** Points earned when an order reaches DELIVERED. */
export function calculateBonusEarnAmount(
  eligibleMerchandiseAmount: number,
  accrualPercent: number,
): number {
  if (eligibleMerchandiseAmount <= 0 || accrualPercent <= 0) {
    return 0;
  }
  return Math.floor((eligibleMerchandiseAmount * accrualPercent) / 100);
}

/** Max points that may be redeemed against an order. */
export function calculateMaxRedeemAmount(input: {
  eligibleMerchandiseAmount: number;
  availableBalance: number;
  maxRedeemPercent: number;
}): number {
  const { eligibleMerchandiseAmount, availableBalance, maxRedeemPercent } =
    input;
  if (
    eligibleMerchandiseAmount <= 0 ||
    availableBalance <= 0 ||
    maxRedeemPercent <= 0
  ) {
    return 0;
  }
  const cap = Math.floor(
    (eligibleMerchandiseAmount * maxRedeemPercent) / 100,
  );
  return Math.min(availableBalance, cap, eligibleMerchandiseAmount);
}

/** Clamp a requested redeem amount to the allowed maximum. */
export function clampBonusRedeemRequest(
  requested: number,
  maxAllowed: number,
): number {
  if (!Number.isInteger(requested) || requested <= 0) {
    return 0;
  }
  return Math.min(requested, maxAllowed);
}

/** Apply a signed delta without going below zero. */
export function nextBonusBalance(
  currentBalance: number,
  delta: number,
): number {
  return Math.max(0, currentBalance + delta);
}

export function resolveEarnExpiresAt(
  now: Date,
  expiryDays: number | null,
): Date | null {
  if (expiryDays == null || expiryDays <= 0) {
    return null;
  }
  const expires = new Date(now);
  expires.setUTCDate(expires.getUTCDate() + expiryDays);
  return expires;
}
