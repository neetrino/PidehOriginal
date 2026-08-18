import { and, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { groupOrderParticipants, groupOrders } from "@/db/schema";
import {
  appendGroupOrderEvent,
  paymentStatusForMode,
} from "@/features/group-orders/application/money";
import {
  GROUP_ORDER_DEFAULT_TTL_MS,
  type GroupOrderPaymentMode,
} from "@/features/group-orders/domain/status";
import {
  createGroupOrderSchema,
  type CreateGroupOrderInput,
} from "@/features/group-orders/schemas";
import { setGroupOrderSession } from "@/features/group-orders/session";
import {
  getGuestCartToken,
  hashGuestToken,
} from "@/features/cart/guest-token";
import { getCurrentUser } from "@/lib/auth/session";
import { createId } from "@/lib/id";

export type CreateGroupOrderResult =
  | {
      ok: true;
      groupOrderId: string;
      inviteToken: string;
      participantId: string;
    }
  | { ok: false; error: string };

/** Creates a group-order session and the organizer participant row. */
export async function createGroupOrder(
  raw: CreateGroupOrderInput,
): Promise<CreateGroupOrderResult> {
  const parsed = createGroupOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input." };
  }

  const user = await getCurrentUser();
  const owner = user
    ? { organizerUserId: user.id }
    : {
        organizerGuestTokenHash: hashGuestToken(await getGuestCartToken()),
      };

  const displayName =
    parsed.data.organizerDisplayName ||
    (user
      ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "Organizer"
      : "Organizer");

  const paymentMode = parsed.data.paymentMode as GroupOrderPaymentMode;
  const groupOrderId = createId();
  const inviteToken = createId();
  const participantId = createId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + GROUP_ORDER_DEFAULT_TTL_MS);

  const db = getDb();

  await db.insert(groupOrders).values({
    id: groupOrderId,
    inviteToken,
    ...owner,
    organizerDisplayName: displayName,
    paymentMode,
    status: "OPEN",
    spendLimitAmount: parsed.data.spendLimitAmount ?? null,
    joinsClosed: false,
    deliveryAmount: 0,
    expiresAt,
  });

  await db.insert(groupOrderParticipants).values({
    id: participantId,
    groupOrderId,
    ...(user
      ? { userId: user.id }
      : { guestTokenHash: owner.organizerGuestTokenHash! }),
    displayName,
    role: "ORGANIZER",
    status: "ACTIVE",
    paymentStatus: paymentStatusForMode(paymentMode, "ORGANIZER"),
  });

  await appendGroupOrderEvent(db, {
    groupOrderId,
    eventType: "STATUS_CHANGE",
    fromState: null,
    toState: "OPEN",
    actorUserId: user?.id ?? null,
    actorParticipantId: participantId,
    payload: { paymentMode },
  });

  await setGroupOrderSession({ inviteToken, participantId });

  return { ok: true, groupOrderId, inviteToken, participantId };
}

export type JoinGroupOrderResult =
  | {
      ok: true;
      groupOrderId: string;
      inviteToken: string;
      participantId: string;
      paymentMode: GroupOrderPaymentMode;
      spendLimitAmount: number | null;
      organizerDisplayName: string;
    }
  | { ok: false; error: string };

/** Joins an open group order as a guest or signed-in participant. */
export async function joinGroupOrder(input: {
  inviteToken: string;
  displayName: string;
}): Promise<JoinGroupOrderResult> {
  const db = getDb();
  const [groupOrder] = await db
    .select()
    .from(groupOrders)
    .where(eq(groupOrders.inviteToken, input.inviteToken))
    .limit(1);

  if (!groupOrder) {
    return { ok: false, error: "Group order not found." };
  }
  if (groupOrder.status !== "OPEN") {
    return { ok: false, error: "This group order is no longer open." };
  }
  if (groupOrder.joinsClosed) {
    return { ok: false, error: "New participants can no longer join." };
  }
  if (groupOrder.expiresAt.getTime() < Date.now()) {
    await db
      .update(groupOrders)
      .set({ status: "EXPIRED", updatedAt: new Date() })
      .where(eq(groupOrders.id, groupOrder.id));
    return { ok: false, error: "This group order has expired." };
  }

  const user = await getCurrentUser();
  const guestHash = user
    ? null
    : hashGuestToken(await getGuestCartToken());

  const existing = await db
    .select()
    .from(groupOrderParticipants)
    .where(
      and(
        eq(groupOrderParticipants.groupOrderId, groupOrder.id),
        eq(groupOrderParticipants.status, "ACTIVE"),
        user
          ? eq(groupOrderParticipants.userId, user.id)
          : eq(groupOrderParticipants.guestTokenHash, guestHash!),
      ),
    )
    .limit(1);

  if (existing[0]) {
    await setGroupOrderSession({
      inviteToken: groupOrder.inviteToken,
      participantId: existing[0].id,
    });
    return {
      ok: true,
      groupOrderId: groupOrder.id,
      inviteToken: groupOrder.inviteToken,
      participantId: existing[0].id,
      paymentMode: groupOrder.paymentMode,
      spendLimitAmount: groupOrder.spendLimitAmount,
      organizerDisplayName: groupOrder.organizerDisplayName,
    };
  }

  const participantId = createId();
  await db.insert(groupOrderParticipants).values({
    id: participantId,
    groupOrderId: groupOrder.id,
    ...(user ? { userId: user.id } : { guestTokenHash: guestHash! }),
    displayName: input.displayName.trim(),
    role: "PARTICIPANT",
    status: "ACTIVE",
    paymentStatus: paymentStatusForMode(groupOrder.paymentMode, "PARTICIPANT"),
  });

  await appendGroupOrderEvent(db, {
    groupOrderId: groupOrder.id,
    eventType: "PARTICIPANT_JOINED",
    actorUserId: user?.id ?? null,
    actorParticipantId: participantId,
    payload: { displayName: input.displayName.trim() },
  });

  await setGroupOrderSession({
    inviteToken: groupOrder.inviteToken,
    participantId,
  });

  return {
    ok: true,
    groupOrderId: groupOrder.id,
    inviteToken: groupOrder.inviteToken,
    participantId,
    paymentMode: groupOrder.paymentMode,
    spendLimitAmount: groupOrder.spendLimitAmount,
    organizerDisplayName: groupOrder.organizerDisplayName,
  };
}
