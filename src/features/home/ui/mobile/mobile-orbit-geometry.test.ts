import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MobileCategoryOrbit } from "@/features/home/ui/mobile/MobileCategoryOrbit";
import {
  calculateOrbitPosition,
  getOrbitNodeStyle,
  MOBILE_SLOT_COUNT,
  normalizePixel,
  ORBIT_PIXEL_PRECISION,
  ORBIT_POSES,
  toCssPx,
} from "@/features/home/ui/mobile/mobile-orbit-geometry";

const SAMPLE_CATEGORIES = Array.from({ length: MOBILE_SLOT_COUNT }, (_, i) => ({
  id: `cat-${i}`,
  title: `Category ${i}`,
  href: `/hy/products?c=${i}`,
}));

describe("mobile-orbit-geometry", () => {
  it("normalizes pixels to a fixed precision", () => {
    expect(normalizePixel(-7.0848087776993225)).toBe(-7.0848);
    expect(toCssPx(-7.0848087776993225)).toBe("-7.0848px");
    expect(toCssPx(66.06)).toBe("66.06px");
  });

  it("produces identical geometry on repeated calls", () => {
    for (const pose of ORBIT_POSES) {
      const a = calculateOrbitPosition(pose);
      const b = calculateOrbitPosition(pose);
      expect(a).toEqual(b);
      expect(getOrbitNodeStyle(pose, false)).toEqual(
        getOrbitNodeStyle(pose, false),
      );
    }
  });

  it("emits only css px strings for box metrics", () => {
    const style = getOrbitNodeStyle(ORBIT_POSES[0]!, false);
    expect(style.left).toMatch(/^-?\d+(\.\d+)?px$/);
    expect(style.top).toMatch(/^-?\d+(\.\d+)?px$/);
    expect(style.width).toMatch(/^\d+(\.\d+)?px$/);
    expect(style.height).toMatch(/^\d+(\.\d+)?px$/);
    expect(typeof style.zIndex).toBe("number");

    for (const key of ["left", "top", "width", "height"] as const) {
      const decimals = style[key].split(".")[1]?.replace("px", "") ?? "";
      expect(decimals.length).toBeLessThanOrEqual(ORBIT_PIXEL_PRECISION);
    }
  });
});

describe("MobileCategoryOrbit SSR", () => {
  it("renders deterministic markup for spin=0", () => {
    const props = {
      spin: 0,
      productsHref: "/hy/products",
      categories: SAMPLE_CATEGORIES,
    };

    const element = createElement(MobileCategoryOrbit, props);
    const first = renderToString(element);
    const second = renderToString(createElement(MobileCategoryOrbit, props));

    expect(first).toBe(second);
    expect(first).not.toMatch(/left:-?\d+\.\d{5,}px/);
    expect(first).not.toMatch(/top:-?\d+\.\d{5,}px/);

    for (const pose of ORBIT_POSES) {
      const style = getOrbitNodeStyle(pose, false);
      expect(first).toContain(`left:${style.left}`);
      expect(first).toContain(`top:${style.top}`);
    }
  });
});
