import "server-only";

import { and, eq, isNull, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { getDb } from "@/db/client";
import { products } from "@/db/schema";
import {
  CACHE_TAGS,
  PUBLIC_CACHE_REVALIDATE_SECONDS,
} from "@/lib/cache/tags";
import { getCheckoutRateSnapshot } from "@/lib/fx/service";
import { convertAmount } from "@/lib/money/convert";
import type { Currency } from "@/lib/money/currency";
import { defaultCurrency } from "@/lib/money/currency";
import { getCurrencyMeta } from "@/lib/money/currency-meta";

export type CatalogPriceBounds = {
  /** Inclusive floor in display-currency major units. */
  min: number;
  /** Inclusive ceiling in display-currency major units. */
  max: number;
};

const EMPTY_CATALOG_BOUNDS: CatalogPriceBounds = { min: 0, max: 1 };

function amdToDisplayMajor(
  amdAmount: number,
  displayCurrency: Currency,
  rate: string,
  mode: "floor" | "ceil",
): number {
  const minor = convertAmount(
    amdAmount,
    rate,
    defaultCurrency,
    displayCurrency,
  ).amount;
  const scale = getCurrencyMeta(displayCurrency).scale;
  if (scale === 0) {
    return Number(minor);
  }

  const major = Number(minor) / 10 ** scale;
  return mode === "ceil" ? Math.ceil(major) : Math.floor(major);
}

async function loadCatalogPriceBounds(
  displayCurrency: Currency,
): Promise<CatalogPriceBounds> {
  const [[row], quote] = await Promise.all([
    getDb()
      .select({
        min: sql<number>`coalesce(min(${products.priceAmount}), 0)::int`,
        max: sql<number>`coalesce(max(${products.priceAmount}), 0)::int`,
      })
      .from(products)
      .where(
        and(eq(products.status, "ACTIVE"), isNull(products.deletedAt)),
      ),
    getCheckoutRateSnapshot(displayCurrency),
  ]);

  const minAmd = row?.min ?? 0;
  const maxAmd = row?.max ?? 0;

  if (maxAmd <= 0) {
    return EMPTY_CATALOG_BOUNDS;
  }

  const min = amdToDisplayMajor(minAmd, displayCurrency, quote.rate, "floor");
  let max = amdToDisplayMajor(maxAmd, displayCurrency, quote.rate, "ceil");
  if (max <= min) {
    max = min + 1;
  }

  return { min: Math.max(0, min), max };
}

/** Active catalog min/max prices in the shopper's display currency (major units). */
export async function getCatalogPriceBounds(
  displayCurrency: Currency,
): Promise<CatalogPriceBounds> {
  return unstable_cache(
    async () => loadCatalogPriceBounds(displayCurrency),
    ["catalog-price-bounds", displayCurrency],
    {
      tags: [CACHE_TAGS.products],
      revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    },
  )();
}
