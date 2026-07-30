import { describe, expect, it } from "vitest";

import {
  calculateDistanceDeliveryFee,
  formatDistanceKmLabel,
} from "@/features/delivery/domain/distance-fee";

describe("calculateDistanceDeliveryFee", () => {
  it("keeps fractional kilometers (1101 m × 1000 AMD/km → 1101 AMD)", () => {
    expect(calculateDistanceDeliveryFee(1101, 1000)).toBe(1101);
  });

  it("rounds to nearest whole dram", () => {
    expect(calculateDistanceDeliveryFee(1500, 1000)).toBe(1500);
    expect(calculateDistanceDeliveryFee(1, 1000)).toBe(1);
    expect(calculateDistanceDeliveryFee(500, 1)).toBe(1);
  });

  it("returns zero for zero distance or zero rate", () => {
    expect(calculateDistanceDeliveryFee(0, 1000)).toBe(0);
    expect(calculateDistanceDeliveryFee(5000, 0)).toBe(0);
  });

  it("rejects invalid inputs", () => {
    expect(() => calculateDistanceDeliveryFee(-1, 1000)).toThrow();
    expect(() => calculateDistanceDeliveryFee(1000, -1)).toThrow();
  });
});

describe("formatDistanceKmLabel", () => {
  it("formats meters as kilometers with three decimals", () => {
    expect(formatDistanceKmLabel(1101)).toBe("1.101 km");
    expect(formatDistanceKmLabel(0)).toBe("0.000 km");
  });
});
