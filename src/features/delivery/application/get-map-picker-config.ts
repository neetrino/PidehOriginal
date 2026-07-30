"use server";

import { getEnv } from "@/config/env";
import { getDeliverySettings } from "@/features/delivery/application/get-delivery-settings";
import { geocodeAddress } from "@/lib/maps/google-maps";
import { logger } from "@/lib/observability/logger";

const YEREVAN_CENTER = { lat: 40.1792, lng: 44.4991 } as const;

export type MapPickerConfigResult =
  | {
      ok: true;
      apiKey: string;
      center: { lat: number; lng: number };
      zoom: number;
    }
  | { ok: false; error: string };

/**
 * Browser Maps JS config for the address picker.
 * Uses the existing server Maps key (enable Maps JavaScript API on it).
 */
export async function getMapPickerConfigAction(
  addressHint?: string,
): Promise<MapPickerConfigResult> {
  const apiKey = getEnv().GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "Google Maps is not configured.",
    };
  }

  const settings = await getDeliverySettings();
  let center =
    settings.originLat != null && settings.originLng != null
      ? { lat: settings.originLat, lng: settings.originLng }
      : { ...YEREVAN_CENTER };
  let zoom = 13;

  const hint = addressHint?.trim();
  if (hint && hint.length >= 3) {
    try {
      const geocoded = await geocodeAddress(hint);
      center = geocoded.location;
      zoom = 16;
    } catch (error) {
      logger.warn("delivery.map_picker_hint_geocode_failed", {
        message: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  return { ok: true, apiKey, center, zoom };
}
