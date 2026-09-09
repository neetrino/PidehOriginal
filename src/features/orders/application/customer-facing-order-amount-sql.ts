import { sql } from 'drizzle-orm';

/**
 * SQL expression: participant final share for group orders, else order total.
 * Used on customer profile surfaces so other members' amounts are not shown.
 *
 * Table/column names are written explicitly so the correlated subquery keeps
 * `orders.*` vs `group_order_participants.*` qualification (Drizzle column
 * refs alone collapse to bare names and break the correlation).
 *
 * @param viewerUserId - Signed-in customer whose share should be resolved
 *   (not `orders.user_id`, which is the checkout payer / organizer).
 */
export function customerFacingOrderAmountSql(viewerUserId: string) {
  return sql<number>`
    coalesce(
      (
        select gop."final_amount"
        from "group_order_participants" as gop
        where gop."group_order_id" = "orders"."group_order_id"
          and gop."user_id" = ${viewerUserId}::uuid
          and gop."status" = 'ACTIVE'
        limit 1
      ),
      "orders"."total_amount"
    )
  `.mapWith(Number);
}

/**
 * SQL expression: viewer's personal EARN for the order (group-aware), else
 * the order-level bonus earned snapshot for non-group orders.
 * Group orders do not fall back to the kitchen grand-total earn snapshot.
 */
export function customerFacingBonusEarnedSql(viewerUserId: string) {
  return sql<number>`
    coalesce(
      (
        select abs(bt."delta")
        from "bonus_transactions" as bt
        where bt."order_id" = "orders"."id"
          and bt."user_id" = ${viewerUserId}::uuid
          and bt."type" = 'EARN'
        limit 1
      ),
      case
        when "orders"."group_order_id" is not null then 0
        else "orders"."bonus_earned_amount"
      end
    )
  `.mapWith(Number);
}
