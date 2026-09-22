import { describe, expect, it } from 'vitest';

import { uniqueOrbitPhotos } from '@/features/home/ui/unique-orbit-photos';

describe('uniqueOrbitPhotos', () => {
  it('drops duplicate urls and empty values', () => {
    expect(
      uniqueOrbitPhotos(['a.webp', 'a.webp', null, 'b.webp', '', 'c.webp', 'b.webp']),
    ).toEqual(['a.webp', 'b.webp', 'c.webp']);
  });

  it('keeps every unique url past five', () => {
    expect(uniqueOrbitPhotos(['1', '2', '3', '4', '5', '6'])).toEqual(['1', '2', '3', '4', '5', '6']);
  });
});
