import { describe, expect, it } from 'vitest';

import { compareShopCategories, shopCategoryRank } from '@/features/products/domain/shop-category-order';

describe('shop All category order', () => {
  it('ranks pide, snack, sauce, drinks, then combo', () => {
    const ordered = ['combo', 'drinks', 'sauces', 'snack', 'pide'].sort((left, right) =>
      compareShopCategories({ slug: left }, { slug: right }),
    );

    expect(ordered).toEqual(['pide', 'snack', 'sauces', 'drinks', 'combo']);
    expect(shopCategoryRank('sauce')).toBe(shopCategoryRank('sauces'));
    expect(shopCategoryRank('unknown')).toBeGreaterThan(shopCategoryRank('combo'));
  });
});
