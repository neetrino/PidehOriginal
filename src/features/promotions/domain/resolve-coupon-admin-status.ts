export type CouponAdminStatus =
  | 'ACTIVE'
  | 'SCHEDULED'
  | 'EXPIRED'
  | 'USED_UP'
  | 'INACTIVE';

export type CouponAdminStatusInput = {
  isActive: boolean;
  startsAt: Date | string | null;
  endsAt: Date | string | null;
  totalUsageLimit: number | null;
  usedCount: number;
};

function asDate(value: Date | string | null): Date | null {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

/**
 * Resolves the effective admin-facing coupon status for list display.
 * Priority: inactive → expired → used up → scheduled → active.
 */
export function resolveCouponAdminStatus(
  coupon: CouponAdminStatusInput,
  now: Date = new Date(),
): CouponAdminStatus {
  if (!coupon.isActive) {
    return 'INACTIVE';
  }

  const endsAt = asDate(coupon.endsAt);
  if (endsAt && endsAt < now) {
    return 'EXPIRED';
  }

  if (coupon.totalUsageLimit !== null && coupon.usedCount >= coupon.totalUsageLimit) {
    return 'USED_UP';
  }

  const startsAt = asDate(coupon.startsAt);
  if (startsAt && startsAt > now) {
    return 'SCHEDULED';
  }

  return 'ACTIVE';
}
