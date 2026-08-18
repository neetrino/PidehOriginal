import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { products } from "@/db/schema/catalog";
import {
  createdAtColumn,
  idColumn,
  updatedAtColumn,
} from "@/db/schema/columns";
import {
  groupOrderEventTypeEnum,
  groupOrderParticipantPaymentStatusEnum,
  groupOrderParticipantRoleEnum,
  groupOrderParticipantStatusEnum,
  groupOrderPaymentModeEnum,
  groupOrderStatusEnum,
} from "@/db/schema/enums";
import { users } from "@/db/schema/identity";
import { orders } from "@/db/schema/orders";

/**
 * Shared group-order session. One final `orders` row may be linked after checkout.
 * Invite access uses opaque `inviteToken` (UUIDv7), never a sequential id.
 */
export const groupOrders = pgTable(
  "group_orders",
  {
    id: idColumn(),
    inviteToken: uuid("invite_token").notNull(),
    organizerUserId: uuid("organizer_user_id").references(() => users.id, {
      onDelete: "restrict",
    }),
    organizerGuestTokenHash: text("organizer_guest_token_hash"),
    organizerDisplayName: text("organizer_display_name").notNull(),
    paymentMode: groupOrderPaymentModeEnum("payment_mode").notNull(),
    status: groupOrderStatusEnum("status").notNull().default("OPEN"),
    /** Per-participant merchandise subtotal cap (AMD). Null = no limit. */
    spendLimitAmount: integer("spend_limit_amount"),
    joinsClosed: boolean("joins_closed").notNull().default(false),
    /** Snapshot of quoted delivery fee when address is set / checkout begins. */
    deliveryAmount: integer("delivery_amount").notNull().default(0),
    /** Delivery destination chosen by organizer before lock (for fee quote + split). */
    deliveryAddress: text("delivery_address"),
    deliveryDistanceLabel: text("delivery_distance_label"),
    orderId: uuid("order_id").references(() => orders.id, {
      onDelete: "set null",
    }),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    lockedAt: timestamp("locked_at", {
      withTimezone: true,
      mode: "date",
    }),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("group_orders_invite_token_uidx").on(table.inviteToken),
    index("group_orders_status_created_idx").on(table.status, table.createdAt),
    index("group_orders_organizer_user_idx").on(table.organizerUserId),
    index("group_orders_order_idx").on(table.orderId),
    check(
      "group_orders_owner_chk",
      sql`(
        (${table.organizerUserId} IS NOT NULL AND ${table.organizerGuestTokenHash} IS NULL)
        OR (${table.organizerUserId} IS NULL AND ${table.organizerGuestTokenHash} IS NOT NULL)
      )`,
    ),
    check(
      "group_orders_spend_limit_chk",
      sql`${table.spendLimitAmount} IS NULL OR ${table.spendLimitAmount} > 0`,
    ),
    check(
      "group_orders_delivery_nonneg_chk",
      sql`${table.deliveryAmount} >= 0`,
    ),
  ],
);

export const groupOrderParticipants = pgTable(
  "group_order_participants",
  {
    id: idColumn(),
    groupOrderId: uuid("group_order_id")
      .notNull()
      .references(() => groupOrders.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "restrict",
    }),
    guestTokenHash: text("guest_token_hash"),
    displayName: text("display_name").notNull(),
    role: groupOrderParticipantRoleEnum("role").notNull(),
    status: groupOrderParticipantStatusEnum("status").notNull().default("ACTIVE"),
    paymentStatus: groupOrderParticipantPaymentStatusEnum("payment_status")
      .notNull()
      .default("NOT_REQUIRED"),
    /** Linked payment attempt id (no FK — avoids circular import with payments). */
    paymentId: uuid("payment_id"),
    /** Cached merchandise subtotal (AMD). Recalculated on item changes. */
    subtotalAmount: integer("subtotal_amount").notNull().default(0),
    deliveryShareAmount: integer("delivery_share_amount").notNull().default(0),
    finalAmount: integer("final_amount").notNull().default(0),
    itemsReady: boolean("items_ready").notNull().default(false),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    index("group_order_participants_order_idx").on(table.groupOrderId),
    index("group_order_participants_user_idx").on(table.userId),
    uniqueIndex("group_order_participants_active_user_uidx")
      .on(table.groupOrderId, table.userId)
      .where(
        sql`${table.status} = 'ACTIVE' AND ${table.userId} IS NOT NULL`,
      ),
    uniqueIndex("group_order_participants_active_guest_uidx")
      .on(table.groupOrderId, table.guestTokenHash)
      .where(
        sql`${table.status} = 'ACTIVE' AND ${table.guestTokenHash} IS NOT NULL`,
      ),
    check(
      "group_order_participants_owner_chk",
      sql`(
        (${table.userId} IS NOT NULL AND ${table.guestTokenHash} IS NULL)
        OR (${table.userId} IS NULL AND ${table.guestTokenHash} IS NOT NULL)
      )`,
    ),
    check(
      "group_order_participants_money_nonneg_chk",
      sql`${table.subtotalAmount} >= 0
        AND ${table.deliveryShareAmount} >= 0
        AND ${table.finalAmount} >= 0`,
    ),
  ],
);

export const groupOrderItems = pgTable(
  "group_order_items",
  {
    id: idColumn(),
    groupOrderId: uuid("group_order_id")
      .notNull()
      .references(() => groupOrders.id, { onDelete: "cascade" }),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => groupOrderParticipants.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    selectionKey: text("selection_key").notNull().default(""),
    quantity: integer("quantity").notNull(),
    /** Unit price snapshot at last recalculation (AMD, product + additions). */
    unitAmount: integer("unit_amount").notNull().default(0),
    lineTotalAmount: integer("line_total_amount").notNull().default(0),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("group_order_items_participant_product_selection_uidx").on(
      table.participantId,
      table.productId,
      table.selectionKey,
    ),
    index("group_order_items_order_idx").on(table.groupOrderId),
    index("group_order_items_participant_idx").on(table.participantId),
    check("group_order_items_qty_chk", sql`${table.quantity} > 0`),
    check(
      "group_order_items_money_nonneg_chk",
      sql`${table.unitAmount} >= 0 AND ${table.lineTotalAmount} >= 0`,
    ),
  ],
);

export const groupOrderItemModifiers = pgTable(
  "group_order_item_modifiers",
  {
    id: idColumn(),
    groupOrderItemId: uuid("group_order_item_id")
      .notNull()
      .references(() => groupOrderItems.id, { onDelete: "cascade" }),
    modifierId: uuid("modifier_id").notNull(),
    kindSnapshot: text("kind_snapshot").notNull(),
    nameSnapshot: text("name_snapshot").notNull(),
    priceAmountSnapshot: integer("price_amount_snapshot").notNull().default(0),
    createdAt: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("group_order_item_modifiers_uidx").on(
      table.groupOrderItemId,
      table.modifierId,
    ),
    index("group_order_item_modifiers_item_idx").on(table.groupOrderItemId),
  ],
);

export const groupOrderEvents = pgTable(
  "group_order_events",
  {
    id: idColumn(),
    groupOrderId: uuid("group_order_id")
      .notNull()
      .references(() => groupOrders.id, { onDelete: "cascade" }),
    eventType: groupOrderEventTypeEnum("event_type").notNull(),
    fromState: text("from_state"),
    toState: text("to_state"),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    actorParticipantId: uuid("actor_participant_id").references(
      () => groupOrderParticipants.id,
      { onDelete: "set null" },
    ),
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    createdAt: createdAtColumn(),
  },
  (table) => [
    index("group_order_events_order_created_idx").on(
      table.groupOrderId,
      table.createdAt,
    ),
    index("group_order_events_type_idx").on(table.eventType),
  ],
);
