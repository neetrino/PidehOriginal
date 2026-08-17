import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db/client";
import type { DbTransaction } from "@/db/transaction";
import {
  groupOrderEvents,
  groupOrderItemModifiers,
  groupOrderItems,
  groupOrderParticipants,
  groupOrders,
  productModifiers,
  products,
} from "@/db/schema";
import {
  organizerPaysAllDeliveryShares,
  splitDeliveryFee,
} from "@/features/group-orders/domain/delivery-split";
import type { GroupOrderPaymentMode } from "@/features/group-orders/domain/status";
import { createId } from "@/lib/id";

type DbLike = ReturnType<typeof getDb> | DbTransaction;

export async function appendGroupOrderEvent(
  db: DbLike,
  input: {
    groupOrderId: string;
    eventType:
      | "STATUS_CHANGE"
      | "PARTICIPANT_JOINED"
      | "PARTICIPANT_REMOVED"
      | "PARTICIPANT_LEFT"
      | "ITEMS_CHANGED"
      | "ITEMS_READY"
      | "SPEND_LIMIT_CHANGED"
      | "JOINS_CLOSED"
      | "PAYMENT_STATUS"
      | "NOTE"
      | "ADMIN_ACTION";
    fromState?: string | null;
    toState?: string | null;
    actorUserId?: string | null;
    actorParticipantId?: string | null;
    payload?: Record<string, unknown>;
  },
): Promise<void> {
  await db.insert(groupOrderEvents).values({
    id: createId(),
    groupOrderId: input.groupOrderId,
    eventType: input.eventType,
    fromState: input.fromState ?? null,
    toState: input.toState ?? null,
    actorUserId: input.actorUserId ?? null,
    actorParticipantId: input.actorParticipantId ?? null,
    payload: input.payload ?? null,
  });
}

/**
 * Recalculate participant subtotals, delivery shares, and final amounts.
 * Call after item mutations or delivery amount changes.
 */
export async function recalculateGroupOrderMoney(
  db: DbLike,
  groupOrderId: string,
): Promise<void> {
  const [groupOrder] = await db
    .select()
    .from(groupOrders)
    .where(eq(groupOrders.id, groupOrderId))
    .limit(1);
  if (!groupOrder) return;

  const participants = await db
    .select()
    .from(groupOrderParticipants)
    .where(
      and(
        eq(groupOrderParticipants.groupOrderId, groupOrderId),
        eq(groupOrderParticipants.status, "ACTIVE"),
      ),
    );

  const items = await db
    .select()
    .from(groupOrderItems)
    .where(eq(groupOrderItems.groupOrderId, groupOrderId));

  const subtotalByParticipant = new Map<string, number>();
  for (const participant of participants) {
    subtotalByParticipant.set(participant.id, 0);
  }
  for (const item of items) {
    const prev = subtotalByParticipant.get(item.participantId) ?? 0;
    subtotalByParticipant.set(item.participantId, prev + item.lineTotalAmount);
  }

  const withItems = participants
    .filter((p) => (subtotalByParticipant.get(p.id) ?? 0) > 0)
    .map((p) => p.id);

  const organizer = participants.find((p) => p.role === "ORGANIZER");
  const organizerId = organizer?.id;

  let shares = new Map<string, number>();
  if (organizerId && withItems.length > 0) {
    const split =
      groupOrder.paymentMode === "ORGANIZER_PAYS_ALL"
        ? organizerPaysAllDeliveryShares({
            deliveryAmount: groupOrder.deliveryAmount,
            organizerParticipantId: organizerId,
            activeParticipantIds: participants.map((p) => p.id),
          })
        : splitDeliveryFee({
            deliveryAmount: groupOrder.deliveryAmount,
            participantIdsWithItems: withItems,
            organizerParticipantId: organizerId,
          });

    if (split.ok) {
      shares = new Map(
        split.shares.map((s) => [s.participantId, s.deliveryShareAmount]),
      );
    }
  }

  for (const participant of participants) {
    const subtotal = subtotalByParticipant.get(participant.id) ?? 0;
    const deliveryShare =
      groupOrder.paymentMode === "ORGANIZER_PAYS_ALL"
        ? participant.role === "ORGANIZER"
          ? groupOrder.deliveryAmount
          : 0
        : (shares.get(participant.id) ?? 0);

    const finalAmount =
      groupOrder.paymentMode === "ORGANIZER_PAYS_ALL"
        ? participant.role === "ORGANIZER"
          ? sumMap(subtotalByParticipant) + groupOrder.deliveryAmount
          : 0
        : subtotal + deliveryShare;

    await db
      .update(groupOrderParticipants)
      .set({
        subtotalAmount: subtotal,
        deliveryShareAmount: deliveryShare,
        finalAmount,
        updatedAt: new Date(),
      })
      .where(eq(groupOrderParticipants.id, participant.id));
  }
}

function sumMap(map: Map<string, number>): number {
  let total = 0;
  for (const value of map.values()) total += value;
  return total;
}

export async function resolveLinePricing(input: {
  productId: string;
  quantity: number;
  modifierIds: readonly string[];
}): Promise<
  | {
      ok: true;
      unitAmount: number;
      lineTotalAmount: number;
      modifiers: Array<{
        id: string;
        kind: string;
        name: string;
        priceAmount: number;
      }>;
    }
  | { ok: false; error: string }
> {
  const [product] = await getDb()
    .select({
      id: products.id,
      price: products.priceAmount,
      status: products.status,
      stock: products.stockOnHand,
    })
    .from(products)
    .where(eq(products.id, input.productId))
    .limit(1);

  if (!product || product.status !== "ACTIVE" || product.stock < 1) {
    return { ok: false, error: "Product unavailable." };
  }

  let modifiers: Array<{
    id: string;
    kind: string;
    name: string;
    priceAmount: number;
  }> = [];

  if (input.modifierIds.length > 0) {
    const rows = await getDb()
      .select({
        id: productModifiers.id,
        kind: productModifiers.kind,
        name: productModifiers.name,
        priceAmount: productModifiers.priceAmount,
      })
      .from(productModifiers)
      .where(inArray(productModifiers.id, [...input.modifierIds]));

    if (rows.length !== input.modifierIds.length) {
      return { ok: false, error: "Invalid modifiers." };
    }
    modifiers = rows;
  }

  const additionTotal = modifiers
    .filter((m) => m.kind === "ADDITION")
    .reduce((sum, m) => sum + m.priceAmount, 0);
  const unitAmount = product.price + additionTotal;
  const qty = Math.min(input.quantity, product.stock);

  return {
    ok: true,
    unitAmount,
    lineTotalAmount: unitAmount * qty,
    modifiers,
  };
}

export async function replaceItemModifiers(
  db: DbLike,
  itemId: string,
  modifiers: ReadonlyArray<{
    id: string;
    kind: string;
    name: string;
    priceAmount: number;
  }>,
): Promise<void> {
  await db
    .delete(groupOrderItemModifiers)
    .where(eq(groupOrderItemModifiers.groupOrderItemId, itemId));

  if (modifiers.length === 0) return;

  await db.insert(groupOrderItemModifiers).values(
    modifiers.map((modifier) => ({
      id: createId(),
      groupOrderItemId: itemId,
      modifierId: modifier.id,
      kindSnapshot: modifier.kind,
      nameSnapshot: modifier.name,
      priceAmountSnapshot: modifier.priceAmount,
    })),
  );
}

export function buildInvitePath(locale: string, inviteToken: string): string {
  return `/${locale}/group-orders/${inviteToken}`;
}

export function paymentStatusForMode(
  paymentMode: GroupOrderPaymentMode,
  role: "ORGANIZER" | "PARTICIPANT",
): "NOT_REQUIRED" | "PENDING" {
  if (paymentMode === "ORGANIZER_PAYS_ALL") {
    return role === "ORGANIZER" ? "PENDING" : "NOT_REQUIRED";
  }
  return "PENDING";
}
