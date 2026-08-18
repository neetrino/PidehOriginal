"use server";

import { revalidatePath } from "next/cache";

import { createGroupOrder, joinGroupOrder } from "@/features/group-orders/application/create-join";
import {
  addGroupOrderItem,
  markParticipantItemsReady,
  removeGroupOrderItem,
  setGroupOrderDeliveryAmount,
  setGroupOrderDeliveryAddress,
  updateGroupOrderItemQuantity,
} from "@/features/group-orders/application/items";
import {
  cancelGroupOrder,
  lockGroupOrder,
  removeGroupOrderParticipant,
  setGroupOrderJoinsClosed,
  updateGroupOrderSpendLimit,
} from "@/features/group-orders/application/manage";
import {
  getAdminGroupOrderDetail,
  getGroupOrderDetailByInvite,
  listAdminGroupOrders,
} from "@/features/group-orders/application/queries";
import {
  addGroupOrderItemSchema,
  adminGroupOrderIdSchema,
  adminMarkParticipantPaidSchema,
  completeParticipantCardPaymentSchema,
  createGroupOrderSchema,
  groupOrderInviteTokenSchema,
  joinGroupOrderSchema,
  markItemsReadySchema,
  removeGroupOrderItemSchema,
  removeParticipantSchema,
  setDeliveryAmountSchema,
  setDeliveryAddressSchema,
  setJoinsClosedSchema,
  updateGroupOrderItemQuantitySchema,
  updateSpendLimitSchema,
} from "@/features/group-orders/schemas";
import { clearGroupOrderSession } from "@/features/group-orders/session";
import { markParticipantPaid } from "@/features/group-orders/application/manage";
import { prepareGroupOrderCheckout } from "@/features/group-orders/application/prepare-checkout";
import { completeParticipantCardPayment } from "@/features/group-orders/application/participant-payment";
import { requireAdmin } from "@/lib/auth/policies";
import type { Locale } from "@/lib/i18n/config";
import type { Currency } from "@/lib/money/currency";
import { getDb } from "@/db/client";
import { groupOrders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { appendGroupOrderEvent } from "@/features/group-orders/application/money";
import { canTransitionGroupOrderStatus } from "@/features/group-orders/domain/status";
import { getCurrentUser } from "@/lib/auth/session";

function revalidateGroupOrder(inviteToken: string): void {
  revalidatePath(`/[locale]/group-orders/${inviteToken}`, "page");
  revalidatePath("/[locale]/admin/group-orders", "page");
  revalidatePath("/", "layout");
}

export async function createGroupOrderAction(raw: unknown) {
  const parsed = createGroupOrderSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };
  const result = await createGroupOrder(parsed.data);
  if (result.ok) revalidateGroupOrder(result.inviteToken);
  return result;
}

export async function joinGroupOrderAction(raw: unknown) {
  const parsed = joinGroupOrderSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };
  const result = await joinGroupOrder(parsed.data);
  if (result.ok) revalidateGroupOrder(result.inviteToken);
  return result;
}

export async function addGroupOrderItemAction(raw: unknown) {
  const parsed = addGroupOrderItemSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };
  const result = await addGroupOrderItem(parsed.data);
  if (result.ok) revalidateGroupOrder(parsed.data.inviteToken);
  return result;
}

export async function updateGroupOrderItemQuantityAction(raw: unknown) {
  const parsed = updateGroupOrderItemQuantitySchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };
  const result = await updateGroupOrderItemQuantity(parsed.data);
  if (result.ok) revalidateGroupOrder(parsed.data.inviteToken);
  return result;
}

export async function removeGroupOrderItemAction(raw: unknown) {
  const parsed = removeGroupOrderItemSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };
  const result = await removeGroupOrderItem({
    ...parsed.data,
    asOrganizer: true,
  });
  if (result.ok) revalidateGroupOrder(parsed.data.inviteToken);
  return result;
}

export async function markItemsReadyAction(raw: unknown) {
  const parsed = markItemsReadySchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };
  const result = await markParticipantItemsReady(parsed.data);
  if (result.ok) revalidateGroupOrder(parsed.data.inviteToken);
  return result;
}

export async function updateSpendLimitAction(raw: unknown) {
  const parsed = updateSpendLimitSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };
  const result = await updateGroupOrderSpendLimit(parsed.data);
  if (result.ok) revalidateGroupOrder(parsed.data.inviteToken);
  return result;
}

export async function setJoinsClosedAction(raw: unknown) {
  const parsed = setJoinsClosedSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };
  const result = await setGroupOrderJoinsClosed(parsed.data);
  if (result.ok) revalidateGroupOrder(parsed.data.inviteToken);
  return result;
}

export async function removeParticipantAction(raw: unknown) {
  const parsed = removeParticipantSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };
  const result = await removeGroupOrderParticipant(parsed.data);
  if (result.ok) revalidateGroupOrder(parsed.data.inviteToken);
  return result;
}

export async function lockGroupOrderAction(raw: unknown) {
  const parsed = groupOrderInviteTokenSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };
  const result = await lockGroupOrder(parsed.data);
  if (result.ok) revalidateGroupOrder(parsed.data.inviteToken);
  return result;
}

export async function cancelGroupOrderAction(raw: unknown) {
  const parsed = groupOrderInviteTokenSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };
  const result = await cancelGroupOrder(parsed.data);
  if (result.ok) {
    await clearGroupOrderSession();
    revalidateGroupOrder(parsed.data.inviteToken);
  }
  return result;
}

export async function setDeliveryAmountAction(raw: unknown) {
  const parsed = setDeliveryAmountSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };
  const result = await setGroupOrderDeliveryAmount(parsed.data);
  if (result.ok) revalidateGroupOrder(parsed.data.inviteToken);
  return result;
}

export async function setDeliveryAddressAction(raw: unknown) {
  const parsed = setDeliveryAddressSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };
  const result = await setGroupOrderDeliveryAddress(parsed.data);
  if (result.ok) revalidateGroupOrder(parsed.data.inviteToken);
  return result;
}

export async function loadGroupOrderDetailAction(
  inviteToken: string,
  locale: Locale,
  currency: Currency,
) {
  return getGroupOrderDetailByInvite({ inviteToken, locale, currency });
}

export async function leaveGroupOrderSessionAction() {
  await clearGroupOrderSession();
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function listAdminGroupOrdersAction(locale: Locale) {
  await requireAdmin(locale);
  return listAdminGroupOrders();
}

export async function getAdminGroupOrderDetailAction(
  groupOrderId: string,
  locale: Locale,
  currency: Currency,
) {
  await requireAdmin(locale);
  return getAdminGroupOrderDetail({ groupOrderId, locale, currency });
}

export async function adminCancelGroupOrderAction(
  raw: unknown,
  locale: Locale,
) {
  await requireAdmin(locale);
  const parsed = adminGroupOrderIdSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };

  const db = getDb();
  const [row] = await db
    .select()
    .from(groupOrders)
    .where(eq(groupOrders.id, parsed.data.groupOrderId))
    .limit(1);
  if (!row) return { ok: false as const, error: "Not found." };
  if (!canTransitionGroupOrderStatus(row.status, "CANCELLED")) {
    return { ok: false as const, error: "Cannot cancel in current status." };
  }

  const user = await getCurrentUser();
  await db
    .update(groupOrders)
    .set({ status: "CANCELLED", updatedAt: new Date() })
    .where(eq(groupOrders.id, row.id));
  await appendGroupOrderEvent(db, {
    groupOrderId: row.id,
    eventType: "ADMIN_ACTION",
    fromState: row.status,
    toState: "CANCELLED",
    actorUserId: user?.id ?? null,
    payload: { action: "cancel" },
  });
  revalidateGroupOrder(row.inviteToken);
  return { ok: true as const };
}

export async function adminCloseJoinsAction(raw: unknown, locale: Locale) {
  await requireAdmin(locale);
  const parsed = adminGroupOrderIdSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };

  const db = getDb();
  const [row] = await db
    .select()
    .from(groupOrders)
    .where(eq(groupOrders.id, parsed.data.groupOrderId))
    .limit(1);
  if (!row) return { ok: false as const, error: "Not found." };

  const user = await getCurrentUser();
  await db
    .update(groupOrders)
    .set({ joinsClosed: true, updatedAt: new Date() })
    .where(eq(groupOrders.id, row.id));
  await appendGroupOrderEvent(db, {
    groupOrderId: row.id,
    eventType: "ADMIN_ACTION",
    actorUserId: user?.id ?? null,
    payload: { action: "close_joins" },
  });
  revalidateGroupOrder(row.inviteToken);
  return { ok: true as const };
}

export async function adminMarkParticipantPaidAction(
  raw: unknown,
  locale: Locale,
) {
  const admin = await requireAdmin(locale);
  const parsed = adminMarkParticipantPaidSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };

  const result = await markParticipantPaid({
    groupOrderId: parsed.data.groupOrderId,
    participantId: parsed.data.participantId,
    actorUserId: admin.id,
  });

  if (result.ok) {
    const [row] = await getDb()
      .select({ inviteToken: groupOrders.inviteToken })
      .from(groupOrders)
      .where(eq(groupOrders.id, parsed.data.groupOrderId))
      .limit(1);
    if (row) revalidateGroupOrder(row.inviteToken);
  }
  return result;
}

export async function prepareGroupOrderCheckoutAction(raw: unknown) {
  const parsed = groupOrderInviteTokenSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };
  const result = await prepareGroupOrderCheckout(parsed.data.inviteToken);
  if (result.ok) {
    revalidatePath("/[locale]/checkout", "page");
    revalidatePath("/", "layout");
  }
  return result;
}

export async function completeParticipantCardPaymentAction(raw: unknown) {
  const parsed = completeParticipantCardPaymentSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };
  const result = await completeParticipantCardPayment(parsed.data);
  if (result.ok) {
    revalidateGroupOrder(parsed.data.inviteToken);
    revalidatePath(
      `/[locale]/group-orders/${parsed.data.inviteToken}/pay`,
      "page",
    );
  }
  return result;
}
