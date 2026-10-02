import type {
  DeliveryLocationTranslation,
  DeliveryLocationTranslationsJson,
} from '@/db/schema';
import { locales, type Locale } from '@/lib/i18n/config';

export type { DeliveryLocationTranslation, DeliveryLocationTranslationsJson };

export const EMPTY_DELIVERY_LOCATION_TRANSLATION: DeliveryLocationTranslation = {
  city: '',
  area: '',
};

/** Picks the best available translation for a locale with hy → en → ru fallback. */
export function resolveDeliveryLocationTranslation(
  translations: DeliveryLocationTranslationsJson | null | undefined,
  locale: Locale,
): DeliveryLocationTranslation {
  const order: Locale[] = [locale, 'hy', 'en', 'ru'];
  for (const key of order) {
    const value = translations?.[key];
    if (value?.city?.trim() || value?.area?.trim()) {
      return {
        city: value.city?.trim() ?? '',
        area: value.area?.trim() ?? '',
      };
    }
  }
  return { ...EMPTY_DELIVERY_LOCATION_TRANSLATION };
}

/** Builds a checkout/admin label like "Yerevan, Shengavit". */
export function formatDeliveryLocationLabel(
  translations: DeliveryLocationTranslationsJson | null | undefined,
  locale: Locale,
  fallbackCity?: string | null,
  fallbackArea?: string | null,
): string {
  const resolved = resolveDeliveryLocationTranslation(translations, locale);
  const city = resolved.city || fallbackCity?.trim() || '';
  const area = resolved.area || fallbackArea?.trim() || '';
  if (city && area) return `${city}, ${area}`;
  return city || area || 'Delivery';
}

/**
 * Ensures every locale has city+area by copying from the first complete locale.
 * Returns null when no locale is complete.
 */
export function normalizeDeliveryLocationTranslations(
  input: DeliveryLocationTranslationsJson,
): DeliveryLocationTranslationsJson | null {
  const filled: Partial<Record<Locale, DeliveryLocationTranslation>> = {};
  let template: DeliveryLocationTranslation | null = null;

  for (const locale of locales) {
    const city = input[locale]?.city?.trim() ?? '';
    const area = input[locale]?.area?.trim() ?? '';
    if (city && area) {
      filled[locale] = { city, area };
      if (!template) template = { city, area };
    }
  }

  if (!template) return null;

  const result: DeliveryLocationTranslationsJson = {};
  for (const locale of locales) {
    result[locale] = filled[locale] ?? { ...template };
  }
  return result;
}

/** Denormalized city/region columns for indexing and legacy reads. */
export function denormalizedCityRegion(translations: DeliveryLocationTranslationsJson): {
  city: string;
  region: string;
} {
  const hy = resolveDeliveryLocationTranslation(translations, 'hy');
  return { city: hy.city, region: hy.area };
}
