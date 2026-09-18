import { describe, expect, it } from 'vitest';

import { clampUnit, magnetFromPointer } from '@/features/home/ui/product-image-motion';

describe('magnetFromPointer', () => {
  it('stays still at the image center', () => {
    expect(magnetFromPointer(0, 0)).toEqual({
      x: 0,
      y: 0,
      rotateZ: 0,
      rotateX: 0,
      rotateY: 0,
    });
  });

  it('caps translation and tilt at the edges', () => {
    expect(magnetFromPointer(1, 1)).toEqual({
      x: 5,
      y: 3,
      rotateZ: 1.5,
      rotateY: 2,
      rotateX: -2,
    });
    expect(magnetFromPointer(-1, -1)).toEqual({
      x: -5,
      y: -3,
      rotateZ: -1.5,
      rotateY: -2,
      rotateX: 2,
    });
  });

  it('clamps values outside the unit square', () => {
    expect(clampUnit(2)).toBe(1);
    expect(clampUnit(-4)).toBe(-1);
    expect(magnetFromPointer(8, -9).x).toBe(5);
  });
});
