import { describe, expect, it } from "vitest";

import {
  createDefaultCashChangeDenominations,
  findActiveCashChangeByAmount,
  listActiveCashChangeDenominations,
  parseCashChangeDenominations,
} from "@/features/delivery/domain/cash-change";

describe("cash-change denominations", () => {
  it("defaults to 10k / 20k / 50k / 100k", () => {
    expect(createDefaultCashChangeDenominations().map((item) => item.amount)).toEqual([
      10_000, 20_000, 50_000, 100_000,
    ]);
  });

  it("restores defaults when value is missing", () => {
    expect(parseCashChangeDenominations(null)).toEqual(
      createDefaultCashChangeDenominations(),
    );
  });

  it("keeps an explicit empty list", () => {
    expect(parseCashChangeDenominations([])).toEqual([]);
  });

  it("filters to active denominations", () => {
    const active = listActiveCashChangeDenominations([
      {
        id: "a",
        amount: 10_000,
        imageObjectKey: null,
        isActive: false,
        sortOrder: 0,
      },
      {
        id: "b",
        amount: 20_000,
        imageObjectKey: "uploads/x.jpg",
        isActive: true,
        sortOrder: 1,
      },
    ]);
    expect(active).toHaveLength(1);
    expect(active[0]?.amount).toBe(20_000);
  });

  it("finds an active denomination by amount", () => {
    const list = createDefaultCashChangeDenominations();
    expect(findActiveCashChangeByAmount(list, 50_000)?.amount).toBe(50_000);
    expect(findActiveCashChangeByAmount(list, 999)).toBeNull();
  });
});
