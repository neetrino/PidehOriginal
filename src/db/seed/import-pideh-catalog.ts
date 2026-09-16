/**
 * Upserts the canonical Pideh Armenia catalog (5 categories, 34 products).
 */
import { eq, sql } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";
import { getSeedEnv } from "@/db/seed/env";
import {
  catalogProductObjectKey,
  categoryTranslations,
  loadPidehCatalog,
  marketingBadge,
  productTranslations,
  skuFromSlug,
  type CategorySeed,
  type ProductSeed,
} from "@/db/seed/pideh-catalog";
import { headCatalogProductImage } from "@/db/seed/r2-catalog-images";
import { createId } from "@/lib/id";

type SeedDb = NeonHttpDatabase<typeof schema>;

async function findProductIdBySlug(
  db: SeedDb,
  slug: string,
): Promise<string | undefined> {
  const [row] = await db
    .select({ id: schema.products.id })
    .from(schema.products)
    .where(
      sql`(
        ${schema.products.translations}->'hy'->>'slug' = ${slug}
        OR ${schema.products.translations}->'en'->>'slug' = ${slug}
        OR ${schema.products.translations}->'ru'->>'slug' = ${slug}
      )`,
    )
    .limit(1);
  return row?.id;
}

async function findCategoryIdBySlug(
  db: SeedDb,
  slug: string,
): Promise<string | undefined> {
  const [row] = await db
    .select({ id: schema.categories.id })
    .from(schema.categories)
    .where(
      sql`(
        ${schema.categories.translations}->'hy'->>'slug' = ${slug}
        OR ${schema.categories.translations}->'en'->>'slug' = ${slug}
        OR ${schema.categories.translations}->'ru'->>'slug' = ${slug}
      )`,
    )
    .limit(1);
  return row?.id;
}

async function upsertCategory(
  db: SeedDb,
  item: CategorySeed,
): Promise<string> {
  const existingId = await findCategoryIdBySlug(db, item.slug);
  const id = existingId ?? createId();
  const values = {
    translations: categoryTranslations(item),
    sortOrder: item.sortOrder,
    status: item.isActive ? ("ACTIVE" as const) : ("ARCHIVED" as const),
    deletedAt: null,
    updatedAt: new Date(),
  };

  if (existingId) {
    await db
      .update(schema.categories)
      .set(values)
      .where(eq(schema.categories.id, existingId));
    return existingId;
  }

  await db.insert(schema.categories).values({ id, ...values });
  return id;
}

async function upsertProductRow(
  db: SeedDb,
  item: ProductSeed,
): Promise<string> {
  const existingId = await findProductIdBySlug(db, item.slug);
  const id = existingId ?? createId();
  const badge = marketingBadge(item.status);
  const values = {
    sku: skuFromSlug(item.slug),
    translations: productTranslations(item),
    priceAmount: item.price,
    stockOnHand: item.isAvailable ? 100 : 0,
    lowStockThreshold: 5,
    status: item.isAvailable ? ("ACTIVE" as const) : ("ARCHIVED" as const),
    isFeatured: badge?.featured ?? false,
    badgeTranslations: badge?.badge ?? null,
    badgeStyle: badge ? "solid" : null,
    badgePosition: badge ? "top-left" : null,
    deletedAt: null,
    updatedAt: new Date(),
  };

  if (existingId) {
    await db
      .update(schema.products)
      .set(values)
      .where(eq(schema.products.id, existingId));
    return existingId;
  }

  await db.insert(schema.products).values({ id, ...values });
  return id;
}

async function upsertProductCategory(
  db: SeedDb,
  productId: string,
  categoryId: string,
  sortOrder: number,
): Promise<void> {
  await db
    .delete(schema.productCategories)
    .where(eq(schema.productCategories.productId, productId));
  await db.insert(schema.productCategories).values({
    id: createId(),
    productId,
    categoryId,
    isPrimary: true,
    sortOrder,
  });
}

async function upsertProductMedia(
  db: SeedDb,
  productId: string,
  item: ProductSeed,
): Promise<void> {
  await db
    .delete(schema.mediaAssets)
    .where(eq(schema.mediaAssets.productId, productId));
  const destKey = catalogProductObjectKey(item.slug);
  const stored = await headCatalogProductImage(destKey);
  await db.insert(schema.mediaAssets).values({
    id: createId(),
    objectKey: destKey,
    mimeType: "image/webp",
    byteSize: stored.byteSize,
    uploadStatus: "READY",
    role: "PRIMARY",
    sortOrder: 0,
    isPrimary: true,
    productId,
    altTranslations: {
      hy: item.nameHy,
      en: item.nameEn,
      ru: item.nameRu,
    },
  });
}

async function upsertStoreIdentity(db: SeedDb): Promise<void> {
  const value = {
    version: 1,
    name: "Pideh Armenia",
    defaultLocale: "hy",
    defaultCurrency: "AMD",
  };
  await db
    .insert(schema.storeSettings)
    .values({ key: "store.identity", value })
    .onConflictDoUpdate({
      target: schema.storeSettings.key,
      set: { value, updatedAt: new Date() },
    });
}

function printCatalogTable(
  rows: Array<{
    slug: string;
    price: number;
    categorySlug: string;
    status: string;
    objectKey: string;
  }>,
): void {
  console.info(
    [
      "slug".padEnd(28),
      "price".padStart(6),
      "category".padEnd(8),
      "status".padEnd(8),
      "objectKey",
    ].join("  "),
  );
  for (const row of rows) {
    console.info(
      [
        row.slug.padEnd(28),
        String(row.price).padStart(6),
        row.categorySlug.padEnd(8),
        row.status.padEnd(8),
        row.objectKey,
      ].join("  "),
    );
  }
}

async function importCatalog(): Promise<void> {
  const env = getSeedEnv();
  const catalog = loadPidehCatalog();
  const db = drizzle(neon(env.DATABASE_URL), { schema });

  const categoryIdBySlug = new Map<string, string>();
  for (const category of catalog.categories) {
    const id = await upsertCategory(db, category);
    categoryIdBySlug.set(category.slug, id);
  }

  const report: Array<{
    slug: string;
    price: number;
    categorySlug: string;
    status: string;
    objectKey: string;
  }> = [];

  for (const [index, item] of catalog.products.entries()) {
    const categoryId = categoryIdBySlug.get(item.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category for slug ${item.categorySlug}`);
    }
    const productId = await upsertProductRow(db, item);
    await upsertProductCategory(db, productId, categoryId, index);
    await upsertProductMedia(db, productId, item);
    report.push({
      slug: item.slug,
      price: item.price,
      categorySlug: item.categorySlug,
      status: item.status,
      objectKey: catalogProductObjectKey(item.slug),
    });
  }

  await upsertStoreIdentity(db);

  const productCountRows = await db
    .select({ productCount: sql<number>`count(*)::int` })
    .from(schema.products);
  const categoryCountRows = await db
    .select({ categoryCount: sql<number>`count(*)::int` })
    .from(schema.categories);
  const productCount = productCountRows[0]?.productCount ?? 0;
  const categoryCount = categoryCountRows[0]?.categoryCount ?? 0;

  printCatalogTable(report);
  console.info(
    JSON.stringify({
      level: "info",
      message: "import-pideh-catalog.complete",
      categories: catalog.categories.length,
      products: catalog.products.length,
      dbCategories: categoryCount,
      dbProducts: productCount,
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
