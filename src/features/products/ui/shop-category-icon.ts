import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";

export type ShopCategoryIcon = {
  src: string;
  width: number;
  height: number;
};

const ALL_ICON: ShopCategoryIcon = {
  src: PIDEH_ASSETS.shopCatAll,
  width: 36,
  height: 36,
};

const ICONS = {
  combo: { src: PIDEH_ASSETS.shopCatCombo, width: 48, height: 44 },
  pide: { src: PIDEH_ASSETS.shopCatPide, width: 66, height: 34 },
  snack: { src: PIDEH_ASSETS.shopCatSnack, width: 41, height: 38 },
  sauces: { src: PIDEH_ASSETS.shopCatSauces, width: 41, height: 33 },
  drinks: { src: PIDEH_ASSETS.shopCatDrinks, width: 26, height: 45 },
} as const satisfies Record<string, ShopCategoryIcon>;

type NamedIconKey = keyof typeof ICONS;

const SLUG_TO_ICON: Record<string, NamedIconKey> = {
  combo: "combo",
  combos: "combo",
  kombo: "combo",
  pide: "pide",
  snack: "snack",
  snacks: "snack",
  appetizer: "snack",
  sauces: "sauces",
  sauce: "sauces",
  drinks: "drinks",
  drink: "drinks",
  beverages: "drinks",
};

/** Figma Shop category glyph for a catalog slug, or the All glyph. */
export function shopCategoryIcon(slug: string | "all"): ShopCategoryIcon {
  if (slug === "all") {
    return ALL_ICON;
  }

  const key = SLUG_TO_ICON[slug.trim().toLowerCase()];
  return key ? ICONS[key] : ALL_ICON;
}
