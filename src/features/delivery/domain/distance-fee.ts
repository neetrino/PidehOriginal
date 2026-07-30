/**
 * Distance-based delivery fee in whole AMD.
 * Uses meters × AMD/km with integer arithmetic, then rounds to nearest dram
 * (fractional kilometers are kept — e.g. 1101 m × 1000 AMD/km → 1101 AMD).
 */
export function calculateDistanceDeliveryFee(
  distanceMeters: number,
  pricePerKmAmount: number,
): number {
  if (
    !Number.isFinite(distanceMeters) ||
    !Number.isFinite(pricePerKmAmount) ||
    distanceMeters < 0 ||
    pricePerKmAmount < 0
  ) {
    throw new Error("Invalid distance fee inputs.");
  }

  const meters = Math.round(distanceMeters);
  const rate = Math.round(pricePerKmAmount);
  return Math.round((meters * rate) / 1000);
}

/** Formats meters as a stable km label for UI/snapshots (3 decimal places). */
export function formatDistanceKmLabel(distanceMeters: number): string {
  const km = Math.round(distanceMeters) / 1000;
  return `${km.toFixed(3)} km`;
}
