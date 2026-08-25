import "server-only";

import { eq } from "drizzle-orm";

import { giftCards } from "@/db/schema";
import type { DbTransaction } from "@/db/transaction";
import { syncGiftCardLedgerForOrderStatus } from "@/features/gift-cards/application/gift-card-ledger";
import type { OrderStatus } from "@/features/orders/domain/order-status";

export type OrderGiftCardSnapshot = {
  id: string;
  giftCardId: string | null;
  giftCardAmount: number;
};

/**
 * Keeps gift-card balance aligned with order status:
 * - cancel/refund restores used amount
 * - leaving cancel/refund re-applies the debit
 */
export async function applyGiftCardSideEffectsOnStatusChange(input: {
  tx: DbTransaction;
  order: OrderGiftCardSnapshot;
  toStatus: OrderStatus;
  actorUserId: string;
  correlationId: string;
}): Promise<void> {
  const { order, toStatus, actorUserId, correlationId, tx } = input;
  if (!order.giftCardId || order.giftCardAmount <= 0) {
    return;
  }

  const [card] = await tx
    .select({ id: giftCards.id })
    .from(giftCards)
    .where(eq(giftCards.id, order.giftCardId))
    .limit(1);
  if (!card) {
    return;
  }

  await syncGiftCardLedgerForOrderStatus({
    tx,
    giftCardId: order.giftCardId,
    orderId: order.id,
    giftCardAmount: order.giftCardAmount,
    orderStatus: toStatus,
    actorUserId,
    correlationId,
  });
}
