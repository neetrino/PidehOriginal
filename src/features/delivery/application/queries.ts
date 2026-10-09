import 'server-only';

import { asc, desc, eq } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { deliveryRules, type DeliveryLocationTranslationsJson } from '@/db/schema';
import {
  formatDeliveryLocationLabel,
  resolveDeliveryLocationTranslation,
} from '@/features/delivery/domain/delivery-location';
import type { Locale } from '@/lib/i18n/config';

export type AdminDeliveryLocation = {
  id: string;
  city: string;
  area: string;
  priceAmount: number;
  priority: number;
  translations: DeliveryLocationTranslationsJson;
};

export type CheckoutDeliveryOption = {
  id: string;
  city: string;
  area: string;
  /** Canonical DB city used for address book sync across locales. */
  sourceCity: string;
  /** Canonical DB region (community) used for address book sync across locales. */
  sourceRegion: string;
  priceAmount: number;
  freeThresholdAmount: number | null;
  label: string;
};

/** Lists active delivery zones for the admin table. */
export async function listAdminDeliveryLocations(
  locale: Locale,
): Promise<AdminDeliveryLocation[]> {
  const rows = await getDb()
    .select({
      id: deliveryRules.id,
      city: deliveryRules.city,
      region: deliveryRules.region,
      priceAmount: deliveryRules.priceAmount,
      priority: deliveryRules.priority,
      translations: deliveryRules.translations,
    })
    .from(deliveryRules)
    .where(eq(deliveryRules.isActive, true))
    .orderBy(desc(deliveryRules.priority), asc(deliveryRules.city));

  return rows.map((row) => {
    const resolved = resolveDeliveryLocationTranslation(row.translations, locale);
    return {
      id: row.id,
      city: resolved.city || row.city?.trim() || '',
      area: resolved.area || row.region?.trim() || '',
      priceAmount: row.priceAmount,
      priority: row.priority,
      translations: row.translations ?? {},
    };
  });
}

/** Active delivery zones shown in the checkout location dropdown. */
export async function listCheckoutDeliveryOptions(
  locale: Locale,
): Promise<CheckoutDeliveryOption[]> {
  const rows = await getDb()
    .select({
      id: deliveryRules.id,
      city: deliveryRules.city,
      region: deliveryRules.region,
      priceAmount: deliveryRules.priceAmount,
      freeThresholdAmount: deliveryRules.freeThresholdAmount,
      translations: deliveryRules.translations,
    })
    .from(deliveryRules)
    .where(eq(deliveryRules.isActive, true))
    .orderBy(desc(deliveryRules.priority), asc(deliveryRules.city));

  return rows.map((row) => {
    const resolved = resolveDeliveryLocationTranslation(row.translations, locale);
    const sourceCity = row.city?.trim() || '';
    const sourceRegion = row.region?.trim() || '';
    const city = resolved.city || sourceCity;
    const area = resolved.area || sourceRegion;
    return {
      id: row.id,
      city,
      area,
      sourceCity,
      sourceRegion,
      priceAmount: row.priceAmount,
      freeThresholdAmount: row.freeThresholdAmount,
      label: formatDeliveryLocationLabel(row.translations, locale, row.city, row.region),
    };
  });
}
