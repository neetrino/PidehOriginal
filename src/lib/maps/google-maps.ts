import "server-only";

import { getEnv } from "@/config/env";
import type {
  DrivingDistanceResult,
  GeocodeResult,
  GeoPoint,
  PlaceAutocompleteSuggestion,
} from "@/lib/maps/types";
import { logger } from "@/lib/observability/logger";

export type {
  DrivingDistanceResult,
  GeocodeResult,
  GeoPoint,
  PlaceAutocompleteSuggestion,
} from "@/lib/maps/types";

type GeocodeApiResponse = {
  status: string;
  error_message?: string;
  results?: Array<{
    formatted_address?: string;
    geometry?: { location?: { lat?: number; lng?: number } };
    address_components?: Array<{
      long_name?: string;
      short_name?: string;
      types?: string[];
    }>;
  }>;
};

type RoutesApiResponse = {
  routes?: Array<{
    distanceMeters?: number;
    duration?: string;
  }>;
  error?: {
    message?: string;
    status?: string;
  };
};

function requireMapsApiKey(): string {
  const key = getEnv().GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured.");
  }
  return key;
}

function pickComponent(
  components: NonNullable<GeocodeApiResponse["results"]>[number]["address_components"],
  type: string,
  useShortName = false,
): string | null {
  const match = components?.find((component) =>
    component.types?.includes(type),
  );
  if (!match) return null;
  const value = useShortName ? match.short_name : match.long_name;
  return value?.trim() || null;
}

function mentionsCityOrCountry(address: string): boolean {
  return /yerevan|երևան|երեվան|armenia|հայաստան|հայաստանի/i.test(address);
}

/** Builds lookup variants so short Armenian street lines still resolve. */
function geocodeQueryCandidates(address: string): string[] {
  const trimmed = address.trim();
  const candidates = [trimmed];
  if (!mentionsCityOrCountry(trimmed)) {
    candidates.push(`${trimmed}, Yerevan`);
    candidates.push(`${trimmed}, Yerevan, Armenia`);
    candidates.push(`${trimmed}, Երևան, Հայաստան`);
  } else if (!/armenia|հայաստան/i.test(trimmed)) {
    candidates.push(`${trimmed}, Armenia`);
  }
  return [...new Set(candidates)];
}

function toGeocodeResult(
  first: NonNullable<GeocodeApiResponse["results"]>[number],
  fallbackAddress: string,
): GeocodeResult {
  const lat = first.geometry?.location?.lat;
  const lng = first.geometry?.location?.lng;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Address could not be found on the map.");
  }

  const city =
    pickComponent(first.address_components, "locality") ??
    pickComponent(first.address_components, "administrative_area_level_2") ??
    pickComponent(first.address_components, "administrative_area_level_1");

  return {
    formattedAddress: first.formatted_address?.trim() || fallbackAddress,
    location: { lat: lat as number, lng: lng as number },
    city,
    countryCode: pickComponent(first.address_components, "country", true),
  };
}

async function requestGeocode(
  address: string,
  key: string,
): Promise<GeocodeApiResponse> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("region", "am");
  url.searchParams.set("language", "en");
  url.searchParams.set("key", key);

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    logger.error("maps.geocode_http_failed", {
      status: response.status,
    });
    throw new Error("Unable to geocode address.");
  }

  return (await response.json()) as GeocodeApiResponse;
}

/** Geocodes a free-text address via Google Geocoding API (Armenia-biased). */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const trimmed = address.trim();
  if (!trimmed) {
    throw new Error("Address is required.");
  }

  const key = requireMapsApiKey();
  let lastStatus = "UNKNOWN";

  for (const candidate of geocodeQueryCandidates(trimmed)) {
    const payload = await requestGeocode(candidate, key);
    lastStatus = payload.status;

    if (payload.status === "OK" && payload.results?.[0]) {
      return toGeocodeResult(payload.results[0], trimmed);
    }

    if (payload.status !== "ZERO_RESULTS") {
      logger.warn("maps.geocode_failed", {
        status: payload.status,
        message: payload.error_message,
      });
      break;
    }
  }

  logger.warn("maps.geocode_zero_results", { status: lastStatus });
  throw new Error(
    "Address could not be found on the map. Include city, e.g. «Անդրանիկի 108/10, Երևան».",
  );
}

/** Reverse-geocodes coordinates via Google Geocoding API (Armenia-biased). */
export async function reverseGeocode(
  location: GeoPoint,
): Promise<GeocodeResult> {
  if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) {
    throw new Error("Invalid map coordinates.");
  }

  const key = requireMapsApiKey();
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${location.lat},${location.lng}`);
  url.searchParams.set("region", "am");
  url.searchParams.set("language", "en");
  url.searchParams.set("key", key);

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    logger.error("maps.reverse_geocode_http_failed", {
      status: response.status,
    });
    throw new Error("Unable to resolve address for this map point.");
  }

  const payload = (await response.json()) as GeocodeApiResponse;
  if (payload.status === "OK" && payload.results?.[0]) {
    return toGeocodeResult(
      payload.results[0],
      `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`,
    );
  }

  logger.warn("maps.reverse_geocode_failed", {
    status: payload.status,
    message: payload.error_message,
  });
  throw new Error("No address found for this map point.");
}

/** Driving distance between two points via Routes API (computeRoutes). */
export async function getDrivingDistanceMeters(
  origin: GeoPoint,
  destination: GeoPoint,
): Promise<DrivingDistanceResult> {
  const key = requireMapsApiKey();
  const response = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters",
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: {
              latitude: origin.lat,
              longitude: origin.lng,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.lat,
              longitude: destination.lng,
            },
          },
        },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_UNAWARE",
      }),
    },
  );

  const payload = (await response.json()) as RoutesApiResponse;

  if (!response.ok) {
    const message = payload.error?.message ?? "";
    logger.warn("maps.routes_http_failed", {
      status: response.status,
      message,
    });
    throw new Error(
      /has not been used|is disabled/i.test(message)
        ? "Routes API is not enabled. Enable Routes API in Google Cloud Console."
        : "Unable to calculate delivery distance.",
    );
  }

  const route = payload.routes?.[0];
  const distanceMeters = route?.distanceMeters;
  if (!Number.isFinite(distanceMeters) || (distanceMeters as number) < 0) {
    logger.warn("maps.routes_empty", {
      message: payload.error?.message,
    });
    throw new Error("Delivery route to this address is unavailable.");
  }

  const durationMatch = route?.duration?.match(/^(\d+)s$/);
  const durationSeconds = durationMatch ? Number(durationMatch[1]) : 0;

  return {
    distanceMeters: distanceMeters as number,
    durationSeconds,
  };
}

type PlacesAutocompleteApiResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: { text?: string };
      structuredFormat?: {
        mainText?: { text?: string };
        secondaryText?: { text?: string };
      };
    };
  }>;
  error?: { message?: string; status?: string };
};

/**
 * Places API (New) autocomplete, biased to Armenia.
 * Returns [] when the API is disabled or no matches exist.
 */
export async function autocompletePlaces(
  input: string,
  languageCode: "hy" | "en" | "ru" = "hy",
): Promise<PlaceAutocompleteSuggestion[]> {
  const trimmed = input.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const key = requireMapsApiKey();
  const response = await fetch(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
      },
      body: JSON.stringify({
        input: trimmed,
        includedRegionCodes: ["am"],
        languageCode,
      }),
    },
  );

  const payload = (await response.json()) as PlacesAutocompleteApiResponse;

  if (!response.ok) {
    const message = payload.error?.message ?? "";
    logger.warn("maps.places_autocomplete_failed", {
      status: response.status,
      message,
    });
    if (/has not been used|is disabled/i.test(message)) {
      throw new Error(
        "Places API (New) is not enabled. Enable it in Google Cloud Console.",
      );
    }
    throw new Error("Unable to search addresses.");
  }

  const suggestions: PlaceAutocompleteSuggestion[] = [];
  for (const item of payload.suggestions ?? []) {
    const prediction = item.placePrediction;
    if (!prediction?.placeId) continue;
    const fullText = prediction.text?.text?.trim();
    if (!fullText) continue;
    const primaryText =
      prediction.structuredFormat?.mainText?.text?.trim() || fullText;
    const secondaryText =
      prediction.structuredFormat?.secondaryText?.text?.trim() || null;
    suggestions.push({
      placeId: prediction.placeId,
      primaryText,
      secondaryText,
      fullText,
    });
  }
  return suggestions;
}

