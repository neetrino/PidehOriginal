"use server";

import { and, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { groupOrderParticipants } from "@/db/schema";
import {
  toAdminOrderDetailView,
  type AdminOrderDetailView,
} from "@/features/orders/application/order-detail-view";
import { getAdminOrderByNumber } from "@/features/orders/application/queries";
import { resolveCustomerFacingOrderAmount } from "@/features/orders/domain/customer-order-amount";
import { getStoreIdentity } from "@/features/settings/application/queries";
import { requireUser } from "@/lib/auth/policies";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { err, ok, type Result } from "@/lib/result";

/**
 * Customer-owned fetch of a single order for the profile order details drawer.
 * Returns NOT_FOUND when the order is missing or belongs to another user.
 * Group-order amounts are scoped to this customer's participant share.
 */
export async function getCustomerOrderDetailAction(
  locale: string,
  orderNumber: string,
): Promise<Result<AdminOrderDetailView>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const trimmed = orderNumber.trim();
  if (!trimmed || trimmed.length > 64) {
    return err("VALIDATION_ERROR", "Invalid order number.");
  }

  const user = await requireUser(locale as Locale);
  const loaded = await getAdminOrderByNumber(trimmed);

  if (!loaded || loaded.order.userId !== user.id) {
    return err("NOT_FOUND", "Order not found.");
  }

  const identity = await getStoreIdentity();
  const view = toAdminOrderDetailView(loaded, identity.name);

  if (!loaded.order.groupOrderId) {
    return ok(view);
  }

  const [participant] = await getDb()
    .select({
      id: groupOrderParticipants.id,
      subtotalAmount: groupOrderParticipants.subtotalAmount,
      deliveryShareAmount: groupOrderParticipants.deliveryShareAmount,
      finalAmount: groupOrderParticipants.finalAmount,
    })
    .from(groupOrderParticipants)
    .where(
      and(
        eq(groupOrderParticipants.groupOrderId, loaded.order.groupOrderId),
        eq(groupOrderParticipants.userId, user.id),
        eq(groupOrderParticipants.status, "ACTIVE"),
      ),
    )
    .limit(1);

  if (!participant) {
    return ok(view);
  }

  const ownTotal = resolveCustomerFacingOrderAmount({
    orderTotalAmount: loaded.order.totalAmount,
    groupOrderId: loaded.order.groupOrderId,
    participantFinalAmount: participant.finalAmount,
  });

  const ownItems = loaded.items.some(
    (item) => item.groupOrderParticipantId != null,
  )
    ? view.items.filter((_, index) => {
        const item = loaded.items[index];
        return item?.groupOrderParticipantId === participant.id;
      })
    : view.items;

  return ok({
    ...view,
    subtotalAmount: participant.subtotalAmount,
    deliveryAmount: participant.deliveryShareAmount,
    discountAmount: 0,
    totalAmount: ownTotal,
    paymentAmount: ownTotal,
    items: ownItems,
  });
}
