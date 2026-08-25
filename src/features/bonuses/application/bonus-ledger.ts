import "server-only";

import { and, eq } from "drizzle-orm";

import { bonusTransactions, orders, users } from "@/db/schema";
import type { DbTransaction } from "@/db/transaction";
import {
  calculateBonusEarnAmount,
  nextBonusBalance,
  resolveEarnExpiresAt,
  type BonusSettings,
} from "@/features/bonuses/domain/bonus-rules";
import { createId } from "@/lib/id";

type BonusTxType =
  | "EARN"
  | "REDEEM"
  | "REVERSAL_EARN"
  | "REVERSAL_REDEEM"
  | "EXPIRE";

type LedgerWriteInput = {
  tx: DbTransaction;
  userId: string;
  orderId: string;
  type: BonusTxType;
  delta: number;
  actorUserId?: string | null;
  correlationId?: string | null;
  note?: string | null;
  expiresAt?: Date | null;
  now?: Date;
};

async function hasTransactionOfType(
  tx: DbTransaction,
  orderId: string,
  type: BonusTxType,
  userId?: string,
): Promise<boolean> {
  const conditions = [
    eq(bonusTransactions.orderId, orderId),
    eq(bonusTransactions.type, type),
  ];
  if (userId) {
    conditions.push(eq(bonusTransactions.userId, userId));
  }
  const [existing] = await tx
    .select({ id: bonusTransactions.id })
    .from(bonusTransactions)
    .where(and(...conditions))
    .limit(1);
  return Boolean(existing);
}

async function writeLedgerEntry(input: LedgerWriteInput): Promise<number> {
  const now = input.now ?? new Date();
  const [lockedUser] = await input.tx
    .select({
      id: users.id,
      bonusBalance: users.bonusBalance,
    })
    .from(users)
    .where(eq(users.id, input.userId))
    .for("update")
    .limit(1);

  if (!lockedUser) {
    throw new Error("BONUS_USER_NOT_FOUND");
  }

  const resultingBalance = nextBonusBalance(
    lockedUser.bonusBalance,
    input.delta,
  );
  const appliedDelta = resultingBalance - lockedUser.bonusBalance;
  if (appliedDelta === 0) {
    return resultingBalance;
  }

  await input.tx
    .update(users)
    .set({
      bonusBalance: resultingBalance,
      updatedAt: now,
    })
    .where(eq(users.id, input.userId));

  await input.tx.insert(bonusTransactions).values({
    id: createId(),
    userId: input.userId,
    orderId: input.orderId,
    type: input.type,
    delta: appliedDelta,
    resultingBalance,
    expiresAt: input.expiresAt ?? null,
    actorUserId: input.actorUserId ?? null,
    correlationId: input.correlationId ?? null,
    note: input.note ?? null,
  });

  return resultingBalance;
}

/** Debits bonus points at checkout for a registered customer. */
export async function redeemBonusesForOrder(input: {
  tx: DbTransaction;
  userId: string;
  orderId: string;
  amount: number;
  correlationId: string;
}): Promise<void> {
  if (input.amount <= 0) {
    return;
  }

  if (await hasTransactionOfType(input.tx, input.orderId, "REDEEM")) {
    return;
  }

  await writeLedgerEntry({
    tx: input.tx,
    userId: input.userId,
    orderId: input.orderId,
    type: "REDEEM",
    delta: -input.amount,
    correlationId: input.correlationId,
  });
}

/** Credits earn points when an order becomes DELIVERED. */
export async function earnBonusesForOrder(input: {
  tx: DbTransaction;
  userId: string;
  orderId: string;
  eligibleMerchandiseAmount: number;
  settings: BonusSettings;
  actorUserId?: string | null;
  correlationId: string;
  now?: Date;
  /** When true, adds to orders.bonusEarnedAmount instead of replacing. */
  accumulateOrderSnapshot?: boolean;
}): Promise<number> {
  if (
    await hasTransactionOfType(input.tx, input.orderId, "EARN", input.userId)
  ) {
    const [existing] = await input.tx
      .select({ delta: bonusTransactions.delta })
      .from(bonusTransactions)
      .where(
        and(
          eq(bonusTransactions.orderId, input.orderId),
          eq(bonusTransactions.type, "EARN"),
          eq(bonusTransactions.userId, input.userId),
        ),
      )
      .limit(1);
    return existing ? Math.abs(existing.delta) : 0;
  }

  const amount = calculateBonusEarnAmount(
    input.eligibleMerchandiseAmount,
    input.settings.accrualPercent,
  );
  if (amount <= 0) {
    return 0;
  }

  const now = input.now ?? new Date();
  const expiresAt = resolveEarnExpiresAt(now, input.settings.expiryDays);

  await writeLedgerEntry({
    tx: input.tx,
    userId: input.userId,
    orderId: input.orderId,
    type: "EARN",
    delta: amount,
    actorUserId: input.actorUserId,
    correlationId: input.correlationId,
    expiresAt,
    now,
  });

  if (input.accumulateOrderSnapshot) {
    const [order] = await input.tx
      .select({ bonusEarnedAmount: orders.bonusEarnedAmount })
      .from(orders)
      .where(eq(orders.id, input.orderId))
      .limit(1);
    await input.tx
      .update(orders)
      .set({
        bonusEarnedAmount: (order?.bonusEarnedAmount ?? 0) + amount,
        updatedAt: now,
      })
      .where(eq(orders.id, input.orderId));
  } else {
    await input.tx
      .update(orders)
      .set({ bonusEarnedAmount: amount, updatedAt: now })
      .where(eq(orders.id, input.orderId));
  }

  return amount;
}

/** Removes previously earned points (refund / leave DELIVERED) for one user. */
export async function reverseEarnBonusesForOrder(input: {
  tx: DbTransaction;
  userId: string;
  orderId: string;
  earnAmount: number;
  actorUserId?: string | null;
  correlationId: string;
}): Promise<void> {
  if (input.earnAmount <= 0) {
    return;
  }
  if (
    await hasTransactionOfType(
      input.tx,
      input.orderId,
      "REVERSAL_EARN",
      input.userId,
    )
  ) {
    return;
  }
  if (
    !(await hasTransactionOfType(input.tx, input.orderId, "EARN", input.userId))
  ) {
    return;
  }

  await writeLedgerEntry({
    tx: input.tx,
    userId: input.userId,
    orderId: input.orderId,
    type: "REVERSAL_EARN",
    delta: -input.earnAmount,
    actorUserId: input.actorUserId,
    correlationId: input.correlationId,
    note: "Clamped to non-negative balance when prior spend exceeded remaining earn.",
  });
}

/**
 * Reverses every EARN row for an order (solo or group multi-earner) and
 * clears orders.bonusEarnedAmount.
 */
export async function reverseAllEarnBonusesForOrder(input: {
  tx: DbTransaction;
  orderId: string;
  actorUserId?: string | null;
  correlationId: string;
}): Promise<void> {
  const earnRows = await input.tx
    .select({
      userId: bonusTransactions.userId,
      delta: bonusTransactions.delta,
    })
    .from(bonusTransactions)
    .where(
      and(
        eq(bonusTransactions.orderId, input.orderId),
        eq(bonusTransactions.type, "EARN"),
      ),
    );

  for (const row of earnRows) {
    await reverseEarnBonusesForOrder({
      tx: input.tx,
      userId: row.userId,
      orderId: input.orderId,
      earnAmount: Math.abs(row.delta),
      actorUserId: input.actorUserId,
      correlationId: input.correlationId,
    });
  }

  await input.tx
    .update(orders)
    .set({ bonusEarnedAmount: 0, updatedAt: new Date() })
    .where(eq(orders.id, input.orderId));
}

/** Returns redeemed points to the customer on cancel/refund. */
export async function reverseRedeemBonusesForOrder(input: {
  tx: DbTransaction;
  userId: string;
  orderId: string;
  redeemAmount: number;
  actorUserId?: string | null;
  correlationId: string;
}): Promise<void> {
  if (input.redeemAmount <= 0) {
    return;
  }
  if (await hasTransactionOfType(input.tx, input.orderId, "REVERSAL_REDEEM")) {
    return;
  }
  if (!(await hasTransactionOfType(input.tx, input.orderId, "REDEEM"))) {
    return;
  }

  await writeLedgerEntry({
    tx: input.tx,
    userId: input.userId,
    orderId: input.orderId,
    type: "REVERSAL_REDEEM",
    delta: input.redeemAmount,
    actorUserId: input.actorUserId,
    correlationId: input.correlationId,
  });
}
