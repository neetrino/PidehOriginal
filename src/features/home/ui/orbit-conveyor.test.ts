import { describe, expect, it } from 'vitest';

import { SLOT_COUNT } from '@/features/home/ui/category-orbit-slots';
import {
  assignOrbitPoolSlots,
  assignOrbitRiders,
  ORBIT_GAP_SLOTS,
} from '@/features/home/ui/orbit-conveyor';

describe('assignOrbitPoolSlots', () => {
  it('keeps Figma rest poses at spin 0', () => {
    expect(assignOrbitPoolSlots(0, 8)).toEqual([0, 1, 2, 3, 4]);
  });

  it('morphs the gap rider into the next catalog photo while staying on the ring', () => {
    const riders = assignOrbitRiders(1, 8);
    const atBottomRight = riders.find((rider) => rider.poseIndex === ORBIT_GAP_SLOTS.bottomRight);
    const atTopRight = riders.find((rider) => rider.poseIndex === ORBIT_GAP_SLOTS.topRight);
    expect(atBottomRight?.riderId).toBe(ORBIT_GAP_SLOTS.topRight);
    expect(atBottomRight?.poolIndex).toBe(5);
    expect(atTopRight?.poolIndex).toBe(1);
    const next = assignOrbitPoolSlots(1, 8);
    expect(next[ORBIT_GAP_SLOTS.topRight]).not.toBe(3);
    expect(next[ORBIT_GAP_SLOTS.bottomRight]).toBe(5);
    expect(next).toHaveLength(SLOT_COUNT);
    expect(new Set(next).size).toBe(SLOT_COUNT);
  });

  it('morphs the reverse gap rider into the next catalog photo', () => {
    const riders = assignOrbitRiders(-1, 8);
    const atTopRight = riders.find((rider) => rider.poseIndex === ORBIT_GAP_SLOTS.topRight);
    expect(atTopRight?.riderId).toBe(ORBIT_GAP_SLOTS.bottomRight);
    expect(atTopRight?.poolIndex).toBe(5);
  });

  it('returns to rest after a full pool cycle', () => {
    expect(assignOrbitPoolSlots(8, 8)).toEqual([0, 1, 2, 3, 4]);
  });

  it('does not fill extra slots when there are fewer photos than seats', () => {
    expect(assignOrbitPoolSlots(0, 3)).toEqual([0, 1, 2, -1, -1]);
  });
});
