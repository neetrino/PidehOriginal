import { describe, expect, it } from 'vitest';

import { resolveOrbitSwipeDelta } from '@/features/home/ui/mobile/orbit-swipe';

describe('resolveOrbitSwipeDelta', () => {
  it('ignores short horizontal travel', () => {
    expect(resolveOrbitSwipeDelta(20, 0)).toBe(0);
    expect(resolveOrbitSwipeDelta(-20, 4)).toBe(0);
  });

  it('ignores vertical-dominant movement', () => {
    expect(resolveOrbitSwipeDelta(50, 80)).toBe(0);
    expect(resolveOrbitSwipeDelta(-60, -90)).toBe(0);
  });

  it('steps forward on a left swipe', () => {
    expect(resolveOrbitSwipeDelta(-48, 8)).toBe(1);
  });

  it('steps backward on a right swipe', () => {
    expect(resolveOrbitSwipeDelta(52, -6)).toBe(-1);
  });
});
