import { describe, expect, it } from 'vitest';

import {
  resolveCouponAdminStatus,
  type CouponAdminStatusInput,
} from '@/features/promotions/domain/resolve-coupon-admin-status';

function coupon(overrides: Partial<CouponAdminStatusInput> = {}): CouponAdminStatusInput {
  return {
    isActive: true,
    startsAt: null,
    endsAt: null,
    totalUsageLimit: null,
    usedCount: 0,
    ...overrides,
  };
}

describe('resolveCouponAdminStatus', () => {
  const now = new Date('2026-07-20T12:00:00.000Z');

  it('returns INACTIVE when the coupon is toggled off', () => {
    expect(resolveCouponAdminStatus(coupon({ isActive: false }), now)).toBe('INACTIVE');
  });

  it('returns EXPIRED when the end date has passed', () => {
    expect(
      resolveCouponAdminStatus(coupon({ endsAt: '2026-07-01T00:00:00.000Z' }), now),
    ).toBe('EXPIRED');
  });

  it('returns USED_UP when the usage limit is reached', () => {
    expect(
      resolveCouponAdminStatus(coupon({ totalUsageLimit: 3, usedCount: 3 }), now),
    ).toBe('USED_UP');
  });

  it('returns SCHEDULED when the start date is in the future', () => {
    expect(
      resolveCouponAdminStatus(coupon({ startsAt: '2026-08-01T00:00:00.000Z' }), now),
    ).toBe('SCHEDULED');
  });

  it('returns ACTIVE when the coupon is usable now', () => {
    expect(resolveCouponAdminStatus(coupon(), now)).toBe('ACTIVE');
  });

  it('prefers EXPIRED over USED_UP for clearer expiry signal', () => {
    expect(
      resolveCouponAdminStatus(
        coupon({
          endsAt: '2026-07-01T00:00:00.000Z',
          totalUsageLimit: 1,
          usedCount: 1,
        }),
        now,
      ),
    ).toBe('EXPIRED');
  });
});
