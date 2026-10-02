'use server';

import { and, eq } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { deliveryRules } from '@/db/schema';
import {
  formatDeliveryLocationLabel,
  resolveDeliveryLocationTranslation,
} from '@/features/delivery/domain/delivery-location';
import { quoteZoneDeliverySchema } from '@/features/delivery/schemas';
import { defaultLocale, isLocale, type Locale } from '@/lib/i18n/config';
import { logger } from '@/lib/observability/logger';

export type ZoneDeliveryQuote = {
  deliveryRuleId: string;
  deliveryAmount: number;
  label: string;
  city: string;
  area: string;
  freeThresholdAmount: number | null;
};

/**
 * Quotes a fixed delivery fee for an admin-defined zone.
 * Applies free-delivery threshold when merchandise amount is provided.
 */
export async function quoteZoneDelivery(
  deliveryRuleId: string,
  locale: Locale = defaultLocale,
  merchandiseAmount = 0,
): Promise<{ ok: true; quote: ZoneDeliveryQuote } | { ok: false; error: string }> {
  const parsed = quoteZoneDeliverySchema.safeParse({ deliveryRuleId });
  if (!parsed.success) {
    return { ok: false, error: 'Select a delivery location.' };
  }

  try {
    const [row] = await getDb()
      .select({
        id: deliveryRules.id,
        city: deliveryRules.city,
        region: deliveryRules.region,
        priceAmount: deliveryRules.priceAmount,
        freeThresholdAmount: deliveryRules.freeThresholdAmount,
        translations: deliveryRules.translations,
      })
      .from(deliveryRules)
      .where(and(eq(deliveryRules.id, parsed.data.deliveryRuleId), eq(deliveryRules.isActive, true)))
      .limit(1);

    if (!row) {
      return { ok: false, error: 'Selected delivery location is no longer available.' };
    }

    const resolved = resolveDeliveryLocationTranslation(row.translations, locale);
    const city = resolved.city || row.city?.trim() || '';
    const area = resolved.area || row.region?.trim() || '';
    const label = formatDeliveryLocationLabel(row.translations, locale, row.city, row.region);
    const free =
      row.freeThresholdAmount != null &&
      merchandiseAmount >= row.freeThresholdAmount &&
      row.freeThresholdAmount > 0;
    const deliveryAmount = free ? 0 : row.priceAmount;

    return {
      ok: true,
      quote: {
        deliveryRuleId: row.id,
        deliveryAmount,
        label,
        city,
        area,
        freeThresholdAmount: row.freeThresholdAmount,
      },
    };
  } catch (error) {
    logger.warn('delivery.zone_quote_failed', {
      deliveryRuleId: parsed.data.deliveryRuleId,
      error: error instanceof Error ? error.message : 'unknown',
    });
    return { ok: false, error: 'Unable to calculate delivery price.' };
  }
}

export async function quoteZoneDeliveryAction(
  deliveryRuleId: string,
  locale: string,
  merchandiseAmount = 0,
): Promise<{ ok: true; quote: ZoneDeliveryQuote } | { ok: false; error: string }> {
  const resolvedLocale = isLocale(locale) ? locale : defaultLocale;
  return quoteZoneDelivery(deliveryRuleId, resolvedLocale, merchandiseAmount);
}
