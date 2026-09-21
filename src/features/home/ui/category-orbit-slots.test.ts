import { describe, expect, it } from 'vitest';

import {
  ORBIT_PRODUCT_ROTATE_DEG,
  ORBIT_PRODUCT_VISUAL,
  ORBIT_SLOT_IDS,
  ORBIT_SLOT_POSES,
  SLOT_COUNT,
  orbitProductSpanWidthPct,
  orbitProductVisual,
} from '@/features/home/ui/category-orbit-slots';

describe('orbit product cutout layout', () => {
  it('orients featured horizontal and the right-side slots upright', () => {
    expect(ORBIT_SLOT_IDS).toHaveLength(SLOT_COUNT);
    expect(ORBIT_PRODUCT_ROTATE_DEG).toHaveLength(SLOT_COUNT);
    const { main, topCenter, topRight, bottomRight, bottomCenter } = ORBIT_PRODUCT_VISUAL;
    expect(main.rotateDeg).toBeGreaterThan(0);
    expect(topRight.rotateDeg).toBeLessThan(0);
    expect(bottomRight.rotateDeg).toBeLessThan(0);
    expect(topCenter.rotateDeg).toBeGreaterThan(main.rotateDeg);
    expect(bottomCenter.rotateDeg).toBeGreaterThan(main.rotateDeg);
    expect(bottomCenter.rotateDeg).toBeGreaterThan(100);
  });

  it('nudges the hero right/down and locks the arc slots onto the ring', () => {
    const { main, topCenter, bottomCenter } = ORBIT_PRODUCT_VISUAL;
    expect(main.offsetXPct).toBeGreaterThan(0);
    expect(main.scale).toBeLessThan(1);
    expect(topCenter.offsetYPct).toBeLessThan(0);
    expect(topCenter.offsetXPct).toBeLessThan(0);
    expect(bottomCenter.offsetYPct).toBeLessThan(0);
    expect(bottomCenter.offsetXPct).toBeGreaterThan(0);
    expect(bottomCenter.scale).toBeGreaterThan(1);
    expect(orbitProductVisual(0)).toEqual(main);
  });

  it('sizes the square span from the AABB long side', () => {
    const featured = ORBIT_SLOT_POSES[0];
    const vertical = ORBIT_SLOT_POSES[2];
    expect(featured).toBeDefined();
    expect(vertical).toBeDefined();
    expect(orbitProductSpanWidthPct(featured!)).toBe('100%');
    expect(Number.parseFloat(orbitProductSpanWidthPct(vertical!))).toBeGreaterThan(100);
  });
});
