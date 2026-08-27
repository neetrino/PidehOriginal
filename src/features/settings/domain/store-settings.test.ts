import { describe, expect, it } from "vitest";

import {
  DEFAULT_FX_RATES,
  DEFAULT_GIFT_CARD_SETTINGS,
  DEFAULT_REVENUE_STATUSES,
  parseBonusSettings,
  parseFxRates,
  parseGiftCardSettings,
  parseMaintenance,
  parseRevenueStatuses,
  parseStacking,
} from "@/features/settings/domain/store-settings";

describe("store settings parsers", () => {
  it("defaults revenue statuses safely", () => {
    expect(parseRevenueStatuses(null)).toEqual(DEFAULT_REVENUE_STATUSES);
    expect(parseRevenueStatuses({ statuses: ["DELIVERED", "CANCELLED"] })).toEqual([
      "DELIVERED",
    ]);
  });

  it("parses maintenance and stacking flags", () => {
    expect(parseMaintenance({ enabled: true, message: "Back soon" })).toEqual({
      enabled: true,
      message: "Back soon",
    });
    expect(parseStacking({ allowCouponWithAutomatic: true })).toEqual({
      allowCouponWithAutomatic: true,
    });
  });

  it("parses fx rates with defaults for invalid values", () => {
    expect(parseFxRates(null)).toEqual(DEFAULT_FX_RATES);
    expect(parseFxRates({ usd: "0.003", rub: "0.25" })).toEqual({
      usd: "0.003",
      rub: "0.25",
    });
    expect(parseFxRates({ usd: "0,2137", rub: "1,5" })).toEqual({
      usd: "0.2137",
      rub: "1.5",
    });
    expect(parseFxRates({ usd: "0", rub: "abc" })).toEqual(DEFAULT_FX_RATES);
  });

  it("parses bonus settings with defaults", () => {
    expect(parseBonusSettings(null)).toEqual({
      accrualPercent: 1,
      maxRedeemPercent: 20,
      expiryDays: null,
    });
    expect(
      parseBonusSettings({
        accrualPercent: 2,
        maxRedeemPercent: 30,
        expiryDays: 365,
      }),
    ).toEqual({
      accrualPercent: 2,
      maxRedeemPercent: 30,
      expiryDays: 365,
    });
  });

  it("parses gift card settings with defaults", () => {
    expect(parseGiftCardSettings(null)).toEqual({
      presets: [...DEFAULT_GIFT_CARD_SETTINGS.presets],
      minAmount: DEFAULT_GIFT_CARD_SETTINGS.minAmount,
      maxAmount: DEFAULT_GIFT_CARD_SETTINGS.maxAmount,
      defaultExpiryDays: DEFAULT_GIFT_CARD_SETTINGS.defaultExpiryDays,
    });
  });
});
