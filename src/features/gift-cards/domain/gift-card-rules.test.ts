import { describe, expect, it } from "vitest";

import {
  DEFAULT_GIFT_CARD_SETTINGS,
  bonusEligibleAfterGiftCard,
  buildGiftCardRedeemPreview,
  calculateGiftCardRedeemAmount,
  giftCardLedgerTargetNet,
  giftCardRedeemErrorMessage,
  isGiftCardRedeemable,
  isValidGiftCardAmount,
  nextGiftCardBalance,
  normalizeGiftCardCode,
  resolveGiftCardExpiresAt,
  resolveGiftCardStatusAfterBalance,
} from "@/features/gift-cards/domain/gift-card-rules";

describe("gift-card-rules", () => {
  it("normalizes codes", () => {
    expect(normalizeGiftCardCode(" pid-8f4d-2x91 ")).toBe("PID-8F4D-2X91");
  });

  it("validates amounts against settings", () => {
    expect(isValidGiftCardAmount(20_000, DEFAULT_GIFT_CARD_SETTINGS)).toBe(
      true,
    );
    expect(isValidGiftCardAmount(500, DEFAULT_GIFT_CARD_SETTINGS)).toBe(false);
    expect(isValidGiftCardAmount(20_000.5, DEFAULT_GIFT_CARD_SETTINGS)).toBe(
      false,
    );
  });

  it("calculates partial redeem and remaining payable", () => {
    expect(
      calculateGiftCardRedeemAmount({
        balanceAmount: 20_000,
        payableBeforeGiftCard: 18_000,
      }),
    ).toBe(18_000);

    const preview = buildGiftCardRedeemPreview({
      giftCardId: "g1",
      code: "PID-AAAA-BBBB",
      initialAmount: 20_000,
      balanceAmount: 20_000,
      payableBeforeGiftCard: 18_000,
    });
    expect(preview.redeemAmount).toBe(18_000);
    expect(preview.remainingBalance).toBe(2_000);
    expect(preview.payableAfter).toBe(0);
  });

  it("keeps residual when card exceeds order", () => {
    const preview = buildGiftCardRedeemPreview({
      giftCardId: "g1",
      code: "PID-AAAA-BBBB",
      initialAmount: 20_000,
      balanceAmount: 20_000,
      payableBeforeGiftCard: 15_000,
    });
    expect(preview.redeemAmount).toBe(15_000);
    expect(preview.remainingBalance).toBe(5_000);
    expect(preview.payableAfter).toBe(0);
  });

  it("rejects expired, disabled, and empty cards", () => {
    expect(
      isGiftCardRedeemable({
        status: "ACTIVE",
        balanceAmount: 1000,
        expiresAt: null,
      }),
    ).toBe(true);
    expect(
      isGiftCardRedeemable({
        status: "DISABLED",
        balanceAmount: 1000,
        expiresAt: null,
      }),
    ).toBe(false);
    expect(
      isGiftCardRedeemable({
        status: "ACTIVE",
        balanceAmount: 0,
        expiresAt: null,
      }),
    ).toBe(false);
    expect(
      isGiftCardRedeemable({
        status: "ACTIVE",
        balanceAmount: 1000,
        expiresAt: new Date("2020-01-01T00:00:00.000Z"),
        now: new Date("2026-01-01T00:00:00.000Z"),
      }),
    ).toBe(false);
  });

  it("explains why a card cannot be redeemed", () => {
    expect(giftCardRedeemErrorMessage({ found: false })).toBe(
      "Gift card code was not found.",
    );
    expect(
      giftCardRedeemErrorMessage({
        found: true,
        status: "PENDING_PAYMENT",
        balanceAmount: 0,
        expiresAt: null,
      }),
    ).toBe("Gift card is pending payment and cannot be used yet.");
    expect(
      giftCardRedeemErrorMessage({
        found: true,
        status: "USED",
        balanceAmount: 0,
        expiresAt: null,
      }),
    ).toBe("Gift card has no remaining balance.");
  });

  it("updates status from balance", () => {
    expect(resolveGiftCardStatusAfterBalance(0, "ACTIVE")).toBe("USED");
    expect(resolveGiftCardStatusAfterBalance(100, "USED")).toBe("ACTIVE");
    expect(resolveGiftCardStatusAfterBalance(0, "DISABLED")).toBe("DISABLED");
  });

  it("never lets balance go negative", () => {
    expect(nextGiftCardBalance(100, -150)).toBe(0);
    expect(nextGiftCardBalance(100, 50)).toBe(150);
  });

  it("excludes gift-card-paid merchandise from bonus earn base", () => {
    expect(
      bonusEligibleAfterGiftCard({
        subtotalAmount: 18_000,
        discountAmount: 0,
        giftCardAmount: 15_000,
      }),
    ).toBe(3_000);
  });

  it("resolves expiry from days", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    expect(resolveGiftCardExpiresAt(now, null)).toBeNull();
    expect(resolveGiftCardExpiresAt(now, 365)?.toISOString()).toBe(
      "2027-01-01T00:00:00.000Z",
    );
  });

  it("targets ledger net by order status", () => {
    expect(
      giftCardLedgerTargetNet({
        giftCardAmount: 15_000,
        orderStatus: "PENDING",
      }),
    ).toBe(-15_000);
    expect(
      giftCardLedgerTargetNet({
        giftCardAmount: 15_000,
        orderStatus: "DELIVERED",
      }),
    ).toBe(-15_000);
    expect(
      giftCardLedgerTargetNet({
        giftCardAmount: 15_000,
        orderStatus: "CANCELLED",
      }),
    ).toBe(0);
    expect(
      giftCardLedgerTargetNet({
        giftCardAmount: 15_000,
        orderStatus: "REFUNDED",
      }),
    ).toBe(0);
  });
});
