/** Default on-hand quantity for new products and auto-replenish target. */
export const DEFAULT_PRODUCT_STOCK_ON_HAND = 100_000;

/**
 * After a sale, when remaining stock reaches this level (inclusive),
 * inventory is topped up back to {@link DEFAULT_PRODUCT_STOCK_ON_HAND}.
 */
export const PRODUCT_STOCK_REPLENISH_AT = 10_000;

/**
 * Applies post-sale auto-replenish: if remaining stock is at or below the
 * threshold, reset to the default on-hand quantity.
 */
export function resolveStockAfterSale(remainingAfterSale: number): {
  stockOnHand: number;
  replenished: boolean;
  refillDelta: number;
} {
  if (remainingAfterSale > PRODUCT_STOCK_REPLENISH_AT) {
    return { stockOnHand: remainingAfterSale, replenished: false, refillDelta: 0 };
  }

  const refillDelta = DEFAULT_PRODUCT_STOCK_ON_HAND - remainingAfterSale;
  return {
    stockOnHand: DEFAULT_PRODUCT_STOCK_ON_HAND,
    replenished: true,
    refillDelta,
  };
}
