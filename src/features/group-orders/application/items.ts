import { and, eq } from "drizzle-orm";

import { revalidateCartPaths } from "@/features/cart/cart";
import { getDb } from "@/db/client";
import {
  groupOrderItems,
  groupOrderParticipants,
  groupOrders,
} from "@/db/schema";
import {
  appendGroupOrderEvent,
  recalculateGroupOrderMoney,
  replaceItemModifiers,
  resolveLinePricing,
} from "@/features/group-orders/application/money";
import { canEditGroupOrderItems } from "@/features/group-orders/domain/status";
import { checkSpendLimit } from "@/features/group-orders/domain/spend-limit";
import { buildModifierSelectionKey } from "@/features/products/domain/modifier-selection";
import { resolveSelectedModifiersForProduct } from "@/features/products/application/product-modifiers";
import { createId } from "@/lib/id";

import { assertParticipantAccess } from "@/features/group-orders/application/access";

export type GroupOrderMutationResult =
  | { ok: true }
  | { ok: false; error: string };

export async function addGroupOrderItem(input: {
  inviteToken: string;
  productId: string;
  quantity: number;
  modifierIds?: string[];
}): Promise<GroupOrderMutationResult> {
  const access = await assertParticipantAccess(input.inviteToken);
  if (!access.ok) return access;

  const { groupOrder, participant } = access;
  if (!canEditGroupOrderItems(groupOrder.status)) {
    return { ok: false, error: "Items can no longer be changed." };
  }

  const resolved = await resolveSelectedModifiersForProduct(
    input.productId,
    input.modifierIds ?? [],
  );
  if (!resolved.ok) {
    return { ok: false, error: resolved.error };
  }

  const pricing = await resolveLinePricing({
    productId: input.productId,
    quantity: input.quantity,
    modifierIds: resolved.modifiers.map((m) => m.id),
  });
  if (!pricing.ok) return pricing;

  const selectionKey = buildModifierSelectionKey(
    resolved.modifiers.map((m) => m.id),
  );
  const db = getDb();

  const [existing] = await db
    .select()
    .from(groupOrderItems)
    .where(
      and(
        eq(groupOrderItems.participantId, participant.id),
        eq(groupOrderItems.productId, input.productId),
        eq(groupOrderItems.selectionKey, selectionKey),
      ),
    )
    .limit(1);

  let nextSubtotal = participant.subtotalAmount;
  if (existing) {
    const nextQty = existing.quantity + input.quantity;
    const lineTotal = pricing.unitAmount * nextQty;
    nextSubtotal =
      participant.subtotalAmount -
      existing.lineTotalAmount +
      lineTotal;

    const limit = checkSpendLimit(nextSubtotal, groupOrder.spendLimitAmount);
    if (!limit.ok) {
      return {
        ok: false,
        error: `Spend limit is ${limit.limitAmount} ֏.`,
      };
    }

    await db
      .update(groupOrderItems)
      .set({
        quantity: nextQty,
        unitAmount: pricing.unitAmount,
        lineTotalAmount: lineTotal,
        updatedAt: new Date(),
      })
      .where(eq(groupOrderItems.id, existing.id));
  } else {
    nextSubtotal = participant.subtotalAmount + pricing.lineTotalAmount;
    const limit = checkSpendLimit(nextSubtotal, groupOrder.spendLimitAmount);
    if (!limit.ok) {
      return {
        ok: false,
        error: `Spend limit is ${limit.limitAmount} ֏.`,
      };
    }

    const itemId = createId();
    await db.insert(groupOrderItems).values({
      id: itemId,
      groupOrderId: groupOrder.id,
      participantId: participant.id,
      productId: input.productId,
      selectionKey,
      quantity: input.quantity,
      unitAmount: pricing.unitAmount,
      lineTotalAmount: pricing.lineTotalAmount,
    });
    await replaceItemModifiers(db, itemId, pricing.modifiers);
  }

  await recalculateGroupOrderMoney(db, groupOrder.id);
  await appendGroupOrderEvent(db, {
    groupOrderId: groupOrder.id,
    eventType: "ITEMS_CHANGED",
    actorParticipantId: participant.id,
    payload: { action: "add", productId: input.productId },
  });
  await revalidateCartPaths();

  return { ok: true };
}

export async function updateGroupOrderItemQuantity(input: {
  inviteToken: string;
  itemId: string;
  quantity: number;
  /** When true, organizer may edit any participant's item. */
  asOrganizer?: boolean;
}): Promise<GroupOrderMutationResult> {
  const access = await assertParticipantAccess(input.inviteToken);
  if (!access.ok) return access;

  const { groupOrder, participant } = access;
  if (!canEditGroupOrderItems(groupOrder.status)) {
    return { ok: false, error: "Items can no longer be changed." };
  }

  const db = getDb();
  const [item] = await db
    .select()
    .from(groupOrderItems)
    .where(eq(groupOrderItems.id, input.itemId))
    .limit(1);

  if (!item || item.groupOrderId !== groupOrder.id) {
    return { ok: false, error: "Item not found." };
  }

  const isOwner = item.participantId === participant.id;
  const isOrganizer = participant.role === "ORGANIZER";
  if (!isOwner && !(input.asOrganizer && isOrganizer)) {
    return { ok: false, error: "You can only edit your own items." };
  }

  if (input.quantity < 1) {
    await db.delete(groupOrderItems).where(eq(groupOrderItems.id, item.id));
    await recalculateGroupOrderMoney(db, groupOrder.id);
    await revalidateCartPaths();
    return { ok: true };
  }

  const lineTotal = item.unitAmount * input.quantity;
  const [owner] = await db
    .select()
    .from(groupOrderParticipants)
    .where(eq(groupOrderParticipants.id, item.participantId))
    .limit(1);
  if (!owner) return { ok: false, error: "Participant not found." };

  const nextSubtotal =
    owner.subtotalAmount - item.lineTotalAmount + lineTotal;
  const limit = checkSpendLimit(nextSubtotal, groupOrder.spendLimitAmount);
  if (!limit.ok) {
    return { ok: false, error: `Spend limit is ${limit.limitAmount} ֏.` };
  }

  await db
    .update(groupOrderItems)
    .set({
      quantity: input.quantity,
      lineTotalAmount: lineTotal,
      updatedAt: new Date(),
    })
    .where(eq(groupOrderItems.id, item.id));

  await recalculateGroupOrderMoney(db, groupOrder.id);
  await revalidateCartPaths();
  return { ok: true };
}

export async function removeGroupOrderItem(input: {
  inviteToken: string;
  itemId: string;
  asOrganizer?: boolean;
}): Promise<GroupOrderMutationResult> {
  return updateGroupOrderItemQuantity({
    inviteToken: input.inviteToken,
    itemId: input.itemId,
    quantity: 0,
    asOrganizer: input.asOrganizer,
  });
}

export async function markParticipantItemsReady(input: {
  inviteToken: string;
}): Promise<GroupOrderMutationResult> {
  const access = await assertParticipantAccess(input.inviteToken);
  if (!access.ok) return access;

  const { groupOrder, participant } = access;
  if (!canEditGroupOrderItems(groupOrder.status)) {
    return { ok: false, error: "Order is already locked." };
  }

  const db = getDb();
  await db
    .update(groupOrderParticipants)
    .set({ itemsReady: true, updatedAt: new Date() })
    .where(eq(groupOrderParticipants.id, participant.id));

  await appendGroupOrderEvent(db, {
    groupOrderId: groupOrder.id,
    eventType: "ITEMS_READY",
    actorParticipantId: participant.id,
  });

  return { ok: true };
}

export async function setGroupOrderDeliveryAddress(input: {
  inviteToken: string;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
}): Promise<
  | { ok: true; deliveryAmount: number; distanceLabel: string }
  | { ok: false; error: string }
> {
  const access = await assertParticipantAccess(input.inviteToken);
  if (!access.ok) return access;
  if (access.participant.role !== "ORGANIZER") {
    return { ok: false, error: "Only the organizer can set delivery." };
  }
  if (!canEditGroupOrderItems(access.groupOrder.status)) {
    return { ok: false, error: "Delivery address can no longer be changed." };
  }

  const address = input.deliveryAddress.trim();
  if (address.length < 3) {
    return { ok: false, error: "Enter a delivery address." };
  }

  const { quoteDistanceDelivery } = await import(
    "@/features/delivery/application/quote-distance-delivery"
  );
  const point =
    input.deliveryLat != null && input.deliveryLng != null
      ? { lat: input.deliveryLat, lng: input.deliveryLng }
      : null;
  const quoted = await quoteDistanceDelivery(address, point);
  if (!quoted.ok) {
    return { ok: false, error: quoted.error };
  }

  const db = getDb();
  await db
    .update(groupOrders)
    .set({
      deliveryAddress: quoted.quote.destinationFormattedAddress || address,
      deliveryDistanceLabel: quoted.quote.distanceLabel,
      deliveryAmount: quoted.quote.deliveryAmount,
      updatedAt: new Date(),
    })
    .where(eq(groupOrders.id, access.groupOrder.id));

  await recalculateGroupOrderMoney(db, access.groupOrder.id);
  await appendGroupOrderEvent(db, {
    groupOrderId: access.groupOrder.id,
    eventType: "NOTE",
    actorParticipantId: access.participant.id,
    payload: {
      action: "delivery_address_set",
      deliveryAmount: quoted.quote.deliveryAmount,
      distanceLabel: quoted.quote.distanceLabel,
      usedMapPin: Boolean(point),
    },
  });

  return {
    ok: true,
    deliveryAmount: quoted.quote.deliveryAmount,
    distanceLabel: quoted.quote.distanceLabel,
  };
}

/** @deprecated Prefer setGroupOrderDeliveryAddress — kept for manual override. */
export async function setGroupOrderDeliveryAmount(input: {
  inviteToken: string;
  deliveryAmount: number;
}): Promise<GroupOrderMutationResult> {
  const access = await assertParticipantAccess(input.inviteToken);
  if (!access.ok) return access;
  if (access.participant.role !== "ORGANIZER") {
    return { ok: false, error: "Only the organizer can set delivery." };
  }

  const db = getDb();
  await db
    .update(groupOrders)
    .set({ deliveryAmount: input.deliveryAmount, updatedAt: new Date() })
    .where(eq(groupOrders.id, access.groupOrder.id));

  await recalculateGroupOrderMoney(db, access.groupOrder.id);
  return { ok: true };
}
