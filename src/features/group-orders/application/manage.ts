import { and, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  groupOrderItems,
  groupOrderParticipants,
  groupOrders,
} from "@/db/schema";
import { assertOrganizerAccess } from "@/features/group-orders/application/access";
import {
  appendGroupOrderEvent,
  recalculateGroupOrderMoney,
} from "@/features/group-orders/application/money";
import {
  canTransitionGroupOrderStatus,
  nextStatusAfterLock,
  type GroupOrderStatus,
} from "@/features/group-orders/domain/status";
import { advanceSplitGroupOrderIfAllPaid } from "@/features/group-orders/application/advance-after-payments";
import { isSuccessfulParticipantPayment } from "@/features/group-orders/domain/spend-limit";

export type ManageResult = { ok: true } | { ok: false; error: string };

export async function updateGroupOrderSpendLimit(input: {
  inviteToken: string;
  spendLimitAmount: number | null;
}): Promise<ManageResult> {
  const access = await assertOrganizerAccess(input.inviteToken);
  if (!access.ok) return access;

  const db = getDb();
  await db
    .update(groupOrders)
    .set({
      spendLimitAmount: input.spendLimitAmount,
      updatedAt: new Date(),
    })
    .where(eq(groupOrders.id, access.groupOrder.id));

  await appendGroupOrderEvent(db, {
    groupOrderId: access.groupOrder.id,
    eventType: "SPEND_LIMIT_CHANGED",
    actorParticipantId: access.participant.id,
    payload: { spendLimitAmount: input.spendLimitAmount },
  });

  return { ok: true };
}

export async function setGroupOrderJoinsClosed(input: {
  inviteToken: string;
  joinsClosed: boolean;
}): Promise<ManageResult> {
  const access = await assertOrganizerAccess(input.inviteToken);
  if (!access.ok) return access;

  const db = getDb();
  await db
    .update(groupOrders)
    .set({ joinsClosed: input.joinsClosed, updatedAt: new Date() })
    .where(eq(groupOrders.id, access.groupOrder.id));

  await appendGroupOrderEvent(db, {
    groupOrderId: access.groupOrder.id,
    eventType: "JOINS_CLOSED",
    actorParticipantId: access.participant.id,
    payload: { joinsClosed: input.joinsClosed },
  });

  return { ok: true };
}

export async function removeGroupOrderParticipant(input: {
  inviteToken: string;
  participantId: string;
}): Promise<ManageResult> {
  const access = await assertOrganizerAccess(input.inviteToken);
  if (!access.ok) return access;

  if (input.participantId === access.participant.id) {
    return { ok: false, error: "Organizer cannot remove themselves." };
  }

  const db = getDb();
  const [target] = await db
    .select()
    .from(groupOrderParticipants)
    .where(
      and(
        eq(groupOrderParticipants.id, input.participantId),
        eq(groupOrderParticipants.groupOrderId, access.groupOrder.id),
      ),
    )
    .limit(1);

  if (!target || target.status !== "ACTIVE") {
    return { ok: false, error: "Participant not found." };
  }

  if (isSuccessfulParticipantPayment(target.paymentStatus)) {
    return {
      ok: false,
      error: "Cannot remove a participant with a successful payment.",
    };
  }

  await db
    .delete(groupOrderItems)
    .where(eq(groupOrderItems.participantId, target.id));

  await db
    .update(groupOrderParticipants)
    .set({ status: "REMOVED", updatedAt: new Date() })
    .where(eq(groupOrderParticipants.id, target.id));

  await recalculateGroupOrderMoney(db, access.groupOrder.id);
  await appendGroupOrderEvent(db, {
    groupOrderId: access.groupOrder.id,
    eventType: "PARTICIPANT_REMOVED",
    actorParticipantId: access.participant.id,
    payload: { participantId: target.id, displayName: target.displayName },
  });

  return { ok: true };
}

/**
 * Locks item collection and advances toward checkout / awaiting payments.
 */
export async function lockGroupOrder(input: {
  inviteToken: string;
}): Promise<ManageResult> {
  const access = await assertOrganizerAccess(input.inviteToken);
  if (!access.ok) return access;

  const { groupOrder, participant } = access;
  if (groupOrder.status !== "OPEN") {
    return { ok: false, error: "Group order is not open." };
  }

  const db = getDb();
  const active = await db
    .select()
    .from(groupOrderParticipants)
    .where(
      and(
        eq(groupOrderParticipants.groupOrderId, groupOrder.id),
        eq(groupOrderParticipants.status, "ACTIVE"),
      ),
    );

  const withItems = active.filter((p) => p.subtotalAmount > 0);
  if (withItems.length === 0) {
    return { ok: false, error: "Add at least one item before locking." };
  }

  await db
    .update(groupOrders)
    .set({
      status: "LOCKED",
      lockedAt: new Date(),
      joinsClosed: true,
      updatedAt: new Date(),
    })
    .where(eq(groupOrders.id, groupOrder.id));

  await appendGroupOrderEvent(db, {
    groupOrderId: groupOrder.id,
    eventType: "STATUS_CHANGE",
    fromState: "OPEN",
    toState: "LOCKED",
    actorParticipantId: participant.id,
  });

  const next = nextStatusAfterLock(groupOrder.paymentMode);
  if (!canTransitionGroupOrderStatus("LOCKED", next)) {
    return { ok: false, error: "Invalid status transition." };
  }

  await db
    .update(groupOrders)
    .set({ status: next, updatedAt: new Date() })
    .where(eq(groupOrders.id, groupOrder.id));

  await appendGroupOrderEvent(db, {
    groupOrderId: groupOrder.id,
    eventType: "STATUS_CHANGE",
    fromState: "LOCKED",
    toState: next,
    actorParticipantId: participant.id,
  });

  await recalculateGroupOrderMoney(db, groupOrder.id);

  if (next === "AWAITING_PAYMENTS") {
    const { advanceSplitGroupOrderIfAllPaid } = await import(
      "@/features/group-orders/application/advance-after-payments"
    );
    await advanceSplitGroupOrderIfAllPaid({
      db,
      groupOrderId: groupOrder.id,
      actorParticipantId: participant.id,
    });
  }

  return { ok: true };
}

export async function cancelGroupOrder(input: {
  inviteToken: string;
}): Promise<ManageResult> {
  const access = await assertOrganizerAccess(input.inviteToken);
  if (!access.ok) return access;

  const from = access.groupOrder.status as GroupOrderStatus;
  if (!canTransitionGroupOrderStatus(from, "CANCELLED")) {
    return { ok: false, error: "Cannot cancel in the current status." };
  }

  const db = getDb();
  await db
    .update(groupOrders)
    .set({ status: "CANCELLED", updatedAt: new Date() })
    .where(eq(groupOrders.id, access.groupOrder.id));

  await appendGroupOrderEvent(db, {
    groupOrderId: access.groupOrder.id,
    eventType: "STATUS_CHANGE",
    fromState: from,
    toState: "CANCELLED",
    actorParticipantId: access.participant.id,
  });

  return { ok: true };
}

export async function markParticipantPaymentFailed(input: {
  inviteToken: string;
  participantId: string;
}): Promise<ManageResult> {
  const access = await assertOrganizerAccess(input.inviteToken);
  if (!access.ok) return access;

  const db = getDb();
  await db
    .update(groupOrderParticipants)
    .set({ paymentStatus: "FAILED", updatedAt: new Date() })
    .where(
      and(
        eq(groupOrderParticipants.id, input.participantId),
        eq(groupOrderParticipants.groupOrderId, access.groupOrder.id),
      ),
    );

  await appendGroupOrderEvent(db, {
    groupOrderId: access.groupOrder.id,
    eventType: "PAYMENT_STATUS",
    actorParticipantId: access.participant.id,
    payload: { participantId: input.participantId, status: "FAILED" },
  });

  return { ok: true };
}

/** Marks a participant as paid (split mode / admin-assisted). */
export async function markParticipantPaid(input: {
  groupOrderId: string;
  participantId: string;
  actorUserId?: string | null;
}): Promise<ManageResult> {
  const db = getDb();
  const [groupOrder] = await db
    .select()
    .from(groupOrders)
    .where(eq(groupOrders.id, input.groupOrderId))
    .limit(1);
  if (!groupOrder) return { ok: false, error: "Not found." };

  await db
    .update(groupOrderParticipants)
    .set({ paymentStatus: "PAID", updatedAt: new Date() })
    .where(
      and(
        eq(groupOrderParticipants.id, input.participantId),
        eq(groupOrderParticipants.groupOrderId, input.groupOrderId),
      ),
    );

  await appendGroupOrderEvent(db, {
    groupOrderId: input.groupOrderId,
    eventType: "PAYMENT_STATUS",
    actorUserId: input.actorUserId ?? null,
    payload: {
      participantId: input.participantId,
      status: "PAID",
      source: "admin_mark_paid",
    },
  });

  await advanceSplitGroupOrderIfAllPaid({
    db,
    groupOrderId: input.groupOrderId,
    actorUserId: input.actorUserId ?? null,
  });

  return { ok: true };
}
