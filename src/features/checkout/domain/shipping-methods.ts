export const CHECKOUT_SHIPPING_METHODS = ["delivery", "pickup"] as const;

export type CheckoutShippingMethod = (typeof CHECKOUT_SHIPPING_METHODS)[number];

export function isCheckoutShippingMethod(
  value: string,
): value is CheckoutShippingMethod {
  return (CHECKOUT_SHIPPING_METHODS as readonly string[]).includes(value);
}

/** Canonical order snapshot label for store pickup (admin drawer detection). */
export const STORE_PICKUP_LABEL = "Store pickup";
