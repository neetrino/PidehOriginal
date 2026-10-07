/** Shop "All" groups, first to last. Unknown categories stay after these. */
export const SHOP_ALL_CATEGORY_RANKS = [
  { slugs: ['pide'], rank: 1 },
  { slugs: ['snack', 'snacks'], rank: 2 },
  { slugs: ['sauces', 'sauce'], rank: 3 },
  { slugs: ['drinks', 'drink', 'beverages'], rank: 4 },
  { slugs: ['combo', 'combos', 'kombo'], rank: 5 },
] as const;

export const UNKNOWN_CATEGORY_RANK = 6;

/** Rank of a category slug in the shop All list. */
export function shopCategoryRank(slug: string): number {
  const key = slug.trim().toLowerCase();
  for (const group of SHOP_ALL_CATEGORY_RANKS) {
    if ((group.slugs as readonly string[]).includes(key)) {
      return group.rank;
    }
  }
  return UNKNOWN_CATEGORY_RANK;
}

/** Sorts shop categories into the All-list sequence. */
export function compareShopCategories(left: { slug: string }, right: { slug: string }): number {
  return shopCategoryRank(left.slug) - shopCategoryRank(right.slug);
}
