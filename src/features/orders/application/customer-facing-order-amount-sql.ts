import { sql } from "drizzle-orm";

/**
 * SQL expression: participant final share for group orders, else order total.
 * Used on customer profile surfaces so other members' amounts are not shown.
 *
 * Table/column names are written explicitly so the correlated subquery keeps
 * `orders.*` vs `group_order_participants.*` qualification (Drizzle column
 * refs alone collapse to bare names and break the correlation).
 */
export function customerFacingOrderAmountSql() {
  return sql<number>`
    coalesce(
      (
        select gop."final_amount"
        from "group_order_participants" as gop
        where gop."group_order_id" = "orders"."group_order_id"
          and gop."user_id" = "orders"."user_id"
          and gop."status" = 'ACTIVE'
        limit 1
      ),
      "orders"."total_amount"
    )
  `.mapWith(Number);
}
