/** Builds a stable cart-line key from selected modifier IDs. */
export function buildModifierSelectionKey(modifierIds: ReadonlyArray<string>): string {
  if (modifierIds.length === 0) return "";
  return [...new Set(modifierIds)].sort().join(",");
}

/** Sums ADDITION unit prices; EXCEPTION prices are ignored (always 0). */
export function sumAdditionPrices(
  modifiers: ReadonlyArray<{ kind: "ADDITION" | "EXCEPTION"; priceAmount: number }>,
): number {
  let total = 0;
  for (const modifier of modifiers) {
    if (modifier.kind === "ADDITION") {
      total += modifier.priceAmount;
    }
  }
  return total;
}
