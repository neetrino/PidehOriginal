import "server-only";

import { and, eq } from "drizzle-orm";

import {
  bonusTransactions,
  groupOrderParticipants,
  groupOrders,
  orders,
} from "@/db/schema";
import type { DbTransaction } from "@/db/transaction";
import {
  earnBonusesForOrder,
  reverseAllEarnBonusesForOrder,
  reverseRedeemBonusesForOrder,
} from "@/features/bonuses/application/bonus-ledger";
import { allocateParticipantBonusBases } from "@/features/bonuses/domain/group-bonus-allocation";
import { bonusEligibleAfterGiftCard } from "@/features/gift-cards/domain/gift-card-rules";
import type { OrderStatus } from "@/features/orders/domain/order-status";
import { getStoreBonusSettings } from "@/features/settings/application/queries";

export type OrderBonusSnapshot = {
  id: string;
  userId: string | null;
  groupOrderId: string | null;
  subtotalAmount: number;
  discountAmount: number;
  bonusRedeemedAmount: number;
  bonusEarnedAmount: number;
  giftCardAmount: number;
};

/**
 * Applies earn/redeem reversals for an order fulfillment status transition.
 * Group orders credit each registered participant from their merchandise share.
 * Guest participants earn nothing. Idempotent via ledger unique keys.
 */
export async function applyBonusSideEffectsOnStatusChange(input: {
  tx: DbTransaction;
  order: OrderBonusSnapshot;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  actorUserId: string;
  correlationId: string;
}): Promise<void> {
  const { order, fromStatus, toStatus, actorUserId, correlationId, tx } =
    input;

  const leftDelivered = fromStatus === "DELIVERED" && toStatus !== "DELIVERED";
  const enteredDelivered =
    fromStatus !== "DELIVERED" && toStatus === "DELIVERED";
  const isTerminalCancelOrRefund =
    toStatus === "CANCELLED" || toStatus === "REFUNDED";

  if (leftDelivered) {
    await reverseAllEarnBonusesForOrder({
      tx,
      orderId: order.id,
      actorUserId,
      correlationId,
    });
  }

  if (enteredDelivered) {
    const settings = await getStoreBonusSettings();
    const eligibleTotal = bonusEligibleAfterGiftCard({
      subtotalAmount: order.subtotalAmount,
      discountAmount: order.discountAmount,
      giftCardAmount: order.giftCardAmount,
    });

    if (order.groupOrderId) {
      await earnGroupOrderBonuses({
        tx,
        order,
        eligibleTotal,
        settings,
        actorUserId,
        correlationId,
      });
    } else if (order.userId) {
      await earnBonusesForOrder({
        tx,
        userId: order.userId,
        orderId: order.id,
        eligibleMerchandiseAmount: eligibleTotal,
        settings,
        actorUserId,
        correlationId,
      });
    }
  }

  if (isTerminalCancelOrRefund && order.userId) {
    await reverseRedeemBonusesForOrder({
      tx,
      userId: order.userId,
      orderId: order.id,
      redeemAmount: order.bonusRedeemedAmount,
      actorUserId,
      correlationId,
    });
  }
}

async function earnGroupOrderBonuses(input: {
  tx: DbTransaction;
  order: OrderBonusSnapshot;
  eligibleTotal: number;
  settings: Awaited<ReturnType<typeof getStoreBonusSettings>>;
  actorUserId: string;
  correlationId: string;
}): Promise<void> {
  const { tx, order, eligibleTotal, settings, actorUserId, correlationId } =
    input;
  if (!order.groupOrderId || eligibleTotal <= 0) {
    return;
  }

  const [groupOrder] = await tx
    .select({
      organizerUserId: groupOrders.organizerUserId,
    })
    .from(groupOrders)
    .where(eq(groupOrders.id, order.groupOrderId))
    .limit(1);
  if (!groupOrder) {
    return;
  }

  const participants = await tx
    .select({
      userId: groupOrderParticipants.userId,
      subtotalAmount: groupOrderParticipants.subtotalAmount,
    })
    .from(groupOrderParticipants)
    .where(
      and(
        eq(groupOrderParticipants.groupOrderId, order.groupOrderId),
        eq(groupOrderParticipants.status, "ACTIVE"),
      ),
    );

  const shares = participants
    .filter(
      (participant): participant is typeof participant & { userId: string } =>
        Boolean(participant.userId) && participant.subtotalAmount > 0,
    )
    .map((participant) => ({
      userId: participant.userId,
      merchandiseAmount: participant.subtotalAmount,
    }));

  if (shares.length === 0) {
    return;
  }

  const allocations = allocateParticipantBonusBases({
    eligibleMerchandiseAmount: eligibleTotal,
    shares,
    remainderUserId: groupOrder.organizerUserId,
  });

  const existingEarn = await tx
    .select({ id: bonusTransactions.id })
    .from(bonusTransactions)
    .where(
      and(
        eq(bonusTransactions.orderId, order.id),
        eq(bonusTransactions.type, "EARN"),
      ),
    )
    .limit(1);

  if (existingEarn.length === 0) {
    await tx
      .update(orders)
      .set({ bonusEarnedAmount: 0, updatedAt: new Date() })
      .where(eq(orders.id, order.id));
  }

  for (const allocation of allocations) {
    await earnBonusesForOrder({
      tx,
      userId: allocation.userId,
      orderId: order.id,
      eligibleMerchandiseAmount: allocation.eligibleAmount,
      settings,
      actorUserId,
      correlationId,
      accumulateOrderSnapshot: true,
    });
  }
}
