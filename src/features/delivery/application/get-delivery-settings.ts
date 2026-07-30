import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";

import { getDb } from "@/db/client";
import { storeSettings } from "@/db/schema";
import {
  isDistanceDeliveryReady,
  parseDeliverySettings,
  type StoreDeliverySettings,
} from "@/features/delivery/domain/delivery-settings";

const DELIVERY_SETTING_KEY = "store.delivery";

export type { StoreDeliverySettings };

const loadDeliverySettings = cache(
  async (): Promise<StoreDeliverySettings> => {
    const [row] = await getDb()
      .select({ value: storeSettings.value })
      .from(storeSettings)
      .where(eq(storeSettings.key, DELIVERY_SETTING_KEY))
      .limit(1);

    return parseDeliverySettings(row?.value ?? null);
  },
);

/** Admin + checkout: current distance-delivery configuration. */
export async function getDeliverySettings(): Promise<StoreDeliverySettings> {
  return loadDeliverySettings();
}

/** Whether storefront checkout may offer delivery. */
export async function isCheckoutDistanceDeliveryEnabled(): Promise<boolean> {
  return isDistanceDeliveryReady(await loadDeliverySettings());
}

export { DELIVERY_SETTING_KEY };
