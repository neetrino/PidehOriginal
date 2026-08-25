import "server-only";

import { desc, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { bonusTransactions, orders, users } from "@/db/schema";

export type BonusTransactionView = {
  id: string;
  type: string;
  delta: number;
  resultingBalance: number;
  expiresAt: Date | null;
  createdAt: Date;
  orderId: string | null;
  orderNumber: string | null;
  note: string | null;
};

export type CustomerBonusSummary = {
  availableBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  transactions: BonusTransactionView[];
};

/** Loads customer bonus balance, aggregates, and recent ledger rows. */
export async function getCustomerBonusSummary(
  userId: string,
  options?: { limit?: number },
): Promise<CustomerBonusSummary> {
  const limit = options?.limit ?? 50;

  const [user] = await getDb()
    .select({ bonusBalance: users.bonusBalance })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const ledger = await getDb()
    .select({
      type: bonusTransactions.type,
      delta: bonusTransactions.delta,
    })
    .from(bonusTransactions)
    .where(eq(bonusTransactions.userId, userId));

  let totalEarned = 0;
  let totalRedeemed = 0;
  for (const row of ledger) {
    if (row.type === "EARN") {
      totalEarned += row.delta;
    } else if (row.type === "REDEEM") {
      totalRedeemed += Math.abs(row.delta);
    }
  }

  const rows = await getDb()
    .select({
      id: bonusTransactions.id,
      type: bonusTransactions.type,
      delta: bonusTransactions.delta,
      resultingBalance: bonusTransactions.resultingBalance,
      expiresAt: bonusTransactions.expiresAt,
      createdAt: bonusTransactions.createdAt,
      orderId: bonusTransactions.orderId,
      orderNumber: orders.orderNumber,
      note: bonusTransactions.note,
    })
    .from(bonusTransactions)
    .leftJoin(orders, eq(bonusTransactions.orderId, orders.id))
    .where(eq(bonusTransactions.userId, userId))
    .orderBy(desc(bonusTransactions.createdAt))
    .limit(limit);

  return {
    availableBalance: user?.bonusBalance ?? 0,
    totalEarned,
    totalRedeemed,
    transactions: rows,
  };
}

/** Admin read of a user's bonus ledger. */
export async function getAdminUserBonusSummary(
  userId: string,
): Promise<CustomerBonusSummary | null> {
  const [user] = await getDb()
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) {
    return null;
  }
  return getCustomerBonusSummary(userId, { limit: 100 });
}

export async function getUserBonusBalance(userId: string): Promise<number> {
  const [user] = await getDb()
    .select({ bonusBalance: users.bonusBalance })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user?.bonusBalance ?? 0;
}
