import { describe, expect, it } from "vitest";

import { resolveOrderItemImageObjectKey } from "@/features/orders/domain/order-item-image";

describe("resolveOrderItemImageObjectKey", () => {
  it("prefers the order-line snapshot key", () => {
    expect(
      resolveOrderItemImageObjectKey({
        productImageKeySnapshot: "uploads/products/a.jpg",
        productId: "prod-1",
        liveObjectKeyByProductId: new Map([
          ["prod-1", "uploads/products/b.jpg"],
        ]),
      }),
    ).toBe("uploads/products/a.jpg");
  });

  it("falls back to live product media when snapshot is missing", () => {
    expect(
      resolveOrderItemImageObjectKey({
        productImageKeySnapshot: null,
        productId: "prod-1",
        liveObjectKeyByProductId: new Map([
          ["prod-1", "uploads/products/b.jpg"],
        ]),
      }),
    ).toBe("uploads/products/b.jpg");
  });

  it("returns null when neither snapshot nor live media exists", () => {
    expect(
      resolveOrderItemImageObjectKey({
        productImageKeySnapshot: null,
        productId: "prod-1",
        liveObjectKeyByProductId: new Map(),
      }),
    ).toBeNull();
  });
});
