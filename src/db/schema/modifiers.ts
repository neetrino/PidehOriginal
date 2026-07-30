import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { products } from "@/db/schema/catalog";
import {
  createdAtColumn,
  idColumn,
  updatedAtColumn,
} from "@/db/schema/columns";
import { cartItems } from "@/db/schema/commerce";
import { productModifierKindEnum } from "@/db/schema/enums";
import { orderItems } from "@/db/schema/orders";

/** Global reusable product additions (priced) and exceptions (unpriced). */
export const productModifiers = pgTable(
  "product_modifiers",
  {
    id: idColumn(),
    kind: productModifierKindEnum("kind").notNull(),
    name: text("name").notNull(),
    /** AMD minor units; required for ADDITION, always 0 for EXCEPTION. */
    priceAmount: integer("price_amount").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("product_modifiers_kind_name_uidx").on(table.kind, table.name),
    index("product_modifiers_kind_active_idx").on(table.kind, table.isActive),
    check(
      "product_modifiers_price_chk",
      sql`(
        (${table.kind} = 'ADDITION' AND ${table.priceAmount} >= 0)
        OR (${table.kind} = 'EXCEPTION' AND ${table.priceAmount} = 0)
      )`,
    ),
  ],
);

/** Which global modifiers are offered on a given product. */
export const productModifierLinks = pgTable(
  "product_modifier_links",
  {
    id: idColumn(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    modifierId: uuid("modifier_id")
      .notNull()
      .references(() => productModifiers.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("product_modifier_links_uidx").on(
      table.productId,
      table.modifierId,
    ),
    index("product_modifier_links_modifier_idx").on(table.modifierId),
  ],
);

/** Selected modifiers on a cart line (resolved at checkout). */
export const cartItemModifiers = pgTable(
  "cart_item_modifiers",
  {
    id: idColumn(),
    cartItemId: uuid("cart_item_id")
      .notNull()
      .references(() => cartItems.id, { onDelete: "cascade" }),
    modifierId: uuid("modifier_id")
      .notNull()
      .references(() => productModifiers.id, { onDelete: "restrict" }),
    createdAt: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("cart_item_modifiers_uidx").on(
      table.cartItemId,
      table.modifierId,
    ),
    index("cart_item_modifiers_modifier_idx").on(table.modifierId),
  ],
);

/** Immutable modifier snapshots for purchased order lines. */
export const orderItemModifiers = pgTable(
  "order_item_modifiers",
  {
    id: idColumn(),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "cascade" }),
    modifierId: uuid("modifier_id").references(() => productModifiers.id, {
      onDelete: "set null",
    }),
    kind: productModifierKindEnum("kind").notNull(),
    nameSnapshot: text("name_snapshot").notNull(),
    unitPriceAmount: integer("unit_price_amount").notNull().default(0),
    createdAt: createdAtColumn(),
  },
  (table) => [
    index("order_item_modifiers_order_item_idx").on(table.orderItemId),
    check(
      "order_item_modifiers_price_chk",
      sql`${table.unitPriceAmount} >= 0`,
    ),
  ],
);
