import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import {
  createdAtColumn,
  idColumn,
  updatedAtColumn,
} from "@/db/schema/columns";

/**
 * Storefront promotional image popups.
 * At most one row may be active (partial unique index).
 */
export const storePopups = pgTable(
  "store_popups",
  {
    id: idColumn(),
    title: text("title").notNull(),
    linkUrl: text("link_url"),
    isActive: boolean("is_active").notNull().default(false),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    index("store_popups_active_idx").on(table.isActive),
    uniqueIndex("store_popups_one_active_uidx")
      .on(table.isActive)
      .where(sql`${table.isActive} = true`),
  ],
);
