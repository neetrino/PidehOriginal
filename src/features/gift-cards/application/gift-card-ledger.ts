import "server-only";

import { and, eq } from "drizzle-orm";

import { giftCardTransactions, giftCards } from "@/db/schema";
import type { DbTransaction } from "@/db/transaction";
import {
  nextGiftCardBalance,
  resolveGiftCardStatusAfterBalance,
  giftCardLedgerTargetNet,
  type GiftCardStatus,
} from "@/features/gift-cards/domain/gift-card-rules";
import { createId } from "@/lib/id";

type GiftCardTxType = "ISSUE" | "REDEEM" | "REVERSAL" | "ADJUST";

async function hasOrderTransactionOfType(
  tx: DbTransaction,
  orderId: string,
  type: GiftCardTxType,
): Promise<boolean> {
  const [existing] = await tx
    .select({ id: giftCardTransactions.id })
    .from(giftCardTransactions)
    .where(
      and(
        eq(giftCardTransactions.orderId, orderId),
        eq(giftCardTransactions.type, type),
      ),
    )
    .limit(1);
  return Boolean(existing);
}

async function writeLedgerEntry(input: {
  tx: DbTransaction;
  giftCardId: string;
  type: GiftCardTxType;
  delta: number;
  orderId?: string | null;
  actorUserId?: string | null;
  correlationId?: string | null;
  note?: string | null;
  now?: Date;
  forceStatus?: GiftCardStatus;
}): Promise<number> {
  const now = input.now ?? new Date();
  const [locked] = await input.tx
    .select({
      id: giftCards.id,
      balanceAmount: giftCards.balanceAmount,
      status: giftCards.status,
    })
    .from(giftCards)
    .where(eq(giftCards.id, input.giftCardId))
    .for("update")
    .limit(1);

  if (!locked) {
    throw new Error("GIFT_CARD_NOT_FOUND");
  }

  const resultingBalance = nextGiftCardBalance(locked.balanceAmount, input.delta);
  const appliedDelta = resultingBalance - locked.balanceAmount;
  if (appliedDelta === 0) {
    return resultingBalance;
  }

  const nextStatus =
    input.forceStatus ??
    resolveGiftCardStatusAfterBalance(resultingBalance, locked.status);

  await input.tx
    .update(giftCards)
    .set({
      balanceAmount: resultingBalance,
      status: nextStatus,
      updatedAt: now,
    })
    .where(eq(giftCards.id, input.giftCardId));

  await input.tx.insert(giftCardTransactions).values({
    id: createId(),
    giftCardId: input.giftCardId,
    orderId: input.orderId ?? null,
    type: input.type,
    delta: appliedDelta,
    resultingBalance,
    actorUserId: input.actorUserId ?? null,
    correlationId: input.correlationId ?? null,
    note: input.note ?? null,
  });

  return resultingBalance;
}

/** Credits face value when a gift card becomes ACTIVE. */
export async function issueGiftCardBalance(input: {
  tx: DbTransaction;
  giftCardId: string;
  amount: number;
  actorUserId?: string | null;
  correlationId?: string | null;
  now?: Date;
}): Promise<void> {
  if (input.amount <= 0) {
    return;
  }

  const [existing] = await input.tx
    .select({ id: giftCardTransactions.id })
    .from(giftCardTransactions)
    .where(
      and(
        eq(giftCardTransactions.giftCardId, input.giftCardId),
        eq(giftCardTransactions.type, "ISSUE"),
      ),
    )
    .limit(1);
  if (existing) {
    return;
  }

  await writeLedgerEntry({
    tx: input.tx,
    giftCardId: input.giftCardId,
    type: "ISSUE",
    delta: input.amount,
    actorUserId: input.actorUserId,
    correlationId: input.correlationId,
    now: input.now,
    forceStatus: "ACTIVE",
  });
}

/** Debits gift card balance at checkout. */
export async function redeemGiftCardForOrder(input: {
  tx: DbTransaction;
  giftCardId: string;
  orderId: string;
  amount: number;
  correlationId: string;
}): Promise<void> {
  if (input.amount <= 0) {
    return;
  }
  if (await hasOrderTransactionOfType(input.tx, input.orderId, "REDEEM")) {
    return;
  }

  await writeLedgerEntry({
    tx: input.tx,
    giftCardId: input.giftCardId,
    orderId: input.orderId,
    type: "REDEEM",
    delta: -input.amount,
    correlationId: input.correlationId,
  });
}

/** Restores redeemed amount on cancel/refund. */
export async function reverseGiftCardRedeemForOrder(input: {
  tx: DbTransaction;
  giftCardId: string;
  orderId: string;
  redeemAmount: number;
  actorUserId?: string | null;
  correlationId: string;
}): Promise<void> {
  if (input.redeemAmount <= 0) {
    return;
  }
  if (await hasOrderTransactionOfType(input.tx, input.orderId, "REVERSAL")) {
    return;
  }
  if (!(await hasOrderTransactionOfType(input.tx, input.orderId, "REDEEM"))) {
    return;
  }

  await writeLedgerEntry({
    tx: input.tx,
    giftCardId: input.giftCardId,
    orderId: input.orderId,
    type: "REVERSAL",
    delta: input.redeemAmount,
    actorUserId: input.actorUserId,
    correlationId: input.correlationId,
  });
}

/**
 * Syncs gift-card balance to match order status.
 * Cancel/refund → net 0 (restore). Any other status → keep debit of -giftCardAmount.
 * Uses ADJUST so cancel ↔ uncancel cycles stay correct.
 */
export async function syncGiftCardLedgerForOrderStatus(input: {
  tx: DbTransaction;
  giftCardId: string;
  orderId: string;
  giftCardAmount: number;
  orderStatus: string;
  actorUserId?: string | null;
  correlationId: string;
}): Promise<void> {
  if (input.giftCardAmount <= 0) {
    return;
  }

  const targetNet = giftCardLedgerTargetNet({
    giftCardAmount: input.giftCardAmount,
    orderStatus: input.orderStatus,
  });

  const rows = await input.tx
    .select({ delta: giftCardTransactions.delta })
    .from(giftCardTransactions)
    .where(eq(giftCardTransactions.orderId, input.orderId));

  const currentNet = rows.reduce((sum, row) => sum + row.delta, 0);
  const correction = targetNet - currentNet;
  if (correction === 0) {
    return;
  }

  await writeLedgerEntry({
    tx: input.tx,
    giftCardId: input.giftCardId,
    orderId: input.orderId,
    type: "ADJUST",
    delta: correction,
    actorUserId: input.actorUserId,
    correlationId: input.correlationId,
    note: `Sync gift card ledger for order status ${input.orderStatus}`,
  });
}
