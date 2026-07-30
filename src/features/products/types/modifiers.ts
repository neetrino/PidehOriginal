export type ProductModifierKind = "ADDITION" | "EXCEPTION";

export type ProductModifierRow = {
  id: string;
  kind: ProductModifierKind;
  name: string;
  priceAmount: number;
  isActive: boolean;
};

export type ProductModifierOption = ProductModifierRow & {
  linked: boolean;
  sortOrder: number;
};
