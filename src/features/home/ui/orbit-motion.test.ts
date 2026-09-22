import { describe, expect, it } from 'vitest';

import {
  nearestEquivalentAngle,
  ORBIT_SLOT_POSES,
  shortestAngleDelta,
} from '@/features/home/ui/category-orbit-slots';
import { isMainOrbitSlot, poseAreaScale } from '@/features/home/ui/orbit-motion';

describe('orbit motion model', () => {
  it('takes the short rotate path instead of spinning past 180deg', () => {
    expect(shortestAngleDelta(168, -37)).toBe(155);
    expect(nearestEquivalentAngle(168, -37)).toBe(323);
    expect(Math.abs(nearestEquivalentAngle(168, -37) - 168)).toBeLessThan(180);
    expect(Math.abs(nearestEquivalentAngle(47, 84) - 47)).toBeLessThan(90);
  });

  it('scales slot depth from the stable square span', () => {
    const main = ORBIT_SLOT_POSES[0];
    const far = ORBIT_SLOT_POSES[2];
    expect(main).toBeDefined();
    expect(far).toBeDefined();
    expect(poseAreaScale(far!, main!)).toBeLessThan(1);
    expect(poseAreaScale(main!, far!)).toBeGreaterThan(1);
    expect(isMainOrbitSlot(0)).toBe(true);
    expect(isMainOrbitSlot(2)).toBe(false);
  });
});
