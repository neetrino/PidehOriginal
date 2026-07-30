"use server";

import { z } from "zod";

import type { PlaceAutocompleteSuggestion } from "@/lib/maps/types";
import {
  autocompletePlaces,
} from "@/lib/maps/google-maps";
import { logger } from "@/lib/observability/logger";

const autocompleteSchema = z.object({
  input: z.string().trim().min(2).max(200),
  languageCode: z.enum(["hy", "en", "ru"]).default("hy"),
});

export type AutocompleteAddressResult =
  | { ok: true; suggestions: PlaceAutocompleteSuggestion[] }
  | { ok: false; error: string };

/** Debounced address suggestions for checkout/admin (Places Autocomplete). */
export async function autocompleteAddressAction(
  raw: z.infer<typeof autocompleteSchema>,
): Promise<AutocompleteAddressResult> {
  const parsed = autocompleteSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: true, suggestions: [] };
  }

  try {
    const suggestions = await autocompletePlaces(
      parsed.data.input,
      parsed.data.languageCode,
    );
    return { ok: true, suggestions };
  } catch (error) {
    logger.warn("delivery.autocomplete_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Unable to search addresses.",
    };
  }
}
