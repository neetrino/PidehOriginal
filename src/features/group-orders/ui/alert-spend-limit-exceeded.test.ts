import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";

import {
  alertIfSpendLimitExceeded,
  isSpendLimitExceededError,
} from "@/features/group-orders/ui/alert-spend-limit-exceeded";

describe("alert-spend-limit-exceeded", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      alert: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("detects structured spend-limit failures", () => {
    expect(
      isSpendLimitExceededError({
        ok: false,
        code: "SPEND_LIMIT_EXCEEDED",
        limitAmount: 1600,
      }),
    ).toBe(true);
    expect(isSpendLimitExceededError({ ok: false })).toBe(false);
  });

  it("shows a localized browser alert for spend-limit failures", () => {
    const handled = alertIfSpendLimitExceeded("hy", {
      ok: false,
      code: "SPEND_LIMIT_EXCEEDED",
      limitAmount: 1600,
    });
    expect(handled).toBe(true);
    expect(window.alert).toHaveBeenCalledOnce();
    expect(String(vi.mocked(window.alert).mock.calls[0]?.[0])).toContain(
      "1\u202f600 AMD",
    );
  });
});
