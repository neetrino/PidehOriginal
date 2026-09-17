import { readFileSync } from "node:fs";
import path from "node:path";

import { z } from "zod";

import type { LocaleTranslation, TranslationsJson } from "@/db/schema/catalog";

const EXPECTED_CATEGORY_COUNT = 5;
const EXPECTED_PRODUCT_COUNT = 34;

const marketingStatusSchema = z.enum([
  "HIT",
  "NEW",
  "CLASSIC",
  "BANNER",
  "REGULAR",
]);

const categorySeedSchema = z.object({
  slug: z.string().min(1),
  nameHy: z.string().min(1),
  nameEn: z.string().min(1),
  nameRu: z.string().min(1),
  descriptionRu: z.string().min(1),
  isActive: z.literal(true),
  sortOrder: z.number().int().positive(),
});

const productSeedSchema = z.object({
  slug: z.string().min(1),
  categorySlug: z.string().min(1),
  status: marketingStatusSchema,
  price: z.number().int().nonnegative(),
  isAvailable: z.literal(true),
  nameRu: z.string().min(1),
  descriptionRu: z.string().min(1),
  ingredientsRu: z.array(z.string().min(1)).min(1),
  nameHy: z.string().min(1),
  descriptionHy: z.string().min(1),
  ingredientsHy: z.array(z.string().min(1)).min(1),
  nameEn: z.string().min(1),
  descriptionEn: z.string().min(1),
  ingredientsEn: z.array(z.string().min(1)).min(1),
});

const catalogSeedSchema = z.object({
  categories: z.array(categorySeedSchema).length(EXPECTED_CATEGORY_COUNT),
  products: z.array(productSeedSchema).length(EXPECTED_PRODUCT_COUNT),
});

export type MarketingStatus = z.infer<typeof marketingStatusSchema>;
export type CategorySeed = z.infer<typeof categorySeedSchema>;
export type ProductSeed = z.infer<typeof productSeedSchema>;
export type PidehCatalogSeed = z.infer<typeof catalogSeedSchema>;

export type MarketingBadge = {
  badge: Partial<Record<"hy" | "en" | "ru", string>>;
  featured: boolean;
};

function formatDescription(description: string, ingredients: string[]): string {
  return `${description}\n\n${ingredients.join(", ")}`;
}

function localeBlock(
  title: string,
  slug: string,
  description: string,
  ingredients: string[],
): LocaleTranslation {
  return {
    title,
    slug,
    description: formatDescription(description, ingredients),
  };
}

/** Load the canonical Pideh Armenia catalog JSON and enforce 5/34 uniqueness. */
export function loadPidehCatalog(): PidehCatalogSeed {
  const fullPath = path.join(
    process.cwd(),
    "src/db/seed/pideh-armenia-catalog.json",
  );
  const parsed = catalogSeedSchema.parse(
    JSON.parse(readFileSync(fullPath, "utf8")) as unknown,
  );
  const slugs = parsed.products.map((item) => item.slug);
  if (new Set(slugs).size !== slugs.length) {
    throw new Error("Pideh catalog product slugs must be unique");
  }
  return parsed;
}

export function categoryTranslations(item: CategorySeed): TranslationsJson {
  return {
    hy: { title: item.nameHy, slug: item.slug },
    en: { title: item.nameEn, slug: item.slug },
    ru: {
      title: item.nameRu,
      slug: item.slug,
      description: item.descriptionRu,
    },
  };
}

export function productTranslations(item: ProductSeed): TranslationsJson {
  return {
    hy: localeBlock(
      item.nameHy,
      item.slug,
      item.descriptionHy,
      item.ingredientsHy,
    ),
    en: localeBlock(
      item.nameEn,
      item.slug,
      item.descriptionEn,
      item.ingredientsEn,
    ),
    ru: localeBlock(
      item.nameRu,
      item.slug,
      item.descriptionRu,
      item.ingredientsRu,
    ),
  };
}

export function marketingBadge(status: MarketingStatus): MarketingBadge | null {
  if (status === "REGULAR") {
    return null;
  }
  return {
    badge: { hy: status, en: status, ru: status },
    featured: status === "HIT" || status === "BANNER",
  };
}

export function skuFromSlug(slug: string): string {
  return `PIDEH-${slug}`.toUpperCase().slice(0, 64);
}

/** Stable R2 key per unique catalog slug. */
export function catalogProductObjectKey(slug: string): string {
  return `catalog/products/${slug}.webp`;
}
