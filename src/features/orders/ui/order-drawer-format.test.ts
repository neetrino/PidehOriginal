import { describe, expect, it } from 'vitest';

import { formatScheduledDeliveryCaption } from '@/features/orders/domain/scheduled-delivery';
import { orderDrawerStatusLabel } from '@/features/orders/ui/order-drawer-format';

const labels = {
  pending: 'Սպասող',
  processing: 'Ընթացքի մեջ',
  completed: 'Կատարված',
  cancelled: 'Չեղարկված',
  paid: 'Վճարված',
  failed: 'Չհաջողված',
};

describe('orderDrawerStatusLabel', () => {
  it('maps pending fulfillment and payment to the short pending label', () => {
    expect(orderDrawerStatusLabel('PENDING', labels)).toBe('Սպասող');
    expect(orderDrawerStatusLabel('AUTHORIZED', labels)).toBe('Սպասող');
  });

  it('maps captured payment to paid', () => {
    expect(orderDrawerStatusLabel('CAPTURED', labels)).toBe('Վճարված');
  });
});

describe('formatScheduledDeliveryCaption', () => {
  it('formats slot and dotted date', () => {
    expect(formatScheduledDeliveryCaption('2026-09-20', '14:00', '15:00')).toBe(
      '14:00-15:00, 20.09.2026',
    );
  });

  it('returns null when a part is missing', () => {
    expect(formatScheduledDeliveryCaption('2026-09-20', '14:00', undefined)).toBeNull();
  });
});
