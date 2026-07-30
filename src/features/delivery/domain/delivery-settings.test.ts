import { describe, expect, it } from "vitest";

import {
  DEFAULT_DELIVERY_SETTINGS,
  isDistanceDeliveryReady,
  parseDeliverySettings,
} from "@/features/delivery/domain/delivery-settings";

describe("parseDeliverySettings", () => {
  it("returns defaults for empty input", () => {
    expect(parseDeliverySettings(null)).toEqual(DEFAULT_DELIVERY_SETTINGS);
  });

  it("parses a configured store origin", () => {
    expect(
      parseDeliverySettings({
        originAddress: "Tumanyan 40, Yerevan",
        originLat: 40.18,
        originLng: 44.51,
        pricePerKmAmount: 1000,
        isActive: true,
      }),
    ).toEqual({
      originAddress: "Tumanyan 40, Yerevan",
      originLat: 40.18,
      originLng: 44.51,
      pricePerKmAmount: 1000,
      isActive: true,
      schedule: DEFAULT_DELIVERY_SETTINGS.schedule,
      cashChangeDenominations: DEFAULT_DELIVERY_SETTINGS.cashChangeDenominations,
    });
  });
});

describe("isDistanceDeliveryReady", () => {
  it("requires active geocoded origin", () => {
    expect(
      isDistanceDeliveryReady({
        ...DEFAULT_DELIVERY_SETTINGS,
        isActive: true,
        originAddress: "Yerevan",
        pricePerKmAmount: 500,
      }),
    ).toBe(false);

    expect(
      isDistanceDeliveryReady({
        originAddress: "Yerevan",
        originLat: 40.1,
        originLng: 44.5,
        pricePerKmAmount: 500,
        isActive: true,
        schedule: DEFAULT_DELIVERY_SETTINGS.schedule,
        cashChangeDenominations: DEFAULT_DELIVERY_SETTINGS.cashChangeDenominations,
      }),
    ).toBe(true);
  });
});
