import { describe, expect, it } from 'vitest';

import { uniqueOrbitItems, uniqueOrbitPhotos } from '@/features/home/ui/unique-orbit-photos';

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

describe('uniqueOrbitItems', () => {
  it('keeps the first title for a repeated photo', () => {
    expect(
      uniqueOrbitItems([
        { imageUrl: 'a.webp', title: 'A' },
        { imageUrl: 'a.webp', title: 'A2' },
        { imageUrl: '', title: 'Empty' },
        { imageUrl: 'b.webp', title: 'B' },
      ]),
    ).toEqual([
      { imageUrl: 'a.webp', title: 'A' },
      { imageUrl: 'b.webp', title: 'B' },
    ]);
  });
});
