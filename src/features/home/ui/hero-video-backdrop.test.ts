import { describe, expect, it } from 'vitest';

import { toCssHex } from '@/features/home/ui/hero-video-backdrop';

describe('hero video backdrop hex', () => {
  it('formats RGB channels as uppercase CSS hex', () => {
    expect(toCssHex(252, 133, 33)).toBe('#FC8521');
  });

  it('clamps out-of-range channels', () => {
    expect(toCssHex(300, -4, 16)).toBe('#FF0010');
  });
});
