import { describe, expect, it } from "vitest";

import {
  popupIdsToDeactivate,
  validatePopupFields,
} from "@/features/popups/domain/popup-rules";

describe("validatePopupFields", () => {
  it("requires a title", () => {
    expect(validatePopupFields({ title: "  " })).toBe("TITLE_REQUIRED");
  });

  it("accepts empty link URL", () => {
    expect(validatePopupFields({ title: "Summer", linkUrl: "" })).toBeNull();
  });

  it("accepts site path and http(s) URLs", () => {
    expect(
      validatePopupFields({ title: "Summer", linkUrl: "/hy/products" }),
    ).toBeNull();
    expect(
      validatePopupFields({
        title: "Summer",
        linkUrl: "https://example.com/sale",
      }),
    ).toBeNull();
  });

  it("rejects invalid link URLs", () => {
    expect(
      validatePopupFields({ title: "Summer", linkUrl: "javascript:alert(1)" }),
    ).toBe("INVALID_LINK_URL");
  });
});

describe("popupIdsToDeactivate", () => {
  it("returns other active popup ids when activating a target", () => {
    expect(
      popupIdsToDeactivate(
        [
          { id: "a", isActive: true },
          { id: "b", isActive: false },
          { id: "c", isActive: true },
        ],
        "a",
      ),
    ).toEqual(["c"]);
  });

  it("returns empty when none other are active", () => {
    expect(
      popupIdsToDeactivate(
        [
          { id: "a", isActive: false },
          { id: "b", isActive: false },
        ],
        "a",
      ),
    ).toEqual([]);
  });
});
