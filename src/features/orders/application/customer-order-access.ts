import "server-only";

import { and, eq, or, sql, type SQL } from "drizzle-orm";

import { getDb } from "@/db/client";
import { groupOrderParticipants, orders } from "@/db/schema";
import { canViewerSeeCustomerOrder } from "@/features/orders/domain/customer-order-visibility";

/**
 * Profile visibility: orders owned by the customer, or group orders where they
 * are an ACTIVE participant (checkout creates a single order under the payer).
 */
export function customerVisibleOrdersWhere(userId: string): SQL {
  return or(
    eq(orders.userId, userId),
    sql`exists (
      select 1
      from "group_order_participants" as gop
      where gop."group_order_id" = "orders"."group_order_id"
        and gop."user_id" = ${userId}::uuid
        and gop."status" = 'ACTIVE'
    )`,
  )!;
}

/**
 * Whether a signed-in customer may open an order in their profile drawer.
 */
export async function canCustomerAccessOrder(input: {
  userId: string;
  orderUserId: string | null;
  groupOrderId: string | null;
}): Promise<boolean> {
  const isOrderOwner = input.orderUserId === input.userId;
  if (isOrderOwner) {
    return true;
  }
  if (!input.groupOrderId) {
    return false;
  }

  const [row] = await getDb()
    .select({ id: groupOrderParticipants.id })
    .from(groupOrderParticipants)
    .where(
      and(
        eq(groupOrderParticipants.groupOrderId, input.groupOrderId),
        eq(groupOrderParticipants.userId, input.userId),
        eq(groupOrderParticipants.status, "ACTIVE"),
      ),
    )
    .limit(1);

  return canViewerSeeCustomerOrder({
    isOrderOwner: false,
    isActiveGroupParticipant: Boolean(row),
  });
}
