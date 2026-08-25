import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "CUSTOMER"]);

export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "SUSPENDED",
  "ANONYMIZED",
]);

export const productStatusEnum = pgEnum("product_status", [
  "DRAFT",
  "ACTIVE",
  "ARCHIVED",
]);

export const categoryStatusEnum = pgEnum("category_status", [
  "ACTIVE",
  "ARCHIVED",
]);

export const mediaUploadStatusEnum = pgEnum("media_upload_status", [
  "PENDING",
  "READY",
  "FAILED",
]);

export const mediaRoleEnum = pgEnum("media_role", [
  "GALLERY",
  "PRIMARY",
  "COVER",
  "HERO_DESKTOP",
  "HERO_MOBILE",
  "BRANDING",
  "POPUP",
]);

export const stockMovementReasonEnum = pgEnum("stock_movement_reason", [
  "ORDER",
  "CANCEL",
  "RETURN",
  "ADMIN_ADJUSTMENT",
  "IMPORT",
]);

export const bonusTransactionTypeEnum = pgEnum("bonus_transaction_type", [
  "EARN",
  "REDEEM",
  "REVERSAL_EARN",
  "REVERSAL_REDEEM",
  "EXPIRE",
]);

export const giftCardStatusEnum = pgEnum("gift_card_status", [
  "PENDING_PAYMENT",
  "ACTIVE",
  "USED",
  "EXPIRED",
  "DISABLED",
]);

export const giftCardTransactionTypeEnum = pgEnum("gift_card_transaction_type", [
  "ISSUE",
  "REDEEM",
  "REVERSAL",
  "ADJUST",
]);

export const blogPostStatusEnum = pgEnum("blog_post_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const cartStatusEnum = pgEnum("cart_status", [
  "ACTIVE",
  "MERGED",
  "CONVERTED",
  "ABANDONED",
]);

export const promotionKindEnum = pgEnum("promotion_kind", [
  "COUPON",
  "AUTOMATIC",
]);

export const discountTypeEnum = pgEnum("discount_type", [
  "PERCENTAGE",
  "FIXED",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "AUTHORIZED",
  "CAPTURED",
  "FAILED",
  "REFUNDED",
  "CANCELLED",
]);

export const orderEventTypeEnum = pgEnum("order_event_type", [
  "STATUS_CHANGE",
  "NOTE",
  "PAYMENT_PROVIDER",
]);

export const reviewModerationStatusEnum = pgEnum("review_moderation_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const contactMessageStatusEnum = pgEnum("contact_message_status", [
  "UNREAD",
  "READ",
  "REPLIED",
  "ARCHIVED",
]);

export const outboxStatusEnum = pgEnum("outbox_status", [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

export const productModifierKindEnum = pgEnum("product_modifier_kind", [
  "ADDITION",
  "EXCEPTION",
]);

export const groupOrderStatusEnum = pgEnum("group_order_status", [
  "OPEN",
  "LOCKED",
  "AWAITING_PAYMENTS",
  "CHECKOUT",
  "PAID",
  "PREPARING",
  "COMPLETED",
  "EXPIRED",
  "CANCELLED",
]);

export const groupOrderPaymentModeEnum = pgEnum("group_order_payment_mode", [
  "ORGANIZER_PAYS_ALL",
  "SPLIT_PER_PARTICIPANT",
]);

export const groupOrderParticipantRoleEnum = pgEnum(
  "group_order_participant_role",
  ["ORGANIZER", "PARTICIPANT"],
);

export const groupOrderParticipantStatusEnum = pgEnum(
  "group_order_participant_status",
  ["ACTIVE", "REMOVED", "LEFT"],
);

export const groupOrderParticipantPaymentStatusEnum = pgEnum(
  "group_order_participant_payment_status",
  [
    "NOT_REQUIRED",
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED",
    "MARKED_RECEIVED",
  ],
);

export const groupOrderEventTypeEnum = pgEnum("group_order_event_type", [
  "STATUS_CHANGE",
  "PARTICIPANT_JOINED",
  "PARTICIPANT_REMOVED",
  "PARTICIPANT_LEFT",
  "ITEMS_CHANGED",
  "ITEMS_READY",
  "SPEND_LIMIT_CHANGED",
  "JOINS_CLOSED",
  "PAYMENT_STATUS",
  "NOTE",
  "ADMIN_ACTION",
]);
