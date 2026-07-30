/**
 * Pure automatic-discount resolution for catalog and checkout pricing.
 * Precedence: product rule > best category rule > store global %.
 * Product rules may be percentage or fixed AMD amount.
 */

export type AutomaticDiscountSource = "product" | "category" | "global" | null;

export type AutomaticDiscountPick = {
  percent: number | null;
  source: AutomaticDiscountSource;
};

export type ProductAutomaticDiscount =
  | { type: "PERCENTAGE"; value: number }
  | { type: "FIXED"; value: number };

export type ResolvedCatalogPrice = {
  listAmount: number;
  unitAmount: number;
  compareAtAmount: number | null;
  discountPercent: number | null;
  source: AutomaticDiscountSource;
};

function normalizePercent(value: number | null | undefined): number | null {
  if (value == null) return null;
  if (!Number.isInteger(value) || value < 1 || value > 100) return null;
  return value;
}

function normalizeFixed(value: number | null | undefined): number | null {
  if (value == null) return null;
  if (!Number.isInteger(value) || value < 1) return null;
  return value;
}

/** Picks the winning automatic percentage for one product. */
export function pickAutomaticDiscountPercent(input: {
  productPercent?: number | null;
  categoryPercents?: ReadonlyArray<number | null | undefined>;
  globalPercent?: number | null;
}): AutomaticDiscountPick {
  const productPercent = normalizePercent(input.productPercent ?? null);
  if (productPercent != null) {
    return { percent: productPercent, source: "product" };
  }

  const categoryBest = (input.categoryPercents ?? [])
    .map((value) => normalizePercent(value ?? null))
    .filter((value): value is number => value != null)
    .reduce<number | null>(
      (best, value) => (best == null || value > best ? value : best),
      null,
    );

  if (categoryBest != null) {
    return { percent: categoryBest, source: "category" };
  }

  const globalPercent = normalizePercent(input.globalPercent ?? null);
  if (globalPercent != null) {
    return { percent: globalPercent, source: "global" };
  }

  return { percent: null, source: null };
}

/**
 * Applies a percentage to a list price.
 * Sale amount never goes below 0 and never exceeds the list price.
 */
export function applyPercentageToListPrice(
  listAmount: number,
  percent: number | null,
  source: AutomaticDiscountSource = null,
): ResolvedCatalogPrice {
  const safeList = Math.max(0, Math.floor(listAmount));
  const safePercent = normalizePercent(percent);

  if (safePercent == null) {
    return {
      listAmount: safeList,
      unitAmount: safeList,
      compareAtAmount: null,
      discountPercent: null,
      source: null,
    };
  }

  const discount = Math.floor((safeList * safePercent) / 100);
  const unitAmount = Math.max(0, safeList - discount);

  return {
    listAmount: safeList,
    unitAmount,
    compareAtAmount: unitAmount < safeList ? safeList : null,
    discountPercent: safePercent,
    source,
  };
}

/** Applies a fixed AMD amount off the list price. */
export function applyFixedToListPrice(
  listAmount: number,
  fixedAmount: number | null,
  source: AutomaticDiscountSource = "product",
): ResolvedCatalogPrice {
  const safeList = Math.max(0, Math.floor(listAmount));
  const safeFixed = normalizeFixed(fixedAmount);

  if (safeFixed == null) {
    return {
      listAmount: safeList,
      unitAmount: safeList,
      compareAtAmount: null,
      discountPercent: null,
      source: null,
    };
  }

  const unitAmount = Math.max(0, safeList - safeFixed);
  const discountPercent =
    safeList > 0
      ? Math.min(100, Math.round(((safeList - unitAmount) * 100) / safeList))
      : null;

  return {
    listAmount: safeList,
    unitAmount,
    compareAtAmount: unitAmount < safeList ? safeList : null,
    discountPercent:
      discountPercent != null && discountPercent > 0 ? discountPercent : null,
    source: unitAmount < safeList ? source : null,
  };
}

/** Resolves final catalog unit price from list + automatic discount inputs. */
export function resolveCatalogPrice(input: {
  listAmount: number;
  productDiscount?: ProductAutomaticDiscount | null;
  productPercent?: number | null;
  categoryPercents?: ReadonlyArray<number | null | undefined>;
  globalPercent?: number | null;
  /** Manual compare-at from the product row when no automatic discount applies. */
  manualCompareAtAmount?: number | null;
}): ResolvedCatalogPrice {
  if (input.productDiscount?.type === "FIXED") {
    const fixedResolved = applyFixedToListPrice(
      input.listAmount,
      input.productDiscount.value,
      "product",
    );
    if (fixedResolved.source != null) {
      return fixedResolved;
    }
  }

  const productPercent =
    input.productDiscount?.type === "PERCENTAGE"
      ? input.productDiscount.value
      : input.productPercent;

  const picked = pickAutomaticDiscountPercent({
    productPercent,
    categoryPercents: input.categoryPercents,
    globalPercent: input.globalPercent,
  });
  const resolved = applyPercentageToListPrice(
    input.listAmount,
    picked.percent,
    picked.source,
  );

  if (resolved.discountPercent != null) {
    return resolved;
  }

  const manual = input.manualCompareAtAmount;
  if (
    manual != null &&
    Number.isInteger(manual) &&
    manual > resolved.unitAmount
  ) {
    return {
      ...resolved,
      compareAtAmount: manual,
    };
  }

  return resolved;
}
