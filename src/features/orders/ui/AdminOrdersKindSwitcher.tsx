import Link from 'next/link';

import {
  ADMIN_ORDER_LIST_KINDS,
  type AdminOrderListKind,
} from '@/features/orders/domain/admin-order-list-kind';

type AdminOrdersKindSwitcherProps = {
  locale: string;
  kind: AdminOrderListKind;
  labels: {
    aria: string;
    all: string;
    individual: string;
    group: string;
  };
};

function kindHref(locale: string, kind: AdminOrderListKind): string {
  const base = `/${locale}/admin/orders`;
  return kind === 'all' ? base : `${base}?kind=${kind}`;
}

export function AdminOrdersKindSwitcher({ locale, kind, labels }: AdminOrdersKindSwitcherProps) {
  return (
    <nav
      aria-label={labels.aria}
      className="mb-6 inline-flex items-center rounded-full bg-[#e8edf2] p-1"
    >
      {ADMIN_ORDER_LIST_KINDS.map((value) => {
        const active = kind === value;
        return (
          <Link
            key={value}
            href={kindHref(locale, value)}
            aria-current={active ? 'page' : undefined}
            className={`rounded-full px-5 py-2 text-sm font-medium whitespace-nowrap transition ${
              active
                ? 'bg-white font-semibold text-[#1a5c3a] shadow-[0_1px_3px_rgba(16,24,40,0.08)]'
                : 'text-[#8b95a1] hover:text-[#5b6570]'
            }`}
          >
            {labels[value]}
          </Link>
        );
      })}
    </nav>
  );
}
