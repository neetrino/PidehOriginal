import { describe, expect, it } from "vitest";

import { formatMoneyAmount } from "@/lib/money/format";

describe("formatMoneyAmount", () => {
  it("formats AMD without fraction digits and with the Figma currency symbol", () => {
    expect(formatMoneyAmount(12_500, "AMD", "hy")).toBe("12\u202f500 ֏");
    expect(formatMoneyAmount(12_500, "AMD", "en")).toBe("12\u202f500 ֏");
  });

  it("formats USD from minor units with a stable symbol", () => {
    expect(formatMoneyAmount(2600n, "USD", "en")).toBe("26.00 $");
  });

  it("is identical for the same amount across app locales (SSR-safe)", () => {
    const amount = 1_234;
    expect(formatMoneyAmount(amount, "AMD", "hy")).toBe(
      formatMoneyAmount(amount, "AMD", "en"),
    );
    expect(formatMoneyAmount(amount, "AMD", "hy")).toBe("1\u202f234 ֏");
  });
});
