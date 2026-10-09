'use server';

import { and, eq, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getDb } from '@/db/client';
import { addresses, deliveryRules } from '@/db/schema';
import { withTransaction } from '@/db/transaction';
import { DEFAULT_DELIVERY_CITY } from '@/features/delivery/domain/service-area';
import { addressFormSchema, addressIdSchema } from '@/features/profile/schemas/address';
import { requireUser } from '@/lib/auth/policies';
import { createId } from '@/lib/id';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { err, ok, type Result } from '@/lib/result';

type AddressMutationOk = { addressId: string };

type ResolvedCommunity = {
  city: string;
  region: string;
};

function revalidateAddressPaths(locale: Locale): void {
  revalidatePath(`/${locale}/profile/addresses`);
  revalidatePath(`/${locale}/checkout`);
}

async function clearDefaultFlags(
  tx: Parameters<Parameters<typeof withTransaction>[0]>[0],
  userId: string,
): Promise<void> {
  await tx
    .update(addresses)
    .set({
      isDefaultShipping: false,
      isDefaultBilling: false,
      updatedAt: new Date(),
    })
    .where(and(eq(addresses.userId, userId), isNull(addresses.archivedAt)));
}

/** Loads an active delivery zone and returns canonical city/region for the address book. */
async function resolveCommunity(
  tx: Parameters<Parameters<typeof withTransaction>[0]>[0],
  deliveryRuleId: string,
): Promise<ResolvedCommunity | null> {
  const [row] = await tx
    .select({
      city: deliveryRules.city,
      region: deliveryRules.region,
    })
    .from(deliveryRules)
    .where(and(eq(deliveryRules.id, deliveryRuleId), eq(deliveryRules.isActive, true)))
    .limit(1);

  if (!row) return null;

  return {
    city: row.city?.trim() || DEFAULT_DELIVERY_CITY,
    region: row.region?.trim() || '',
  };
}

/**
 * Creates a customer address. Recipient name and phone come from the profile;
 * community (city/region) comes from the selected delivery zone.
 * First address (or explicit default) becomes the default shipping/billing address.
 */
export async function createCustomerAddressAction(
  locale: string,
  input: unknown,
): Promise<Result<AddressMutationOk>> {
  if (!isLocale(locale)) {
    return err('INVALID_LOCALE', 'Invalid locale.');
  }

  const parsed = addressFormSchema.safeParse(input);
  if (!parsed.success) {
    return err('VALIDATION_ERROR', 'Please check the address fields.');
  }

  const user = await requireUser(locale);

  try {
    const addressId = await withTransaction(async (tx) => {
      const community = await resolveCommunity(tx, parsed.data.deliveryRuleId);
      if (!community || !community.region) {
        return null;
      }

      const existing = await tx
        .select({ id: addresses.id })
        .from(addresses)
        .where(and(eq(addresses.userId, user.id), isNull(addresses.archivedAt)))
        .limit(1);

      const makeDefault = parsed.data.isDefault || existing.length === 0;
      if (makeDefault) {
        await clearDefaultFlags(tx, user.id);
      }

      const id = createId();
      await tx.insert(addresses).values({
        id,
        userId: user.id,
        recipientFirstName: user.firstName,
        recipientLastName: user.lastName,
        phone: user.phone ?? '',
        countryCode: 'AM',
        city: community.city,
        region: community.region,
        line1: parsed.data.line1,
        isDefaultShipping: makeDefault,
        isDefaultBilling: makeDefault,
      });

      return id;
    });

    if (!addressId) {
      return err('VALIDATION_ERROR', 'Select a community.');
    }

    revalidateAddressPaths(locale);
    return ok({ addressId });
  } catch {
    return err('SAVE_FAILED', 'Unable to save address.');
  }
}

/**
 * Updates an owned address. Keeps recipient name and phone synced from the profile;
 * community (city/region) comes from the selected delivery zone.
 */
export async function updateCustomerAddressAction(
  locale: string,
  addressId: string,
  input: unknown,
): Promise<Result<AddressMutationOk>> {
  if (!isLocale(locale)) {
    return err('INVALID_LOCALE', 'Invalid locale.');
  }

  const idParsed = addressIdSchema.safeParse({ addressId });
  const parsed = addressFormSchema.safeParse(input);
  if (!idParsed.success || !parsed.success) {
    return err('VALIDATION_ERROR', 'Please check the address fields.');
  }

  const user = await requireUser(locale);

  try {
    const result = await withTransaction(async (tx) => {
      const community = await resolveCommunity(tx, parsed.data.deliveryRuleId);
      if (!community || !community.region) {
        return 'invalid_community' as const;
      }

      const [owned] = await tx
        .select({ id: addresses.id })
        .from(addresses)
        .where(
          and(
            eq(addresses.id, idParsed.data.addressId),
            eq(addresses.userId, user.id),
            isNull(addresses.archivedAt),
          ),
        )
        .limit(1);

      if (!owned) {
        return null;
      }

      if (parsed.data.isDefault) {
        await clearDefaultFlags(tx, user.id);
      }

      await tx
        .update(addresses)
        .set({
          recipientFirstName: user.firstName,
          recipientLastName: user.lastName,
          phone: user.phone ?? '',
          city: community.city,
          region: community.region,
          line1: parsed.data.line1,
          isDefaultShipping: parsed.data.isDefault,
          isDefaultBilling: parsed.data.isDefault,
          updatedAt: new Date(),
        })
        .where(eq(addresses.id, owned.id));

      return owned.id;
    });

    if (result === 'invalid_community') {
      return err('VALIDATION_ERROR', 'Select a community.');
    }

    if (!result) {
      return err('NOT_FOUND', 'Address not found.');
    }

    revalidateAddressPaths(locale);
    return ok({ addressId: result });
  } catch {
    return err('SAVE_FAILED', 'Unable to save address.');
  }
}

/** Soft-archives an owned address without touching historical order snapshots. */
export async function deleteCustomerAddressAction(
  locale: string,
  addressId: string,
): Promise<Result<AddressMutationOk>> {
  if (!isLocale(locale)) {
    return err('INVALID_LOCALE', 'Invalid locale.');
  }

  const idParsed = addressIdSchema.safeParse({ addressId });
  if (!idParsed.success) {
    return err('VALIDATION_ERROR', 'Invalid address.');
  }

  const user = await requireUser(locale);

  const [owned] = await getDb()
    .select({ id: addresses.id })
    .from(addresses)
    .where(
      and(
        eq(addresses.id, idParsed.data.addressId),
        eq(addresses.userId, user.id),
        isNull(addresses.archivedAt),
      ),
    )
    .limit(1);

  if (!owned) {
    return err('NOT_FOUND', 'Address not found.');
  }

  await getDb()
    .update(addresses)
    .set({
      archivedAt: new Date(),
      isDefaultShipping: false,
      isDefaultBilling: false,
      updatedAt: new Date(),
    })
    .where(eq(addresses.id, owned.id));

  revalidateAddressPaths(locale);
  return ok({ addressId: owned.id });
}

/** Sets an owned address as the sole default shipping and billing address. */
export async function setDefaultCustomerAddressAction(
  locale: string,
  addressId: string,
): Promise<Result<AddressMutationOk>> {
  if (!isLocale(locale)) {
    return err('INVALID_LOCALE', 'Invalid locale.');
  }

  const idParsed = addressIdSchema.safeParse({ addressId });
  if (!idParsed.success) {
    return err('VALIDATION_ERROR', 'Invalid address.');
  }

  const user = await requireUser(locale);

  try {
    const result = await withTransaction(async (tx) => {
      const [owned] = await tx
        .select({ id: addresses.id })
        .from(addresses)
        .where(
          and(
            eq(addresses.id, idParsed.data.addressId),
            eq(addresses.userId, user.id),
            isNull(addresses.archivedAt),
          ),
        )
        .limit(1);

      if (!owned) {
        return null;
      }

      await clearDefaultFlags(tx, user.id);
      await tx
        .update(addresses)
        .set({
          isDefaultShipping: true,
          isDefaultBilling: true,
          updatedAt: new Date(),
        })
        .where(eq(addresses.id, owned.id));

      return owned.id;
    });

    if (!result) {
      return err('NOT_FOUND', 'Address not found.');
    }

    revalidateAddressPaths(locale);
    return ok({ addressId: result });
  } catch {
    return err('SAVE_FAILED', 'Unable to set default address.');
  }
}
