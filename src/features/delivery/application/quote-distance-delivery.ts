"use server";

import {
  getDeliverySettings,
} from "@/features/delivery/application/get-delivery-settings";
import { isDistanceDeliveryReady } from "@/features/delivery/domain/delivery-settings";
import {
  calculateDistanceDeliveryFee,
  formatDistanceKmLabel,
} from "@/features/delivery/domain/distance-fee";
import {
  quoteDistanceDeliverySchema,
  type DeliveryDestinationPoint,
} from "@/features/delivery/schemas";
import {
  geocodeAddress,
  getDrivingDistanceMeters,
  type GeocodeResult,
} from "@/lib/maps/google-maps";
import { logger } from "@/lib/observability/logger";

export type DistanceDeliveryQuote = {
  distanceMeters: number;
  distanceLabel: string;
  pricePerKmAmount: number;
  deliveryAmount: number;
  destinationFormattedAddress: string;
  city: string | null;
  countryCode: string | null;
};

export type QuoteDistanceDeliveryResult =
  | { ok: true; quote: DistanceDeliveryQuote }
  | { ok: false; error: string };

/**
 * Quotes delivery fee for a destination address using store origin + AMD/km.
 * Prefer map pin coordinates when available — re-geocoding vague labels
 * often resolves to the wrong place.
 */
export async function quoteDistanceDelivery(
  destinationAddress: string,
  destinationPoint?: DeliveryDestinationPoint | null,
): Promise<QuoteDistanceDeliveryResult> {
  const parsed = quoteDistanceDeliverySchema.safeParse({
    line1: destinationAddress,
    lat: destinationPoint?.lat,
    lng: destinationPoint?.lng,
  });
  if (!parsed.success) {
    return { ok: false, error: "Enter a delivery address." };
  }

  const settings = await getDeliverySettings();
  if (!isDistanceDeliveryReady(settings)) {
    return {
      ok: false,
      error: "Delivery is not configured. Choose store pickup.",
    };
  }

  if (
    settings.originLat == null ||
    settings.originLng == null
  ) {
    return { ok: false, error: "Store location is not configured." };
  }

  try {
    const destination = await resolveDestination(
      parsed.data.line1,
      parsed.data.lat != null && parsed.data.lng != null
        ? { lat: parsed.data.lat, lng: parsed.data.lng }
        : null,
    );
    const distance = await getDrivingDistanceMeters(
      { lat: settings.originLat, lng: settings.originLng },
      destination.location,
    );
    const deliveryAmount = calculateDistanceDeliveryFee(
      distance.distanceMeters,
      settings.pricePerKmAmount,
    );

    return {
      ok: true,
      quote: {
        distanceMeters: distance.distanceMeters,
        distanceLabel: formatDistanceKmLabel(distance.distanceMeters),
        pricePerKmAmount: settings.pricePerKmAmount,
        deliveryAmount,
        destinationFormattedAddress: destination.formattedAddress,
        city: destination.city,
        countryCode: destination.countryCode,
      },
    };
  } catch (error) {
    logger.warn("delivery.quote_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to calculate delivery price.",
    };
  }
}

async function resolveDestination(
  line1: string,
  point: DeliveryDestinationPoint | null,
): Promise<GeocodeResult> {
  if (point) {
    return {
      formattedAddress: line1,
      location: point,
      city: null,
      countryCode: null,
    };
  }
  return geocodeAddress(line1);
}

/** Server action wrapper for checkout UI debounce quoting. */
export async function quoteDistanceDeliveryAction(
  line1: string,
  destinationPoint?: DeliveryDestinationPoint | null,
): Promise<QuoteDistanceDeliveryResult> {
  return quoteDistanceDelivery(line1, destinationPoint);
}
