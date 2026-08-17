import { and, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { groupOrderParticipants, groupOrders } from "@/db/schema";
import { assertOrganizerAccess } from "@/features/group-orders/application/access";
import { isSuccessfulParticipantPayment } from "@/features/group-orders/domain/spend-limit";
import { peekGroupOrderSession } from "@/features/group-orders/session";

export type GroupOrderCheckoutParticipant = {
  id: string;
  role: "ORGANIZER" | "PARTICIPANT";
  finalAmount: number;
  paymentId: string | null;
  paymentStatus: string;
};

export type GroupOrderCheckoutContext =
  | {
      active: true;
      inviteToken: string;
      groupOrderId: string;
      paymentMode: "ORGANIZER_PAYS_ALL" | "SPLIT_PER_PARTICIPANT";
      /**
       * SPLIT: other members already paid on the group page; organizer pays
       * `organizerPayableAmount` at checkout. Always false for organizer-pays-all.
       */
      splitOthersPrepaid: boolean;
      organizerPayableAmount: number;
      othersPrepaidAmount: number;
      deliveryAddress: string | null;
      deliveryAmount: number;
      deliveryDistanceLabel: string | null;
      participants: GroupOrderCheckoutParticipant[];
    }
  | { active: false };

/**
 * Resolves whether the current browser is an organizer finishing a group order
 * at standard checkout (after prepareGroupOrderCheckout).
 */
export async function resolveGroupOrderCheckoutContext(): Promise<GroupOrderCheckoutContext> {
  const session = await peekGroupOrderSession();
  if (!session.inviteToken) return { active: false };

  const access = await assertOrganizerAccess(session.inviteToken);
  if (!access.ok) return { active: false };
  if (access.groupOrder.status !== "CHECKOUT") return { active: false };

  const db = getDb();
  const participants = await db
    .select({
      id: groupOrderParticipants.id,
      role: groupOrderParticipants.role,
      finalAmount: groupOrderParticipants.finalAmount,
      paymentId: groupOrderParticipants.paymentId,
      paymentStatus: groupOrderParticipants.paymentStatus,
    })
    .from(groupOrderParticipants)
    .where(
      and(
        eq(groupOrderParticipants.groupOrderId, access.groupOrder.id),
        eq(groupOrderParticipants.status, "ACTIVE"),
      ),
    );

  const organizer = participants.find((p) => p.role === "ORGANIZER");
  const others = participants.filter((p) => p.role !== "ORGANIZER");
  const owingOthers = others.filter(
    (p) => p.finalAmount > 0 && p.paymentStatus !== "NOT_REQUIRED",
  );
  const splitOthersPrepaid =
    access.groupOrder.paymentMode === "SPLIT_PER_PARTICIPANT" &&
    owingOthers.length > 0 &&
    owingOthers.every((p) => isSuccessfulParticipantPayment(p.paymentStatus));

  const othersPrepaidAmount = owingOthers
    .filter((p) => isSuccessfulParticipantPayment(p.paymentStatus))
    .reduce((sum, p) => sum + p.finalAmount, 0);

  return {
    active: true,
    inviteToken: session.inviteToken,
    groupOrderId: access.groupOrder.id,
    paymentMode: access.groupOrder.paymentMode,
    splitOthersPrepaid,
    organizerPayableAmount: organizer?.finalAmount ?? 0,
    othersPrepaidAmount,
    deliveryAddress: access.groupOrder.deliveryAddress,
    deliveryAmount: access.groupOrder.deliveryAmount,
    deliveryDistanceLabel: access.groupOrder.deliveryDistanceLabel,
    participants,
  };
}

/** Lightweight storefront flag for CheckoutForm (no participant rows). */
export async function getGroupOrderCheckoutUiFlags(): Promise<{
  isGroupOrderCheckout: boolean;
  splitOthersPrepaid: boolean;
  organizerPayableAmount: number;
  othersPrepaidAmount: number;
  lockedDeliveryAmount: number | null;
  defaultDeliveryAddress: string | null;
}> {
  const ctx = await resolveGroupOrderCheckoutContext();
  if (!ctx.active) {
    return {
      isGroupOrderCheckout: false,
      splitOthersPrepaid: false,
      organizerPayableAmount: 0,
      othersPrepaidAmount: 0,
      lockedDeliveryAmount: null,
      defaultDeliveryAddress: null,
    };
  }
  return {
    isGroupOrderCheckout: true,
    splitOthersPrepaid: ctx.splitOthersPrepaid,
    organizerPayableAmount: ctx.organizerPayableAmount,
    othersPrepaidAmount: ctx.othersPrepaidAmount,
    lockedDeliveryAmount: ctx.deliveryAddress ? ctx.deliveryAmount : null,
    defaultDeliveryAddress: ctx.deliveryAddress,
  };
}

export async function loadGroupOrderRow(groupOrderId: string) {
  const [row] = await getDb()
    .select()
    .from(groupOrders)
    .where(eq(groupOrders.id, groupOrderId))
    .limit(1);
  return row ?? null;
}
