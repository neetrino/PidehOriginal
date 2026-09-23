export const ADMIN_ORDER_LIST_KINDS = ['all', 'individual', 'group'] as const;

export type AdminOrderListKind = (typeof ADMIN_ORDER_LIST_KINDS)[number];

export function parseAdminOrderListKind(value: string | undefined): AdminOrderListKind {
  if (value === 'individual' || value === 'group') {
    return value;
  }
  return 'all';
}
