/**
 * Picks the object key for an order-line image: immutable snapshot first,
 * then live product primary media (for legacy rows missing a snapshot).
 */
export function resolveOrderItemImageObjectKey(input: {
  productImageKeySnapshot: string | null | undefined;
  productId: string | null | undefined;
  liveObjectKeyByProductId: ReadonlyMap<string, string>;
}): string | null {
  if (input.productImageKeySnapshot) {
    return input.productImageKeySnapshot;
  }
  if (!input.productId) {
    return null;
  }
  return input.liveObjectKeyByProductId.get(input.productId) ?? null;
}
