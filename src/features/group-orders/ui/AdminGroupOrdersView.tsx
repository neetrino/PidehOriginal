'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Card } from '@/components/ui/Card';
import {
  ADMIN_TABLE,
  ADMIN_TABLE_CARD,
  ADMIN_TABLE_CHECKBOX,
  ADMIN_TABLE_OUTER_SCROLL,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_STATE_INSET,
  ADMIN_TABLE_TBODY,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TD_CENTER,
  ADMIN_TABLE_TD_CHECK,
  ADMIN_TABLE_TD_METRIC,
  ADMIN_TABLE_TH,
  ADMIN_TABLE_TH_CENTER,
  ADMIN_TABLE_TH_CHECK,
  ADMIN_TABLE_TH_METRIC,
  ADMIN_TABLE_THEAD,
} from '@/features/admin/ui/admin-table-classes';
import { ADMIN_BADGE, groupOrderStatusBadgeClass } from '@/features/admin/ui/status-badge';
import {
  adminCancelGroupOrderAction,
  adminCloseJoinsAction,
  adminMarkParticipantPaidAction,
  getAdminGroupOrderDetailAction,
} from '@/features/group-orders/actions';
import type {
  AdminGroupOrderListItem,
  GroupOrderDetailView,
} from '@/features/group-orders/application/queries';
import { AdminGroupOrderSessionSheet } from '@/features/group-orders/ui/AdminGroupOrderSessionSheet';
import {
  AdminOrderDetailsDrawerBind,
  useAdminOrderDetailsDrawer,
} from '@/features/orders/ui/useAdminOrderDetailsDrawer';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/config';
import { formatMoneyAmount } from '@/lib/money/format';
import type { Currency } from '@/lib/money/currency';

type AdminGroupOrdersViewProps = {
  locale: Locale;
  currency: Currency;
  rows: AdminGroupOrderListItem[];
  copy: Dictionary['admin']['groupOrders'];
  adminCopy: Dictionary['admin'];
};

function shortId(id: string): string {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

export function AdminGroupOrdersView({
  locale,
  currency,
  rows,
  copy,
  adminCopy,
}: AdminGroupOrdersViewProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [detail, setDetail] = useState<GroupOrderDetailView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const checkoutDrawer = useAdminOrderDetailsDrawer(locale);

  const allIds = rows.map((row) => row.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));

  function toggleOne(id: string): void {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll(): void {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  function openRow(row: AdminGroupOrderListItem): void {
    setError(null);
    if (row.orderNumber) {
      setDetail(null);
      checkoutDrawer.openOrder(row.orderNumber);
      return;
    }

    checkoutDrawer.closeDrawer();
    startTransition(async () => {
      const view = await getAdminGroupOrderDetailAction(row.id, locale, currency);
      setDetail(view);
    });
  }

  function run(action: () => Promise<{ ok: boolean; error?: string }>): void {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? 'Action failed.');
        return;
      }
      if (detail) {
        const refreshed = await getAdminGroupOrderDetailAction(detail.id, locale, currency);
        setDetail(refreshed);
      }
      router.refresh();
    });
  }

  const t = copy.table;

  return (
    <>
      <Card className={`mt-4 ${ADMIN_TABLE_CARD} ${pending ? 'opacity-70' : ''}`}>
        <div className={ADMIN_TABLE_OUTER_SCROLL}>
          <table className={ADMIN_TABLE}>
            <thead className={ADMIN_TABLE_THEAD}>
              <tr>
                <th className={ADMIN_TABLE_TH_CHECK}>
                  <input
                    type="checkbox"
                    className={ADMIN_TABLE_CHECKBOX}
                    checked={allSelected}
                    onChange={toggleAll}
                    disabled={pending || rows.length === 0}
                    aria-label={t.selectAllAria}
                  />
                </th>
                <th className={ADMIN_TABLE_TH}>{t.id}</th>
                <th className={ADMIN_TABLE_TH}>{t.organizer}</th>
                <th className={ADMIN_TABLE_TH_METRIC}>{t.total}</th>
                <th className={ADMIN_TABLE_TH_METRIC}>{t.delivery}</th>
                <th className={ADMIN_TABLE_TH}>{t.created}</th>
                <th className={ADMIN_TABLE_TH_CENTER}>{t.status}</th>
                <th className={ADMIN_TABLE_TH_CENTER}>{t.participants}</th>
                <th className={ADMIN_TABLE_TH}>{t.mode}</th>
              </tr>
            </thead>
            <tbody className={ADMIN_TABLE_TBODY}>
              {rows.map((row) => {
                const idLabel = shortId(row.id);
                return (
                  <tr
                    key={row.id}
                    className={`${ADMIN_TABLE_ROW} cursor-pointer`}
                    onClick={() => openRow(row)}
                  >
                    <td
                      className={ADMIN_TABLE_TD_CHECK}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className={ADMIN_TABLE_CHECKBOX}
                        checked={selected.has(row.id)}
                        onChange={() => toggleOne(row.id)}
                        disabled={pending}
                        aria-label={t.selectOneAria.replace('{id}', idLabel)}
                      />
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      <span className="font-mono text-xs text-gray-900">{idLabel}</span>
                    </td>
                    <td className={ADMIN_TABLE_TD}>{row.organizerDisplayName}</td>
                    <td className={ADMIN_TABLE_TD_METRIC}>
                      <span className="font-semibold text-gray-900">
                        {formatMoneyAmount(row.totalAmount, currency, locale)}
                      </span>
                    </td>
                    <td className={ADMIN_TABLE_TD_METRIC}>
                      {formatMoneyAmount(row.deliveryAmount, currency, locale)}
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      <p className="text-sm text-gray-900">{row.createdTime}</p>
                      <p className="text-xs text-gray-500">{row.createdDate}</p>
                    </td>
                    <td className={ADMIN_TABLE_TD_CENTER}>
                      <span className={`${ADMIN_BADGE} ${groupOrderStatusBadgeClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className={ADMIN_TABLE_TD_CENTER}>{row.participantCount}</td>
                    <td className={`${ADMIN_TABLE_TD} text-xs`}>{row.paymentMode}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? (
          <p className={`${ADMIN_TABLE_STATE_INSET} text-sm text-gray-600`}>{t.empty}</p>
        ) : null}
      </Card>

      <AdminGroupOrderSessionSheet
        detail={detail}
        error={error}
        copy={copy.drawer}
        onClose={() => setDetail(null)}
        onMarkPaid={(participantId) =>
          run(async () =>
            adminMarkParticipantPaidAction(
              { groupOrderId: detail?.id ?? '', participantId },
              locale,
            ),
          )
        }
        onCloseJoins={() =>
          run(async () => adminCloseJoinsAction({ groupOrderId: detail?.id ?? '' }, locale))
        }
        onCancel={() =>
          run(async () => adminCancelGroupOrderAction({ groupOrderId: detail?.id ?? '' }, locale))
        }
      />
      <AdminOrderDetailsDrawerBind state={checkoutDrawer} copy={adminCopy} />
    </>
  );
}
