"use server";

import { z } from "zod";

import { reverseGeocode } from "@/lib/maps/google-maps";
import { logger } from "@/lib/observability/logger";

const reverseGeocodeSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
});

export type ReverseGeocodeAddressResult =
  | {
      ok: true;
      formattedAddress: string;
      lat: number;
      lng: number;
    }
  | { ok: false; error: string };

/** Resolves a map pin to a formatted delivery address. */
export async function reverseGeocodeAddressAction(
  raw: z.infer<typeof reverseGeocodeSchema>,
): Promise<ReverseGeocodeAddressResult> {
  const parsed = reverseGeocodeSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Invalid map coordinates." };
  }

  try {
    const result = await reverseGeocode(parsed.data);
    return {
      ok: true,
      formattedAddress: result.formattedAddress,
      lat: result.location.lat,
      lng: result.location.lng,
    };
  } catch (error) {
    logger.warn("delivery.reverse_geocode_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to resolve address for this map point.",
    };
  }
}
