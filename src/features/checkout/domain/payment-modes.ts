export const CHECKOUT_ONLINE_PROVIDERS = ["idram", "arca"] as const;

export type CheckoutOnlineProvider = (typeof CHECKOUT_ONLINE_PROVIDERS)[number];
