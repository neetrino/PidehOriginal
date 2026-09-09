import { describe, expect, it } from 'vitest';

import { canViewerSeeCustomerOrder } from '@/features/orders/domain/customer-order-visibility';

describe('canViewerSeeCustomerOrder', () => {
  it('allows the order owner', () => {
    expect(
      canViewerSeeCustomerOrder({
        isOrderOwner: true,
        isActiveGroupParticipant: false,
      }),
    ).toBe(true);
  });

  it('allows an active group-order participant who is not the checkout payer', () => {
    expect(
      canViewerSeeCustomerOrder({
        isOrderOwner: false,
        isActiveGroupParticipant: true,
      }),
    ).toBe(true);
  });

  it('denies unrelated users', () => {
    expect(
      canViewerSeeCustomerOrder({
        isOrderOwner: false,
        isActiveGroupParticipant: false,
      }),
    ).toBe(false);
  });
});
