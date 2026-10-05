'use server';

import { eq, max } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getDb } from '@/db/client';
import { deliveryRules } from '@/db/schema';
import {
  denormalizedCityRegion,
  normalizeDeliveryLocationTranslations,
} from '@/features/delivery/domain/delivery-location';
import { deliveryLocationSchema, type DeliveryLocationInput } from '@/features/delivery/schemas';
import { requireAdmin } from '@/lib/auth/policies';
import { createId } from '@/lib/id';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { err, ok, type Result } from '@/lib/result';

function revalidateDelivery(locale: string): void {
  revalidatePath(`/${locale}/admin/delivery`);
  revalidatePath(`/${locale}/checkout`);
  revalidatePath(`/${locale}/cart`);
}

function parseLocationInput(
  raw: DeliveryLocationInput,
): Result<{
  priceAmount: number;
  translations: NonNullable<ReturnType<typeof normalizeDeliveryLocationTranslations>>;
  city: string;
  region: string;
}> {
  const parsed = deliveryLocationSchema.safeParse(raw);
  if (!parsed.success) {
    return err('VALIDATION', 'Invalid delivery location.');
  }

  const translations = normalizeDeliveryLocationTranslations(parsed.data.translations);
  if (!translations) {
    return err('VALIDATION', 'City and area are required in at least one language.');
  }

  const { city, region } = denormalizedCityRegion(translations);
  return ok({
    priceAmount: parsed.data.priceAmount,
    translations,
    city,
    region,
  });
}

/** Creates a delivery zone for checkout pricing. */
export async function createDeliveryLocationAction(
  locale: string,
  raw: DeliveryLocationInput,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err('INVALID_LOCALE', 'Invalid locale.');
  }

  await requireAdmin(locale as Locale);

  const prepared = parseLocationInput(raw);
  if (!prepared.ok) return prepared;

  const [maxPriority] = await getDb()
    .select({ value: max(deliveryRules.priority) })
    .from(deliveryRules);

  const id = createId();
  await getDb()
    .insert(deliveryRules)
    .values({
      id,
      countryCode: 'AM',
      city: prepared.value.city,
      region: prepared.value.region,
      translations: prepared.value.translations,
      priceAmount: prepared.value.priceAmount,
      freeThresholdAmount: null,
      isActive: true,
      priority: (maxPriority?.value ?? 0) + 1,
    });

  revalidateDelivery(locale);
  return ok({ id });
}

/** Updates an existing delivery zone. */
export async function updateDeliveryLocationAction(
  locale: string,
  id: string,
  raw: DeliveryLocationInput,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err('INVALID_LOCALE', 'Invalid locale.');
  }

  await requireAdmin(locale as Locale);

  const prepared = parseLocationInput(raw);
  if (!prepared.ok) return prepared;

  const [existing] = await getDb()
    .select({ id: deliveryRules.id })
    .from(deliveryRules)
    .where(eq(deliveryRules.id, id))
    .limit(1);

  if (!existing) {
    return err('NOT_FOUND', 'Delivery location not found.');
  }

  await getDb()
    .update(deliveryRules)
    .set({
      countryCode: 'AM',
      city: prepared.value.city,
      region: prepared.value.region,
      translations: prepared.value.translations,
      priceAmount: prepared.value.priceAmount,
      updatedAt: new Date(),
    })
    .where(eq(deliveryRules.id, id));

  revalidateDelivery(locale);
  return ok({ id });
}

/** Soft-deactivates a delivery zone (keeps order history references). */
export async function deleteDeliveryLocationAction(
  locale: string,
  id: string,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err('INVALID_LOCALE', 'Invalid locale.');
  }

  await requireAdmin(locale as Locale);

  const [existing] = await getDb()
    .select({ id: deliveryRules.id })
    .from(deliveryRules)
    .where(eq(deliveryRules.id, id))
    .limit(1);

  if (!existing) {
    return err('NOT_FOUND', 'Delivery location not found.');
  }

  await getDb()
    .update(deliveryRules)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(deliveryRules.id, id));

  revalidateDelivery(locale);
  return ok({ id });
}
