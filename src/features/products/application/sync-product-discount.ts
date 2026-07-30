import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { getDb } from "@/db/client";
import { promotions } from "@/db/schema";
import type {
  AdminProductDiscount,
  ProductDiscountDraft,
} from "@/features/products/types/product-discount";
import { createId } from "@/lib/id";

/** Loads the product-scoped AUTOMATIC promotion, if any. */
export async function getProductDiscount(
  productId: string,
): Promise<AdminProductDiscount | null> {
  const [row] = await getDb()
    .select({
      discountType: promotions.discountType,
      discountValue: promotions.discountValue,
      startsAt: promotions.startsAt,
      endsAt: promotions.endsAt,
      isActive: promotions.isActive,
    })
    .from(promotions)
    .where(
      and(
        eq(promotions.kind, "AUTOMATIC"),
        eq(promotions.productId, productId),
        isNull(promotions.categoryId),
      ),
    )
    .limit(1);

  if (!row || !row.isActive) return null;

  return {
    type: row.discountType,
    value: row.discountValue,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
  };
}

/** Batch-loads product discounts for admin list rows. */
export async function loadProductDiscounts(
  productIds: string[],
): Promise<Map<string, AdminProductDiscount>> {
  const map = new Map<string, AdminProductDiscount>();
  if (productIds.length === 0) return map;

  const rows = await getDb()
    .select({
      productId: promotions.productId,
      discountType: promotions.discountType,
      discountValue: promotions.discountValue,
      startsAt: promotions.startsAt,
      endsAt: promotions.endsAt,
      isActive: promotions.isActive,
    })
    .from(promotions)
    .where(
      and(
        eq(promotions.kind, "AUTOMATIC"),
        isNull(promotions.categoryId),
        eq(promotions.isActive, true),
      ),
    );

  const idSet = new Set(productIds);
  for (const row of rows) {
    if (!row.productId || !idSet.has(row.productId)) continue;
    map.set(row.productId, {
      type: row.discountType,
      value: row.discountValue,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
    });
  }
  return map;
}

/**
 * Creates, updates, or clears the product AUTOMATIC discount.
 * Empty/zero draft clears the promotion.
 */
export async function syncProductDiscount(
  productId: string,
  draft: ProductDiscountDraft | null,
): Promise<string | null> {
  const [existing] = await getDb()
    .select({ id: promotions.id })
    .from(promotions)
    .where(
      and(
        eq(promotions.kind, "AUTOMATIC"),
        eq(promotions.productId, productId),
        isNull(promotions.categoryId),
      ),
    )
    .limit(1);

  if (!draft || draft.value <= 0) {
    if (existing) {
      await getDb().delete(promotions).where(eq(promotions.id, existing.id));
    }
    return null;
  }

  if (draft.type === "PERCENTAGE" && (draft.value < 1 || draft.value > 100)) {
    return "Percentage discount must be between 1 and 100.";
  }

  if (draft.startsAt && draft.endsAt) {
    const start = new Date(draft.startsAt);
    const end = new Date(draft.endsAt);
    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end.getTime() <= start.getTime()
    ) {
      return "Discount end must be after start.";
    }
  }

  const startsAt = draft.startsAt ? new Date(draft.startsAt) : null;
  const endsAt = draft.endsAt ? new Date(draft.endsAt) : null;
  const now = new Date();

  if (existing) {
    await getDb()
      .update(promotions)
      .set({
        discountType: draft.type,
        discountValue: draft.value,
        startsAt,
        endsAt,
        isActive: true,
        priority: 10,
        updatedAt: now,
      })
      .where(eq(promotions.id, existing.id));
    return null;
  }

  await getDb().insert(promotions).values({
    id: createId(),
    kind: "AUTOMATIC",
    code: null,
    productId,
    categoryId: null,
    discountType: draft.type,
    discountValue: draft.value,
    startsAt,
    endsAt,
    isActive: true,
    priority: 10,
    allowStacking: false,
  });

  return null;
}
