import { describe, expect, it } from "vitest";

import { sharedPositivePrice } from "@/features/products/ui/format-pdp-price";

describe("sharedPositivePrice", () => {
  it("returns the shared positive amount", () => {
    expect(sharedPositivePrice([250, 250, 250])).toBe(250);
  });

  it("returns null when amounts differ or are not positive", () => {
    expect(sharedPositivePrice([250, 300])).toBeNull();
    expect(sharedPositivePrice([0, 0])).toBeNull();
    expect(sharedPositivePrice([])).toBeNull();
  });
});
