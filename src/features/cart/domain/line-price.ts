import { sumAdditionPrices } from "@/features/products/domain/modifier-selection";

type PricedModifier = {
  kind: "ADDITION" | "EXCEPTION";
  priceAmount: number;
};

/** Product sale unit + selected addition prices. */
export function cartLineUnitAmount(
  productUnitAmount: number,
  modifiers: ReadonlyArray<PricedModifier>,
): number {
  return productUnitAmount + sumAdditionPrices(modifiers);
}
