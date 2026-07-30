import { describe, expect, it } from "vitest";

import {
  buildModifierSelectionKey,
  sumAdditionPrices,
} from "@/features/products/domain/modifier-selection";

describe("modifier selection", () => {
  it("builds a stable sorted selection key", () => {
    expect(buildModifierSelectionKey(["b", "a", "b"])).toBe("a,b");
    expect(buildModifierSelectionKey([])).toBe("");
  });

  it("sums only addition prices", () => {
    expect(
      sumAdditionPrices([
        { kind: "ADDITION", priceAmount: 200 },
        { kind: "EXCEPTION", priceAmount: 0 },
        { kind: "ADDITION", priceAmount: 50 },
      ]),
    ).toBe(250);
  });
});
