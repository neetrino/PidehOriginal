import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PRODUCT_STOCK_ON_HAND,
  PRODUCT_STOCK_REPLENISH_AT,
  resolveStockAfterSale,
} from '@/features/products/domain/stock-levels';

describe('resolveStockAfterSale', () => {
  it('keeps stock unchanged when above the replenish threshold', () => {
    const remaining = PRODUCT_STOCK_REPLENISH_AT + 1;
    expect(resolveStockAfterSale(remaining)).toEqual({
      stockOnHand: remaining,
      replenished: false,
      refillDelta: 0,
    });
  });

  it('replenishes when stock equals the threshold', () => {
    expect(resolveStockAfterSale(PRODUCT_STOCK_REPLENISH_AT)).toEqual({
      stockOnHand: DEFAULT_PRODUCT_STOCK_ON_HAND,
      replenished: true,
      refillDelta: DEFAULT_PRODUCT_STOCK_ON_HAND - PRODUCT_STOCK_REPLENISH_AT,
    });
  });

  it('replenishes when stock falls below the threshold', () => {
    expect(resolveStockAfterSale(0)).toEqual({
      stockOnHand: DEFAULT_PRODUCT_STOCK_ON_HAND,
      replenished: true,
      refillDelta: DEFAULT_PRODUCT_STOCK_ON_HAND,
    });
  });
});
