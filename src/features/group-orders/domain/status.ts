/** Canonical group-order lifecycle statuses. */
export const GROUP_ORDER_STATUSES = [
  "OPEN",
  "LOCKED",
  "AWAITING_PAYMENTS",
  "CHECKOUT",
  "PAID",
  "PREPARING",
  "COMPLETED",
  "EXPIRED",
  "CANCELLED",
] as const;

export type GroupOrderStatus = (typeof GROUP_ORDER_STATUSES)[number];

export const GROUP_ORDER_PAYMENT_MODES = [
  "ORGANIZER_PAYS_ALL",
  "SPLIT_PER_PARTICIPANT",
] as const;

export type GroupOrderPaymentMode = (typeof GROUP_ORDER_PAYMENT_MODES)[number];

/**
 * Allowed transitions. Terminal: EXPIRED, CANCELLED, COMPLETED.
 * Organizer-pays flow may skip AWAITING_PAYMENTS (OPEN → LOCKED → CHECKOUT).
 */
const TRANSITIONS: Record<GroupOrderStatus, readonly GroupOrderStatus[]> = {
  OPEN: ["LOCKED", "EXPIRED", "CANCELLED"],
  LOCKED: ["AWAITING_PAYMENTS", "CHECKOUT", "OPEN", "CANCELLED", "EXPIRED"],
  AWAITING_PAYMENTS: ["CHECKOUT", "CANCELLED", "EXPIRED"],
  CHECKOUT: ["PAID", "CANCELLED", "EXPIRED"],
  PAID: ["PREPARING", "CANCELLED"],
  PREPARING: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  EXPIRED: [],
  CANCELLED: [],
};

const ITEM_EDITABLE: ReadonlySet<GroupOrderStatus> = new Set(["OPEN"]);

const JOINABLE: ReadonlySet<GroupOrderStatus> = new Set(["OPEN"]);

export function isGroupOrderStatus(value: string): value is GroupOrderStatus {
  return (GROUP_ORDER_STATUSES as readonly string[]).includes(value);
}

export function canTransitionGroupOrderStatus(
  from: GroupOrderStatus,
  to: GroupOrderStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function canEditGroupOrderItems(status: GroupOrderStatus): boolean {
  return ITEM_EDITABLE.has(status);
}

export function canJoinGroupOrder(status: GroupOrderStatus): boolean {
  return JOINABLE.has(status);
}

/** Whether payment mode can still be changed (no successful payment yet). */
export function canChangePaymentMode(hasSuccessfulPayment: boolean): boolean {
  return !hasSuccessfulPayment;
}

/**
 * After locking: organizer-pays goes to CHECKOUT; split goes to AWAITING_PAYMENTS.
 */
export function nextStatusAfterLock(
  paymentMode: GroupOrderPaymentMode,
): GroupOrderStatus {
  return paymentMode === "ORGANIZER_PAYS_ALL"
    ? "CHECKOUT"
    : "AWAITING_PAYMENTS";
}

/** Default TTL for a new group-order session (48 hours). */
export const GROUP_ORDER_DEFAULT_TTL_MS = 48 * 60 * 60 * 1000;
