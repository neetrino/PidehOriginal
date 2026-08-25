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

import { createdAtColumn, idColumn, updatedAtColumn } from "@/db/schema/columns";
import {
  giftCardStatusEnum,
  giftCardTransactionTypeEnum,
} from "@/db/schema/enums";
import { users } from "@/db/schema/identity";
import { orders } from "@/db/schema/orders";

/**
 * Digital gift cards with fixed AMD face value and residual balance.
 * Activated only after successful payment (or admin issue).
 */
export const giftCards = pgTable(
  "gift_cards",
  {
    id: idColumn(),
    code: text("code").notNull(),
    initialAmount: integer("initial_amount").notNull(),
    balanceAmount: integer("balance_amount").notNull(),
    currency: text("currency").notNull().default("AMD"),
    status: giftCardStatusEnum("status").notNull().default("PENDING_PAYMENT"),
    purchaserUserId: uuid("purchaser_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    recipientUserId: uuid("recipient_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    purchaserName: text("purchaser_name").notNull(),
    purchaserEmail: text("purchaser_email"),
    recipientName: text("recipient_name").notNull(),
    recipientEmail: text("recipient_email").notNull(),
    recipientPhone: text("recipient_phone"),
    message: text("message"),
    paymentMethod: text("payment_method"),
    scheduledSendAt: timestamp("scheduled_send_at", {
      withTimezone: true,
      mode: "date",
    }),
    sentAt: timestamp("sent_at", {
      withTimezone: true,
      mode: "date",
    }),
    activatedAt: timestamp("activated_at", {
      withTimezone: true,
      mode: "date",
    }),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    disabledAt: timestamp("disabled_at", {
      withTimezone: true,
      mode: "date",
    }),
    disabledReason: text("disabled_reason"),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("gift_cards_code_uidx").on(table.code),
    index("gift_cards_status_created_idx").on(table.status, table.createdAt),
    index("gift_cards_purchaser_idx").on(table.purchaserUserId),
    index("gift_cards_recipient_user_idx").on(table.recipientUserId),
    index("gift_cards_recipient_email_idx").on(table.recipientEmail),
    index("gift_cards_expires_idx").on(table.expiresAt),
    check(
      "gift_cards_initial_positive_chk",
      sql`${table.initialAmount} > 0`,
    ),
    check(
      "gift_cards_balance_nonneg_chk",
      sql`${table.balanceAmount} >= 0`,
    ),
    check(
      "gift_cards_balance_lte_initial_chk",
      sql`${table.balanceAmount} <= ${table.initialAmount}`,
    ),
  ],
);

/**
 * Immutable gift card money ledger.
 * Current balance is cached on `gift_cards.balance_amount`.
 */
export const giftCardTransactions = pgTable(
  "gift_card_transactions",
  {
    id: idColumn(),
    giftCardId: uuid("gift_card_id")
      .notNull()
      .references(() => giftCards.id, { onDelete: "restrict" }),
    orderId: uuid("order_id").references(() => orders.id, {
      onDelete: "restrict",
    }),
    type: giftCardTransactionTypeEnum("type").notNull(),
    /** Signed delta applied to the gift card balance. */
    delta: integer("delta").notNull(),
    resultingBalance: integer("resulting_balance").notNull(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    correlationId: text("correlation_id"),
    note: text("note"),
    createdAt: createdAtColumn(),
  },
  (table) => [
    index("gift_card_transactions_card_created_idx").on(
      table.giftCardId,
      table.createdAt,
    ),
    index("gift_card_transactions_order_idx").on(table.orderId),
    /** Checkout redeem is once per order; cancel/uncancel uses ADJUST rows. */
    uniqueIndex("gift_card_transactions_order_redeem_uidx")
      .on(table.orderId)
      .where(
        sql`${table.orderId} IS NOT NULL AND ${table.type} = 'REDEEM'`,
      ),
    check(
      "gift_card_transactions_resulting_nonneg_chk",
      sql`${table.resultingBalance} >= 0`,
    ),
    check(
      "gift_card_transactions_delta_nonzero_chk",
      sql`${table.delta} <> 0`,
    ),
  ],
);
