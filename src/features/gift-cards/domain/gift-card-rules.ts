/**
 * Gift card domain rules.
 * Face value and balances are integer AMD. Cards are not cash-exchangeable.
 */

export const GIFT_CARD_CODE_PREFIX = "PID";
export const DEFAULT_GIFT_CARD_EXPIRY_DAYS = 365;
export const DEFAULT_GIFT_CARD_PRESETS = [10_000, 20_000, 50_000] as const;
export const DEFAULT_GIFT_CARD_MIN_AMOUNT = 1_000;
export const DEFAULT_GIFT_CARD_MAX_AMOUNT = 500_000;

export type GiftCardSettings = {
  presets: number[];
  minAmount: number;
  maxAmount: number;
  /** Days until issued cards expire; null = no expiry. */
  defaultExpiryDays: number | null;
};

export const DEFAULT_GIFT_CARD_SETTINGS: GiftCardSettings = {
  presets: [...DEFAULT_GIFT_CARD_PRESETS],
  minAmount: DEFAULT_GIFT_CARD_MIN_AMOUNT,
  maxAmount: DEFAULT_GIFT_CARD_MAX_AMOUNT,
  defaultExpiryDays: DEFAULT_GIFT_CARD_EXPIRY_DAYS,
};

export type GiftCardStatus =
  | "PENDING_PAYMENT"
  | "ACTIVE"
  | "USED"
  | "EXPIRED"
  | "DISABLED";

export type GiftCardRedeemPreview = {
  giftCardId: string;
  code: string;
  initialAmount: number;
  balanceAmount: number;
  redeemAmount: number;
  remainingBalance: number;
  payableAfter: number;
};

/** Normalize gift card codes for lookup (uppercase, strip spaces). */
export function normalizeGiftCardCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function isValidGiftCardAmount(
  amount: number,
  settings: GiftCardSettings,
): boolean {
  return (
    Number.isInteger(amount) &&
    amount >= settings.minAmount &&
    amount <= settings.maxAmount
  );
}

export function resolveGiftCardExpiresAt(
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

/** How much of the gift card balance can cover the remaining payable. */
export function calculateGiftCardRedeemAmount(input: {
  balanceAmount: number;
  payableBeforeGiftCard: number;
}): number {
  const { balanceAmount, payableBeforeGiftCard } = input;
  if (balanceAmount <= 0 || payableBeforeGiftCard <= 0) {
    return 0;
  }
  return Math.min(balanceAmount, payableBeforeGiftCard);
}

export function nextGiftCardBalance(
  currentBalance: number,
  delta: number,
): number {
  return Math.max(0, currentBalance + delta);
}

export function resolveGiftCardStatusAfterBalance(
  balanceAmount: number,
  currentStatus: GiftCardStatus,
): GiftCardStatus {
  if (
    currentStatus === "DISABLED" ||
    currentStatus === "EXPIRED" ||
    currentStatus === "PENDING_PAYMENT"
  ) {
    return currentStatus;
  }
  if (balanceAmount <= 0) {
    return "USED";
  }
  return "ACTIVE";
}

export function isGiftCardRedeemable(input: {
  status: GiftCardStatus;
  balanceAmount: number;
  expiresAt: Date | null;
  now?: Date;
}): boolean {
  const now = input.now ?? new Date();
  if (input.status !== "ACTIVE") {
    return false;
  }
  if (input.balanceAmount <= 0) {
    return false;
  }
  if (input.expiresAt && input.expiresAt.getTime() <= now.getTime()) {
    return false;
  }
  return true;
}

/**
 * Target net ledger sum for an order's gift-card usage.
 * Active orders keep a debit of -amount; cancel/refund nets to 0.
 */
export function giftCardLedgerTargetNet(input: {
  giftCardAmount: number;
  orderStatus: GiftCardStatus | string;
}): number {
  if (input.giftCardAmount <= 0) {
    return 0;
  }
  if (
    input.orderStatus === "CANCELLED" ||
    input.orderStatus === "REFUNDED"
  ) {
    return 0;
  }
  return -input.giftCardAmount;
}

/** User-facing reason when a gift card cannot be applied at checkout. */
export function giftCardRedeemErrorMessage(input: {
  found: boolean;
  status?: GiftCardStatus;
  balanceAmount?: number;
  expiresAt?: Date | null;
  now?: Date;
}): string {
  if (!input.found || input.status == null) {
    return "Gift card code was not found.";
  }
  const now = input.now ?? new Date();
  if (input.status === "PENDING_PAYMENT") {
    return "Gift card is pending payment and cannot be used yet.";
  }
  if (input.status === "DISABLED") {
    return "Gift card is disabled.";
  }
  if (input.status === "EXPIRED") {
    return "Gift card has expired.";
  }
  if (
    input.expiresAt != null &&
    input.expiresAt.getTime() <= now.getTime()
  ) {
    return "Gift card has expired.";
  }
  if (input.status === "USED" || (input.balanceAmount ?? 0) <= 0) {
    return "Gift card has no remaining balance.";
  }
  return "Gift card is invalid, expired, or empty.";
}

/**
 * Merchandise eligible for bonus accrual after gift-card coverage.
 * Gift-card-paid portion does not earn bonuses.
 */
export function bonusEligibleAfterGiftCard(input: {
  subtotalAmount: number;
  discountAmount: number;
  giftCardAmount: number;
}): number {
  const merchandise = Math.max(
    0,
    input.subtotalAmount - input.discountAmount,
  );
  return Math.max(0, merchandise - Math.min(input.giftCardAmount, merchandise));
}

export function buildGiftCardRedeemPreview(input: {
  giftCardId: string;
  code: string;
  initialAmount: number;
  balanceAmount: number;
  payableBeforeGiftCard: number;
}): GiftCardRedeemPreview {
  const redeemAmount = calculateGiftCardRedeemAmount({
    balanceAmount: input.balanceAmount,
    payableBeforeGiftCard: input.payableBeforeGiftCard,
  });
  return {
    giftCardId: input.giftCardId,
    code: input.code,
    initialAmount: input.initialAmount,
    balanceAmount: input.balanceAmount,
    redeemAmount,
    remainingBalance: input.balanceAmount - redeemAmount,
    payableAfter: Math.max(0, input.payableBeforeGiftCard - redeemAmount),
  };
}
