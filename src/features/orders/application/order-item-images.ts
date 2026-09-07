import "server-only";

import { and, asc, eq, inArray, or } from "drizzle-orm";

import { getDb } from "@/db/client";
import { mediaAssets } from "@/db/schema";
import { resolveOrderItemImageObjectKey } from "@/features/orders/domain/order-item-image";
import { mediaPublicUrl } from "@/lib/media/public-url";

/**
 * Loads READY primary image object keys keyed by product id.
 * Prefer `is_primary`, then `role = PRIMARY`, lowest sort order first.
 */
export async function loadPrimaryProductImageObjectKeys(
  productIds: string[],
): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(productIds.filter(Boolean))];
  const map = new Map<string, string>();
  if (uniqueIds.length === 0) {
    return map;
  }

  const rows = await getDb()
    .select({
      productId: mediaAssets.productId,
      objectKey: mediaAssets.objectKey,
    })
    .from(mediaAssets)
    .where(
      and(
        inArray(mediaAssets.productId, uniqueIds),
        eq(mediaAssets.uploadStatus, "READY"),
        or(eq(mediaAssets.isPrimary, true), eq(mediaAssets.role, "PRIMARY")),
      ),
    )
    .orderBy(asc(mediaAssets.sortOrder));

  for (const row of rows) {
    if (!row.productId || map.has(row.productId)) {
      continue;
    }
    map.set(row.productId, row.objectKey);
  }

  return map;
}

/** Resolves a public image URL from an order-line snapshot or live product media. */
export function resolveOrderItemImageUrl(input: {
  productImageKeySnapshot: string | null | undefined;
  productId: string | null | undefined;
  liveObjectKeyByProductId: ReadonlyMap<string, string>;
}): string | null {
  const objectKey = resolveOrderItemImageObjectKey(input);
  return objectKey ? mediaPublicUrl(objectKey) : null;
}
