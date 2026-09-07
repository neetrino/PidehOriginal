import "server-only";

import { STORE_PICKUP_LABEL } from "@/features/checkout/domain/shipping-methods";
import {
  loadOrderGroupParticipants,
  type AdminOrderParticipantView,
} from "@/features/orders/application/order-group-participants";
import {
  loadPrimaryProductImageObjectKeys,
  resolveOrderItemImageUrl,
} from "@/features/orders/application/order-item-images";
import {
  getAdminOrderByNumber,
  type AdminOrderDetail,
} from "@/features/orders/application/queries";
import { getStoreIdentity } from "@/features/settings/application/queries";
import type { Locale } from "@/lib/i18n/config";
import { mediaPublicUrl } from "@/lib/media/public-url";

export type { AdminOrderParticipantView };

export type AdminOrderDetailItemView = {
  id: string;
  title: string;
  sku: string;
  imageUrl: string | null;
  quantity: number;
  unitPriceAmount: number;
  lineTotalAmount: number;
  currency: string;
  modifiers: Array<{
    id: string;
    kind: "ADDITION" | "EXCEPTION";
    name: string;
    unitPriceAmount: number;
  }>;
};

export type AdminOrderDetailView = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  baseCurrency: string;
  subtotalAmount: number;
  deliveryAmount: number;
  discountAmount: number;
  bonusRedeemedAmount: number;
  bonusEarnedAmount: number;
  giftCardAmount: number;
  totalAmount: number;
  deliveryLabel: string | null;
  couponCode: string | null;
  isPickup: boolean;
  storeName: string;
  shippingMethod: string;
  addressLine: string;
  addressHint: string | null;
  floor: string | null;
  intercomCode: string | null;
  scheduledDelivery: string | null;
  cashChangeAmount: number | null;
  cashChangeImageUrl: string | null;
  paymentMethod: string;
  paymentAmount: number;
  /** Present when this order was placed from a group session. */
  participants: AdminOrderParticipantView[] | null;
  items: AdminOrderDetailItemView[];
};

function formatAddressLine(
  address: AdminOrderDetail["order"]["shippingAddress"],
): string {
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.region,
    address.postalCode,
    address.countryCode,
  ].filter((part): part is string => Boolean(part && part.trim()));

  return parts.join(", ");
}

function paymentMethodLabel(method: string): string {
  const normalized = method.toUpperCase();
  if (normalized === "COD" || normalized === "CASH") {
    return "Cash";
  }
  if (normalized === "IDRAM") {
    return "Idram";
  }
  if (normalized === "ARCA") {
    return "ArCa";
  }
  return method;
}

/** Maps a loaded order into a serializable admin drawer view. */
export function toAdminOrderDetailView(
  detail: AdminOrderDetail,
  storeName: string,
  participants: AdminOrderParticipantView[] | null = null,
  liveObjectKeyByProductId: ReadonlyMap<string, string> = new Map(),
): AdminOrderDetailView {
  const { order, items, payments } = detail;
  const isPickup = order.deliveryLabelSnapshot === STORE_PICKUP_LABEL;
  const latestPayment = payments[0] ?? null;

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    contactName: order.contactName,
    contactEmail: order.contactEmail,
    contactPhone: order.contactPhone,
    baseCurrency: order.baseCurrency,
    subtotalAmount: order.subtotalAmount,
    deliveryAmount: order.deliveryAmount,
    discountAmount: order.discountAmount,
    bonusRedeemedAmount: order.bonusRedeemedAmount,
    bonusEarnedAmount: order.bonusEarnedAmount,
    giftCardAmount: order.giftCardAmount,
    totalAmount: order.totalAmount,
    deliveryLabel: order.deliveryLabelSnapshot,
    couponCode: order.promotionCodeSnapshot,
    isPickup,
    storeName,
    shippingMethod: isPickup
      ? "pickup"
      : (order.deliveryLabelSnapshot ?? "delivery"),
    addressLine: formatAddressLine(order.shippingAddress),
    addressHint: isPickup
      ? "You can pick up your order at this store"
      : null,
    floor: order.shippingAddress.floor?.trim() || null,
    intercomCode: order.shippingAddress.intercomCode?.trim() || null,
    scheduledDelivery:
      order.shippingAddress.scheduledDeliveryDate &&
      order.shippingAddress.scheduledDeliveryStart &&
      order.shippingAddress.scheduledDeliveryEnd
        ? `${order.shippingAddress.scheduledDeliveryDate} ${order.shippingAddress.scheduledDeliveryStart}–${order.shippingAddress.scheduledDeliveryEnd}`
        : order.deliveryEstimateSnapshot &&
            /\d{4}-\d{2}-\d{2}/.test(order.deliveryEstimateSnapshot)
          ? order.deliveryEstimateSnapshot
          : null,
    cashChangeAmount:
      typeof order.shippingAddress.cashChangeAmount === "number"
        ? order.shippingAddress.cashChangeAmount
        : null,
    cashChangeImageUrl: order.shippingAddress.cashChangeImageKey
      ? mediaPublicUrl(order.shippingAddress.cashChangeImageKey)
      : null,
    paymentMethod: latestPayment
      ? paymentMethodLabel(latestPayment.method)
      : "—",
    paymentAmount: latestPayment?.amount ?? order.totalAmount,
    participants,
    items: items.map((item) => ({
      id: item.id,
      title: item.productTitleSnapshot,
      sku: item.productSkuSnapshot,
      imageUrl: resolveOrderItemImageUrl({
        productImageKeySnapshot: item.productImageKeySnapshot,
        productId: item.productId,
        liveObjectKeyByProductId,
      }),
      quantity: item.quantity,
      unitPriceAmount: item.unitBaseAmount,
      lineTotalAmount: item.lineTotalAmount,
      currency: item.currency,
      modifiers: item.modifiers,
    })),
  };
}

/** Loads order detail shaped for the admin drawer. */
export async function getAdminOrderDetailView(
  orderNumber: string,
  locale: Locale,
): Promise<AdminOrderDetailView | null> {
  const detail = await getAdminOrderByNumber(orderNumber);
  if (!detail) {
    return null;
  }

  const productIdsNeedingLiveImage = detail.items
    .filter((item) => !item.productImageKeySnapshot && item.productId)
    .map((item) => item.productId as string);

  const [identity, liveObjectKeyByProductId] = await Promise.all([
    getStoreIdentity(),
    loadPrimaryProductImageObjectKeys(productIdsNeedingLiveImage),
  ]);

  const participants = detail.order.groupOrderId
    ? await loadOrderGroupParticipants({
        groupOrderId: detail.order.groupOrderId,
        orderId: detail.order.id,
        locale,
        currency: detail.order.baseCurrency,
        orderItems: detail.items,
        liveObjectKeyByProductId,
      })
    : null;

  return toAdminOrderDetailView(
    detail,
    identity.name,
    participants && participants.length > 0 ? participants : null,
    liveObjectKeyByProductId,
  );
}
