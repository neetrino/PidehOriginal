import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { createdAtColumn, idColumn } from "@/db/schema/columns";
import { bonusTransactionTypeEnum } from "@/db/schema/enums";
import { users } from "@/db/schema/identity";
import { orders } from "@/db/schema/orders";

/**
 * Immutable loyalty bonus ledger (1 point = 1 AMD).
 * Current balance is cached on `users.bonus_balance`.
 */
export const bonusTransactions = pgTable(
  "bonus_transactions",
  {
    id: idColumn(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    orderId: uuid("order_id").references(() => orders.id, {
      onDelete: "restrict",
    }),
    type: bonusTransactionTypeEnum("type").notNull(),
    /** Signed delta applied to the user balance. */
    delta: integer("delta").notNull(),
    resultingBalance: integer("resulting_balance").notNull(),
    /** Present on EARN rows when store expiry policy is configured. */
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    correlationId: text("correlation_id"),
    note: text("note"),
    createdAt: createdAtColumn(),
  },
  (table) => [
    index("bonus_transactions_user_created_idx").on(
      table.userId,
      table.createdAt,
    ),
    index("bonus_transactions_order_idx").on(table.orderId),
    /** One ledger row per (order, type, user) — supports group-order multi-earner accruals. */
    uniqueIndex("bonus_transactions_order_type_user_uidx")
      .on(table.orderId, table.type, table.userId)
      .where(sql`${table.orderId} IS NOT NULL`),
    check(
      "bonus_transactions_resulting_nonneg_chk",
      sql`${table.resultingBalance} >= 0`,
    ),
    check("bonus_transactions_delta_nonzero_chk", sql`${table.delta} <> 0`),
  ],
);
