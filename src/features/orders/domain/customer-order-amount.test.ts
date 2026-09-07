import { describe, expect, it } from "vitest";

import { resolveCustomerFacingOrderAmount } from "@/features/orders/domain/customer-order-amount";

describe("resolveCustomerFacingOrderAmount", () => {
  it("returns order total for solo orders", () => {
    expect(
      resolveCustomerFacingOrderAmount({
        orderTotalAmount: 12_000,
        groupOrderId: null,
        participantFinalAmount: null,
      }),
    ).toBe(12_000);
  });

  it("returns participant share for group orders", () => {
    expect(
      resolveCustomerFacingOrderAmount({
        orderTotalAmount: 30_000,
        groupOrderId: "go-1",
        participantFinalAmount: 8_500,
      }),
    ).toBe(8_500);
  });

  it("falls back to order total when participant share is missing", () => {
    expect(
      resolveCustomerFacingOrderAmount({
        orderTotalAmount: 30_000,
        groupOrderId: "go-1",
        participantFinalAmount: null,
      }),
    ).toBe(30_000);
  });
});
