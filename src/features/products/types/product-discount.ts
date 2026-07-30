export type ProductDiscountType = "PERCENTAGE" | "FIXED";

export type ProductDiscountDraft = {
  type: ProductDiscountType;
  value: number;
  startsAt: string | null;
  endsAt: string | null;
};

export type AdminProductDiscount = {
  type: ProductDiscountType;
  value: number;
  startsAt: Date | null;
  endsAt: Date | null;
};
