import { and, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { groupOrderParticipants, groupOrders } from "@/db/schema";
import { appendGroupOrderEvent } from "@/features/group-orders/application/money";
import { canTransitionGroupOrderStatus } from "@/features/group-orders/domain/status";
import { isSuccessfulParticipantPayment } from "@/features/group-orders/domain/spend-limit";

type Db = ReturnType<typeof getDb>;

/**
 * When every non-organizer who owes money is paid, move SPLIT group order
 * from AWAITING_PAYMENTS → CHECKOUT so the organizer can pay their share
 * on the standard checkout page.
 */
export async function advanceSplitGroupOrderIfAllPaid(input: {
  db?: Db;
  groupOrderId: string;
  actorUserId?: string | null;
  actorParticipantId?: string | null;
}): Promise<{ advanced: boolean }> {
  const db = input.db ?? getDb();
  const [groupOrder] = await db
    .select()
    .from(groupOrders)
    .where(eq(groupOrders.id, input.groupOrderId))
    .limit(1);

  if (!groupOrder) return { advanced: false };
  if (groupOrder.paymentMode !== "SPLIT_PER_PARTICIPANT") {
    return { advanced: false };
  }
  if (groupOrder.status !== "AWAITING_PAYMENTS") {
    return { advanced: false };
  }
  if (!canTransitionGroupOrderStatus("AWAITING_PAYMENTS", "CHECKOUT")) {
    return { advanced: false };
  }

  const active = await db
    .select()
    .from(groupOrderParticipants)
    .where(
      and(
        eq(groupOrderParticipants.groupOrderId, input.groupOrderId),
        eq(groupOrderParticipants.status, "ACTIVE"),
      ),
    );

  const needingPay = active.filter(
    (p) =>
      p.role !== "ORGANIZER" &&
      p.finalAmount > 0 &&
      p.paymentStatus !== "NOT_REQUIRED",
  );
  const allPaid = needingPay.every((p) =>
    isSuccessfulParticipantPayment(p.paymentStatus),
  );
  if (!allPaid) return { advanced: false };

  await db
    .update(groupOrders)
    .set({ status: "CHECKOUT", updatedAt: new Date() })
    .where(eq(groupOrders.id, input.groupOrderId));

  await appendGroupOrderEvent(db, {
    groupOrderId: input.groupOrderId,
    eventType: "STATUS_CHANGE",
    fromState: "AWAITING_PAYMENTS",
    toState: "CHECKOUT",
    actorUserId: input.actorUserId ?? null,
    actorParticipantId: input.actorParticipantId ?? null,
  });

  return { advanced: true };
}
