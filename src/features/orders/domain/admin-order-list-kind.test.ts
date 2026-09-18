import { describe, expect, it } from 'vitest';

import { parseAdminOrderListKind } from '@/features/orders/domain/admin-order-list-kind';

describe('parseAdminOrderListKind', () => {
  it('accepts individual and group', () => {
    expect(parseAdminOrderListKind('individual')).toBe('individual');
    expect(parseAdminOrderListKind('group')).toBe('group');
  });

  it('falls back to all for missing or unknown values', () => {
    expect(parseAdminOrderListKind(undefined)).toBe('all');
    expect(parseAdminOrderListKind('all')).toBe('all');
    expect(parseAdminOrderListKind('other')).toBe('all');
  });
});
