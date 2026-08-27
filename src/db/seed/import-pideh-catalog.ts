/**
 * Imports the Pideh Armenia catalog from legacy seed JSON
 * (https://github.com/neetrino/pideh-armenia data/).
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";
import { getSeedEnv } from "@/db/seed/env";
import { createId } from "@/lib/id";

const DATA_DIR = path.join(process.cwd(), "src/db/seed");

const CATEGORY_SLUG_BY_RU: Record<
  string,
  { slug: string; hy: string; en: string; sortOrder: number }
> = {
  Комбо: { slug: "combo", hy: "Կոմբո", en: "Combo", sortOrder: 1 },
  Пиде: { slug: "pide", hy: "Փիդե", en: "Pide", sortOrder: 2 },
  Снэк: { slug: "snack", hy: "Սնэք", en: "Snacks", sortOrder: 3 },
  Соусы: { slug: "sauces", hy: "Սոուսներ", en: "Sauces", sortOrder: 4 },
  Напитки: { slug: "drinks", hy: "Խմիչքներ", en: "Drinks", sortOrder: 5 },
};

/** Featured / badge mapping from legacy pideh-armenia seed. */
const PRODUCT_BADGE_BY_SLUG: Record<
  string,
  { badge: Partial<Record<"hy" | "en" | "ru", string>>; featured: boolean }
> = {
  "2-myasa-pide": {
    badge: { hy: "HIT", en: "HIT", ru: "HIT" },
    featured: true,
  },
  "kombo-ya-odin": {
    badge: { hy: "HIT", en: "HIT", ru: "HIT" },
    featured: true,
  },
  "pepperoni-pide": {
    badge: { hy: "HIT", en: "HIT", ru: "HIT" },
    featured: true,
  },
  "pide-s-basturmoj": {
    badge: { hy: "Նոր", en: "NEW", ru: "NEW" },
    featured: false,
  },
  "kombo-my-vdvoyom": {
    badge: { hy: "Նոր", en: "NEW", ru: "NEW" },
    featured: false,
  },
  "classic-chees": {
    badge: { hy: "Դասական", en: "CLASSIC", ru: "CLASSIC" },
    featured: false,
  },
  "ovoshchnoe-pide": {
    badge: { hy: "Դասական", en: "CLASSIC", ru: "CLASSIC" },
    featured: false,
  },
  "pide-s-govyadinoj": {
    badge: { hy: "Banner", en: "Banner", ru: "Banner" },
    featured: true,
  },
};

type ProductSeed = {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  ingredients: string[];
  isAvailable: boolean;
};

type TranslationSeed = {
  name: string;
  description: string;
  ingredients: string[];
};

type TranslationsMap = Record<
  string,
  { hy: TranslationSeed; en: TranslationSeed }
>;

function productSlugFromImage(imagePath: string): string {
  const file = path.basename(imagePath);
  const withoutExt = file.replace(/\.(png|jpg|jpeg|webp)$/i, "");
  return withoutExt.replace(/-Photoroom$/i, "");
}

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

function allocateUniqueSlug(
  baseSlug: string,
  enTitle: string,
  used: Set<string>,
): string {
  if (!used.has(baseSlug)) {
    used.add(baseSlug);
    return baseSlug;
  }

  const fromTitle = slugifyTitle(enTitle) || `${baseSlug}-item`;
  let candidate = fromTitle;
  let index = 2;
  while (used.has(candidate)) {
    candidate = `${fromTitle}-${index}`;
    index += 1;
  }
  used.add(candidate);
  return candidate;
}

function objectKeyFromPublicUrl(url: string): string {
  const parsed = new URL(url);
  return parsed.pathname.replace(/^\//, "");
}

/** Keeps the R2 path unique per product while still resolving on the CDN. */
function uniqueObjectKey(baseKey: string, productId: string): string {
  return `${baseKey}?p=${productId}`;
}

function formatDescription(
  description: string,
  ingredients: string[],
): string {
  if (ingredients.length === 0) {
    return description;
  }
  return `${description}\n\n${ingredients.join(", ")}`;
}

function loadJson<T>(fileName: string): T {
  const fullPath = path.join(DATA_DIR, fileName);
  return JSON.parse(readFileSync(fullPath, "utf8")) as T;
}

async function importCatalog(): Promise<void> {
  const env = getSeedEnv();
  const db = drizzle(neon(env.DATABASE_URL), { schema });

  const productsData = loadJson<ProductSeed[]>("buy-am-products.json");
  const translations = loadJson<TranslationsMap>("product-translations.json");
  const imageMap = loadJson<Record<string, string>>("image-map.json");

  // Full catalog reset so re-runs are idempotent.
  await db.delete(schema.mediaAssets);
  await db.delete(schema.productCategories);
  await db.delete(schema.products);
  await db.delete(schema.categories);

  const categoryIdBySlug = new Map<string, string>();

  for (const [ruName, meta] of Object.entries(CATEGORY_SLUG_BY_RU)) {
    const id = createId();
    await db.insert(schema.categories).values({
      id,
      translations: {
        hy: {
          title: meta.hy,
          slug: meta.slug,
          description: `${meta.hy} կատեգորիա`,
        },
        en: {
          title: meta.en,
          slug: meta.slug,
          description: `${meta.en} category`,
        },
        ru: {
          title: ruName,
          slug: meta.slug,
          description: `Категория ${ruName}`,
        },
      },
      sortOrder: meta.sortOrder,
      status: "ACTIVE",
    });
    categoryIdBySlug.set(meta.slug, id);
  }

  let imported = 0;
  let skipped = 0;
  const usedSlugs = new Set<string>();

  for (const item of productsData) {
    const categoryMeta = CATEGORY_SLUG_BY_RU[item.category];
    const categoryId = categoryMeta
      ? categoryIdBySlug.get(categoryMeta.slug)
      : undefined;
    if (!categoryId) {
      console.warn(`Skip (no category): ${item.name}`);
      skipped += 1;
      continue;
    }

    const imageUrl = imageMap[item.image];
    if (!imageUrl) {
      console.warn(`Skip (no R2 mapping): ${item.name}`);
      skipped += 1;
      continue;
    }

    const localized = translations[item.name];
    if (!localized) {
      console.warn(`Skip (no hy/en map): ${item.name}`);
      skipped += 1;
      continue;
    }

    const imageSlug = productSlugFromImage(item.image);
    const slug = allocateUniqueSlug(imageSlug, localized.en.name, usedSlugs);
    const badge = PRODUCT_BADGE_BY_SLUG[imageSlug];
    const productId = createId();
    const sku = `PIDEH-${slug}`.toUpperCase().slice(0, 64);

    await db.insert(schema.products).values({
      id: productId,
      sku,
      translations: {
        hy: {
          title: localized.hy.name,
          slug,
          description: formatDescription(
            localized.hy.description,
            localized.hy.ingredients,
          ),
        },
        en: {
          title: localized.en.name,
          slug,
          description: formatDescription(
            localized.en.description,
            localized.en.ingredients,
          ),
        },
        ru: {
          title: item.name,
          slug,
          description: formatDescription(item.description, item.ingredients),
        },
      },
      priceAmount: Math.round(item.price),
      stockOnHand: item.isAvailable ? 100 : 0,
      lowStockThreshold: 5,
      status: item.isAvailable ? "ACTIVE" : "ARCHIVED",
      isFeatured: badge?.featured ?? false,
      badgeTranslations: badge?.badge,
      badgeStyle: badge ? "solid" : null,
      badgePosition: badge ? "top-left" : null,
    });

    await db.insert(schema.productCategories).values({
      id: createId(),
      productId,
      categoryId,
      isPrimary: true,
      sortOrder: imported,
    });

    const baseObjectKey = objectKeyFromPublicUrl(imageUrl);
    const objectKey = uniqueObjectKey(baseObjectKey, productId);
    await db.insert(schema.mediaAssets).values({
      id: createId(),
      objectKey,
      mimeType: baseObjectKey.endsWith(".png") ? "image/png" : "image/webp",
      byteSize: 0,
      uploadStatus: "READY",
      role: "PRIMARY",
      sortOrder: 0,
      isPrimary: true,
      productId,
      altTranslations: {
        hy: localized.hy.name,
        en: localized.en.name,
        ru: item.name,
      },
    });

    imported += 1;
  }

  await db
    .insert(schema.storeSettings)
    .values({
      key: "store.identity",
      value: {
        version: 1,
        name: "Pideh Armenia",
        defaultLocale: "hy",
        defaultCurrency: "AMD",
      },
    })
    .onConflictDoUpdate({
      target: schema.storeSettings.key,
      set: {
        value: {
          version: 1,
          name: "Pideh Armenia",
          defaultLocale: "hy",
          defaultCurrency: "AMD",
        },
        updatedAt: new Date(),
      },
    });

  console.info(
    JSON.stringify({
      level: "info",
      message: "import-pideh-catalog.complete",
      imported,
      skipped,
      categories: categoryIdBySlug.size,
    }),
  );
}

importCatalog().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(
    JSON.stringify({
      level: "error",
      message: "import-pideh-catalog.failed",
      error: message,
    }),
  );
  process.exitCode = 1;
});
