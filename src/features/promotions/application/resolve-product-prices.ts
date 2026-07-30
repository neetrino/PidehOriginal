import "server-only";

import { and, eq, inArray, isNull, lte, or, gte } from "drizzle-orm";

import { getDb } from "@/db/client";
import { productCategories, promotions } from "@/db/schema";
import {
  resolveCatalogPrice,
  type ProductAutomaticDiscount,
  type ResolvedCatalogPrice,
} from "@/features/promotions/domain/resolve-automatic-discount";
import { getStoreGlobalDiscount } from "@/features/settings/application/queries";

export type ProductPriceInput = {
  id: string;
  priceAmount: number;
  compareAtAmount?: number | null;
};

function isPromotionActiveNow(
  row: {
    startsAt: Date | null;
    endsAt: Date | null;
  },
  now: Date,
): boolean {
  if (row.startsAt && row.startsAt.getTime() > now.getTime()) return false;
  if (row.endsAt && row.endsAt.getTime() < now.getTime()) return false;
  return true;
}

/**
 * Batch-resolves catalog unit prices with automatic discounts applied.
 * Used by storefront listing, PDP, cart, and checkout.
 */
export async function resolveProductPrices(
  products: ProductPriceInput[],
): Promise<Map<string, ResolvedCatalogPrice>> {
  const result = new Map<string, ResolvedCatalogPrice>();
  if (products.length === 0) {
    return result;
  }

  const productIds = products.map((product) => product.id);
  const now = new Date();
  const [globalDiscount, promoRows, categoryLinks] = await Promise.all([
    getStoreGlobalDiscount(),
    getDb()
      .select({
        discountType: promotions.discountType,
        discountValue: promotions.discountValue,
        productId: promotions.productId,
        categoryId: promotions.categoryId,
        startsAt: promotions.startsAt,
        endsAt: promotions.endsAt,
      })
      .from(promotions)
      .where(
        and(
          eq(promotions.kind, "AUTOMATIC"),
          eq(promotions.isActive, true),
          or(
            isNull(promotions.startsAt),
            lte(promotions.startsAt, now),
          ),
          or(isNull(promotions.endsAt), gte(promotions.endsAt, now)),
        ),
      ),
    getDb()
      .select({
        productId: productCategories.productId,
        categoryId: productCategories.categoryId,
      })
      .from(productCategories)
      .where(inArray(productCategories.productId, productIds)),
  ]);

  const productDiscount = new Map<string, ProductAutomaticDiscount>();
  const categoryPercent = new Map<string, number>();

  for (const promo of promoRows) {
    if (!isPromotionActiveNow(promo, now)) continue;

    if (promo.productId) {
      const current = productDiscount.get(promo.productId);
      // Prefer higher effective cut: keep first product rule; product drawer
      // enforces a single AUTOMATIC product promo.
      if (!current) {
        productDiscount.set(promo.productId, {
          type: promo.discountType,
          value: promo.discountValue,
        });
      }
    }

    if (promo.categoryId && promo.discountType === "PERCENTAGE") {
      const current = categoryPercent.get(promo.categoryId);
      if (current == null || promo.discountValue > current) {
        categoryPercent.set(promo.categoryId, promo.discountValue);
      }
    }
  }

  const categoriesByProduct = new Map<string, string[]>();
  for (const link of categoryLinks) {
    const list = categoriesByProduct.get(link.productId) ?? [];
    list.push(link.categoryId);
    categoriesByProduct.set(link.productId, list);
  }

  for (const product of products) {
    const categoryIds = categoriesByProduct.get(product.id) ?? [];
    const categoryPercents = categoryIds.map(
      (categoryId) => categoryPercent.get(categoryId) ?? null,
    );

    result.set(
      product.id,
      resolveCatalogPrice({
        listAmount: product.priceAmount,
        productDiscount: productDiscount.get(product.id) ?? null,
        categoryPercents,
        globalPercent: globalDiscount.percentage,
        manualCompareAtAmount: product.compareAtAmount ?? null,
      }),
    );
  }

  return result;
}

/** Resolves one product price (convenience wrapper). */
export async function resolveProductPrice(
  product: ProductPriceInput,
): Promise<ResolvedCatalogPrice> {
  const map = await resolveProductPrices([product]);
  return (
    map.get(product.id) ??
    resolveCatalogPrice({
      listAmount: product.priceAmount,
      manualCompareAtAmount: product.compareAtAmount ?? null,
    })
  );
}
