import 'server-only';

import { and, asc, desc, eq, inArray, or } from 'drizzle-orm';

import { getDb } from '@/db/client';
import {
  bonusTransactions,
  groupOrderEvents,
  groupOrderItemModifiers,
  groupOrderItems,
  groupOrderParticipants,
  mediaAssets,
  payments,
  products,
} from '@/db/schema';
import type { LocaleTranslation, TranslationsJson } from '@/db/schema/catalog';
import { resolveOrderItemImageUrl } from '@/features/orders/application/order-item-images';
import type { Locale } from '@/lib/i18n/config';
import { mediaPublicUrl } from '@/lib/media/public-url';

export type AdminOrderParticipantItemView = {
  id: string;
  title: string;
  imageUrl: string | null;
  quantity: number;
  unitPriceAmount: number;
  lineTotalAmount: number;
  currency: string;
  modifiers: Array<{
    id: string;
    kind: 'ADDITION' | 'EXCEPTION';
    name: string;
    unitPriceAmount: number;
  }>;
};

export type AdminOrderParticipantView = {
  id: string;
  displayName: string;
  role: 'ORGANIZER' | 'PARTICIPANT';
  paymentMethod: string;
  subtotalAmount: number;
  deliveryShareAmount: number;
  finalAmount: number;
  /** Points earned for this participant when the order was delivered (0 if none). */
  bonusEarnedAmount: number;
  items: AdminOrderParticipantItemView[];
};

function productTitle(translations: TranslationsJson, locale: Locale, fallbackSku: string): string {
  const entry: LocaleTranslation | undefined = translations[locale] ?? translations.hy;
  return entry?.title ?? fallbackSku;
}

function paymentMethodLabel(methodOrProvider: string): string {
  const normalized = methodOrProvider.toUpperCase();
  if (normalized === 'COD' || normalized === 'CASH') {
    return 'Cash';
  }
  if (normalized === 'IDRAM') {
    return 'Idram';
  }
  if (normalized === 'ARCA' || normalized === 'CARD') {
    return 'Card';
  }
  return methodOrProvider;
}

/**
 * Loads group-order participants with items and payment labels for an order
 * drawer. Prefers order_items attribution when present; otherwise uses
 * group_order_items (source of truth after checkout merge).
 */
export async function loadOrderGroupParticipants(input: {
  groupOrderId: string;
  orderId: string;
  locale: Locale;
  currency: string;
  orderItems: Array<{
    id: string;
    productId: string | null;
    groupOrderParticipantId: string | null;
    participantNameSnapshot: string | null;
    productTitleSnapshot: string;
    productImageKeySnapshot: string | null;
    quantity: number;
    unitBaseAmount: number;
    lineTotalAmount: number;
    currency: string;
    modifiers: Array<{
      id: string;
      kind: 'ADDITION' | 'EXCEPTION';
      name: string;
      unitPriceAmount: number;
    }>;
  }>;
  liveObjectKeyByProductId?: ReadonlyMap<string, string>;
}): Promise<AdminOrderParticipantView[]> {
  const db = getDb();
  const liveObjectKeyByProductId = input.liveObjectKeyByProductId ?? new Map();

  const participants = await db
    .select({
      id: groupOrderParticipants.id,
      userId: groupOrderParticipants.userId,
      displayName: groupOrderParticipants.displayName,
      role: groupOrderParticipants.role,
      paymentId: groupOrderParticipants.paymentId,
      subtotalAmount: groupOrderParticipants.subtotalAmount,
      deliveryShareAmount: groupOrderParticipants.deliveryShareAmount,
      finalAmount: groupOrderParticipants.finalAmount,
    })
    .from(groupOrderParticipants)
    .where(
      and(
        eq(groupOrderParticipants.groupOrderId, input.groupOrderId),
        eq(groupOrderParticipants.status, 'ACTIVE'),
      ),
    )
    .orderBy(asc(groupOrderParticipants.createdAt));

  if (participants.length === 0) {
    return [];
  }

  const earnRows = await db
    .select({
      userId: bonusTransactions.userId,
      delta: bonusTransactions.delta,
    })
    .from(bonusTransactions)
    .where(and(eq(bonusTransactions.orderId, input.orderId), eq(bonusTransactions.type, 'EARN')));

  const bonusEarnedByUserId = new Map<string, number>();
  for (const row of earnRows) {
    bonusEarnedByUserId.set(row.userId, Math.abs(row.delta));
  }

  function bonusForParticipant(userId: string | null): number {
    if (!userId) return 0;
    return bonusEarnedByUserId.get(userId) ?? 0;
  }

  const paymentRows = await db
    .select({
      id: payments.id,
      method: payments.method,
      groupOrderParticipantId: payments.groupOrderParticipantId,
    })
    .from(payments)
    .where(eq(payments.orderId, input.orderId))
    .orderBy(desc(payments.attemptNumber));

  const methodByParticipantId = new Map<string, string>();
  for (const row of paymentRows) {
    if (row.groupOrderParticipantId && !methodByParticipantId.has(row.groupOrderParticipantId)) {
      methodByParticipantId.set(row.groupOrderParticipantId, paymentMethodLabel(row.method));
    }
  }

  for (const participant of participants) {
    if (participant.paymentId && !methodByParticipantId.has(participant.id)) {
      const byId = paymentRows.find((row) => row.id === participant.paymentId);
      if (byId) {
        methodByParticipantId.set(participant.id, paymentMethodLabel(byId.method));
      }
    }
  }

  const events = await db
    .select({
      actorParticipantId: groupOrderEvents.actorParticipantId,
      payload: groupOrderEvents.payload,
    })
    .from(groupOrderEvents)
    .where(
      and(
        eq(groupOrderEvents.groupOrderId, input.groupOrderId),
        eq(groupOrderEvents.eventType, 'PAYMENT_STATUS'),
      ),
    )
    .orderBy(desc(groupOrderEvents.createdAt));

  for (const event of events) {
    if (!event.actorParticipantId) continue;
    if (methodByParticipantId.has(event.actorParticipantId)) continue;
    const provider = event.payload?.provider;
    if (typeof provider === 'string' && provider.trim()) {
      methodByParticipantId.set(event.actorParticipantId, paymentMethodLabel(provider));
    }
  }

  const stampedItems = input.orderItems.filter((item) => item.groupOrderParticipantId != null);

  if (stampedItems.length > 0) {
    return participants.map((participant) => ({
      id: participant.id,
      displayName: participant.displayName,
      role: participant.role,
      paymentMethod: methodByParticipantId.get(participant.id) ?? '—',
      subtotalAmount: participant.subtotalAmount,
      deliveryShareAmount: participant.deliveryShareAmount,
      finalAmount: participant.finalAmount,
      bonusEarnedAmount: bonusForParticipant(participant.userId),
      items: stampedItems
        .filter((item) => item.groupOrderParticipantId === participant.id)
        .map((item) => ({
          id: item.id,
          title: item.productTitleSnapshot,
          imageUrl: resolveOrderItemImageUrl({
            productImageKeySnapshot: item.productImageKeySnapshot,
            productId: item.productId,
            liveObjectKeyByProductId,
          }),
          quantity: item.quantity,
          unitPriceAmount: item.unitBaseAmount,
          lineTotalAmount: item.lineTotalAmount,
          currency: item.currency,
          modifiers: item.modifiers,
        })),
    }));
  }

  const groupLines = await db
    .select({
      item: groupOrderItems,
      product: products,
    })
    .from(groupOrderItems)
    .innerJoin(products, eq(groupOrderItems.productId, products.id))
    .where(eq(groupOrderItems.groupOrderId, input.groupOrderId));

  const lineIds = groupLines.map((row) => row.item.id);
  const modifierRows =
    lineIds.length === 0
      ? []
      : await db
          .select()
          .from(groupOrderItemModifiers)
          .where(inArray(groupOrderItemModifiers.groupOrderItemId, lineIds));

  const modifiersByItem = new Map<string, typeof modifierRows>();
  for (const row of modifierRows) {
    const list = modifiersByItem.get(row.groupOrderItemId) ?? [];
    list.push(row);
    modifiersByItem.set(row.groupOrderItemId, list);
  }

  const productIds = [...new Set(groupLines.map((row) => row.product.id))];
  const mediaRows =
    productIds.length === 0
      ? []
      : await db
          .select()
          .from(mediaAssets)
          .where(
            and(
              inArray(mediaAssets.productId, productIds),
              eq(mediaAssets.uploadStatus, 'READY'),
              // Match catalog/checkout: primary flag or PRIMARY role.
              or(eq(mediaAssets.isPrimary, true), eq(mediaAssets.role, 'PRIMARY')),
            ),
          );

  const imageByProduct = new Map(
    mediaRows.map((row) => [row.productId!, mediaPublicUrl(row.objectKey)]),
  );

  return participants.map((participant) => ({
    id: participant.id,
    displayName: participant.displayName,
    role: participant.role,
    paymentMethod: methodByParticipantId.get(participant.id) ?? '—',
    subtotalAmount: participant.subtotalAmount,
    deliveryShareAmount: participant.deliveryShareAmount,
    finalAmount: participant.finalAmount,
    bonusEarnedAmount: bonusForParticipant(participant.userId),
    items: groupLines
      .filter((row) => row.item.participantId === participant.id)
      .map((row) => {
        const mods = modifiersByItem.get(row.item.id) ?? [];
        return {
          id: row.item.id,
          title: productTitle(row.product.translations, input.locale, row.product.sku),
          imageUrl: imageByProduct.get(row.product.id) ?? null,
          quantity: row.item.quantity,
          unitPriceAmount: row.item.unitAmount,
          lineTotalAmount: row.item.lineTotalAmount,
          currency: input.currency,
          modifiers: mods.map((mod) => ({
            id: mod.id,
            kind: mod.kindSnapshot === 'EXCEPTION' ? ('EXCEPTION' as const) : ('ADDITION' as const),
            name: mod.nameSnapshot,
            unitPriceAmount: mod.priceAmountSnapshot,
          })),
        };
      }),
  }));
}
