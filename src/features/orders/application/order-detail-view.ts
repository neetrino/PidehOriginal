import 'server-only';

import { STORE_PICKUP_LABEL } from '@/features/checkout/domain/shipping-methods';
import { cashChangeImageSrc } from '@/features/delivery/domain/cash-change';
import {
  loadOrderGroupParticipants,
  type AdminOrderParticipantView,
} from '@/features/orders/application/order-group-participants';
import {
  loadPrimaryProductImageObjectKeys,
  resolveOrderItemImageUrl,
} from '@/features/orders/application/order-item-images';
import {
  getAdminOrderByNumber,
  type AdminOrderDetail,
} from '@/features/orders/application/queries';
import { formatScheduledDeliveryCaption } from '@/features/orders/domain/scheduled-delivery';
import { getStoreIdentity } from '@/features/settings/application/queries';
import type { Locale } from '@/lib/i18n/config';
import { mediaPublicUrl } from '@/lib/media/public-url';

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
    kind: 'ADDITION' | 'EXCEPTION';
    name: string;
    unitPriceAmount: number;
  }>;
  customerNote: string | null;
};

export type AdminOrderCustomerReview = {
  rating: number;
  comment: string | null;
  reviewedAt: string;
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
  customerNote: string | null;
  /** Submitted order review; null when the customer has not reviewed yet. */
  customerReview: AdminOrderCustomerReview | null;
  /**
   * True only for the order owner on a delivered, unreviewed order.
   * Always false for admin loaders; set by the customer detail action.
   */
  canSubmitReview: boolean;
  paymentMethod: string;
  paymentAmount: number;
  /** Present when this order was placed from a group session. */
  participants: AdminOrderParticipantView[] | null;
  items: AdminOrderDetailItemView[];
};

function formatAddressLine(address: AdminOrderDetail['order']['shippingAddress']): string {
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.region,
    address.postalCode,
    address.countryCode,
  ].filter((part): part is string => Boolean(part && part.trim()));

  return parts.join(', ');
}

function formatOrderCustomerNotes(
  items: ReadonlyArray<{ productTitleSnapshot: string; customerNote: string | null }>,
): string | null {
  const lines = items.flatMap((item) => {
    const note = item.customerNote?.trim();
    if (!note) return [];
    return [`${item.productTitleSnapshot}: ${note}`];
  });
  return lines.length > 0 ? lines.join('\n') : null;
}

function formatCombinedCustomerNote(
  orderNote: string | null | undefined,
  items: ReadonlyArray<{ productTitleSnapshot: string; customerNote: string | null }>,
): string | null {
  const parts = [orderNote?.trim(), formatOrderCustomerNotes(items)].filter(
    (part): part is string => Boolean(part),
  );
  return parts.length > 0 ? parts.join('\n') : null;
}

function paymentMethodLabel(method: string): string {
  const normalized = method.toUpperCase();
  if (normalized === 'COD' || normalized === 'CASH') {
    return 'Cash';
  }
  if (normalized === 'IDRAM') {
    return 'Idram';
  }
  if (normalized === 'ARCA') {
    return 'ArCa';
  }
  if (normalized === 'TERMINAL') {
    return 'Terminal';
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
  const reviewRating = order.customerReviewRating;
  const customerReview =
    reviewRating != null && order.customerReviewedAt
      ? {
          rating: reviewRating,
          comment: order.customerReviewComment?.trim() || null,
          reviewedAt: order.customerReviewedAt.toISOString(),
        }
      : null;

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
    shippingMethod: isPickup ? 'pickup' : (order.deliveryLabelSnapshot ?? 'delivery'),
    addressLine: formatAddressLine(order.shippingAddress),
    addressHint: isPickup ? 'You can pick up your order at this store' : null,
    floor: order.shippingAddress.floor?.trim() || null,
    intercomCode: order.shippingAddress.intercomCode?.trim() || null,
    scheduledDelivery:
      formatScheduledDeliveryCaption(
        order.shippingAddress.scheduledDeliveryDate,
        order.shippingAddress.scheduledDeliveryStart,
        order.shippingAddress.scheduledDeliveryEnd,
      ) ??
      (order.deliveryEstimateSnapshot && /\d{4}-\d{2}-\d{2}/.test(order.deliveryEstimateSnapshot)
        ? order.deliveryEstimateSnapshot
        : null),
    cashChangeAmount:
      typeof order.shippingAddress.cashChangeAmount === 'number'
        ? order.shippingAddress.cashChangeAmount
        : null,
    cashChangeImageUrl: cashChangeImageSrc(
      order.shippingAddress.cashChangeImageKey ?? null,
      mediaPublicUrl,
    ),
    customerNote: formatCombinedCustomerNote(order.shippingAddress.orderNote, items),
    customerReview,
    canSubmitReview: false,
    paymentMethod: latestPayment ? paymentMethodLabel(latestPayment.method) : '—',
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
      customerNote: item.customerNote?.trim() || null,
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
