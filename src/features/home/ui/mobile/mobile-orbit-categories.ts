import { MOBILE_HOME_ASSETS } from '@/features/home/ui/mobile/mobile-assets';

type OrbitSource = {
  id: string;
  title: string;
  href: string;
  slug?: string;
};

export type BuiltOrbitCategory = {
  id: string;
  title: string;
  href: string;
  iconSrc: string;
};

/**
 * Left → right at rest. Index 2 sits in the yellow disc.
 * Mobile SVG filenames do not match the drawings:
 * cat-sandwich is the chips bag, cat-snack is the combo meal, cat-burger is the sauce cup.
 */
const ORBIT_SLOTS: ReadonlyArray<{ slugs: readonly string[]; iconSrc: string }> = [
  { slugs: ['drinks', 'drink', 'beverages', 'խմիչք'], iconSrc: MOBILE_HOME_ASSETS.catDrink },
  {
    slugs: ['snack', 'snacks', 'appetizer', 'chips', 'չիպսեր', 'սնեք'],
    iconSrc: MOBILE_HOME_ASSETS.catSandwich,
  },
  { slugs: ['pide', 'փիդե'], iconSrc: MOBILE_HOME_ASSETS.catPide },
  {
    slugs: ['combo', 'combos', 'kombo', 'burger', 'burgers', 'կոմբո', 'բուրգեր'],
    iconSrc: MOBILE_HOME_ASSETS.catSnack,
  },
  {
    slugs: ['sauces', 'sauce', 'սոուս', 'սոուսներ'],
    iconSrc: MOBILE_HOME_ASSETS.catBurger,
  },
];

function slugKey(value: string): string {
  return value.trim().toLowerCase();
}

function findCategory(
  categories: readonly OrbitSource[],
  slugs: readonly string[],
): OrbitSource | undefined {
  const wanted = new Set(slugs.map(slugKey));
  return categories.find((category) => category.slug && wanted.has(slugKey(category.slug)));
}

/** Puts each arc icon next to the category that owns that icon. */
export function buildMobileOrbitCategories(
  categories: readonly OrbitSource[],
  arcTitles: readonly string[],
  pideLabel: string,
  productsHref: string,
): BuiltOrbitCategory[] {
  return ORBIT_SLOTS.map((slot, index) => {
    const match = findCategory(categories, slot.slugs);
    return {
      id: match?.id ?? `arc-slot-${index}`,
      title: match?.title?.trim() || arcTitles[index] || pideLabel,
      href: match?.href ?? productsHref,
      iconSrc: slot.iconSrc,
    };
  });
}
