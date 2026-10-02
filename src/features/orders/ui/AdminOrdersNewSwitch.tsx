import Link from 'next/link';

import type { AdminOrderListKind } from '@/features/orders/domain/admin-order-list-kind';

type AdminOrdersNewSwitchProps = {
  locale: string;
  onlyNew: boolean;
  kind: AdminOrderListKind;
  labels: {
    aria: string;
    new: string;
  };
};

function buildHref(locale: string, onlyNew: boolean, kind: AdminOrderListKind): string {
  const params = new URLSearchParams();
  if (kind === 'individual') params.set('kind', 'individual');
  if (kind === 'group') params.set('kind', 'group');
  if (onlyNew) params.set('new', '1');
  const query = params.toString();
  return query ? `/${locale}/admin/orders?${query}` : `/${locale}/admin/orders`;
}

/** Toggle that filters the orders list to admin-unseen ("new") orders. */
export function AdminOrdersNewSwitch({
  locale,
  onlyNew,
  kind,
  labels,
}: AdminOrdersNewSwitchProps) {
  if (kind === 'group') return null;

  return (
    <Link
      href={buildHref(locale, !onlyNew, kind)}
      aria-label={labels.aria}
      aria-pressed={onlyNew}
      className={`inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold transition ${
        onlyNew
          ? 'bg-red-600 text-white shadow-[0_1px_3px_rgba(16,24,40,0.12)]'
          : 'bg-[#e8edf2] text-[#5b6570] hover:text-[#1a5c3a]'
      }`}
    >
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
          onlyNew ? 'bg-white/30' : 'bg-white'
        }`}
        aria-hidden
      >
        <span
          className={`absolute h-4 w-4 rounded-full shadow transition ${
            onlyNew ? 'right-0.5 bg-white' : 'left-0.5 bg-[#8b95a1]'
          }`}
        />
      </span>
      <span>{labels.new}</span>
      <span
        className={`inline-flex h-2 w-2 rounded-full ${onlyNew ? 'bg-white' : 'bg-red-500'}`}
        aria-hidden
      />
    </Link>
  );
}
