import "server-only";

import { and, asc, eq, inArray, or } from "drizzle-orm";

import { getDb } from "@/db/client";
import { mediaAssets, products } from "@/db/schema";
import { resolveProductPrices } from "@/features/promotions/application/resolve-product-prices";
import type { CatalogProduct } from "@/features/products/types";
import type { Locale } from "@/lib/i18n/config";
import { mediaPublicUrl } from "@/lib/media/public-url";

function toCatalogProduct(
  product: typeof products.$inferSelect,
  locale: Locale,
  imageUrl: string | null = null,
): Omit<
  CatalogProduct,
  "priceAmount" | "compareAtAmount" | "discountPercent" | "listPriceAmount"
> | null {
  const translation = product.translations[locale] ?? product.translations.hy;
  if (!translation) {
    return null;
  }

  return {
    id: product.id,
    sku: product.sku,
    stockOnHand: product.stockOnHand,
    translation,
    imageUrl,
  };
}

async function loadPrimaryProductImages(
  productIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (productIds.length === 0) {
    return map;
  }

  const rows = await getDb()
    .select({
      productId: mediaAssets.productId,
      objectKey: mediaAssets.objectKey,
      isPrimary: mediaAssets.isPrimary,
      role: mediaAssets.role,
      sortOrder: mediaAssets.sortOrder,
    })
    .from(mediaAssets)
    .where(
      and(
        inArray(mediaAssets.productId, productIds),
        eq(mediaAssets.uploadStatus, "READY"),
        or(eq(mediaAssets.isPrimary, true), eq(mediaAssets.role, "PRIMARY")),
      ),
    )
    .orderBy(asc(mediaAssets.sortOrder));

  for (const row of rows) {
    if (!row.productId || map.has(row.productId)) {
      continue;
    }
    map.set(row.productId, mediaPublicUrl(row.objectKey));
  }

  return map;
}

/** Attaches primary image URLs and resolved sale prices to product rows. */
export async function enrichCatalogProducts(
  rows: Array<typeof products.$inferSelect>,
  locale: Locale,
): Promise<CatalogProduct[]> {
  const productIds = rows.map((row) => row.id);
  const [images, prices] = await Promise.all([
    loadPrimaryProductImages(productIds),
    resolveProductPrices(
      rows.map((row) => ({
        id: row.id,
        priceAmount: row.priceAmount,
        compareAtAmount: row.compareAtAmount,
      })),
    ),
  ]);

  return rows
    .map((product) => {
      const base = toCatalogProduct(
        product,
        locale,
        images.get(product.id) ?? null,
      );
      if (!base) return null;

      const resolved = prices.get(product.id);
      return {
        ...base,
        listPriceAmount: resolved?.listAmount ?? product.priceAmount,
        priceAmount: resolved?.unitAmount ?? product.priceAmount,
        compareAtAmount: resolved?.compareAtAmount ?? null,
        discountPercent: resolved?.discountPercent ?? null,
      } satisfies CatalogProduct;
    })
    .filter((product): product is CatalogProduct => product !== null);
}
