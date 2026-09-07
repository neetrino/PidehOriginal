"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SideSheet } from "@/components/ui/SideSheet";
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
} from "@/features/admin/ui/admin-table-classes";
import {
  ADMIN_BADGE,
  groupOrderStatusBadgeClass,
} from "@/features/admin/ui/status-badge";
import {
  adminCancelGroupOrderAction,
  adminCloseJoinsAction,
  adminMarkParticipantPaidAction,
  getAdminGroupOrderDetailAction,
} from "@/features/group-orders/actions";
import type {
  AdminGroupOrderListItem,
  GroupOrderDetailView,
} from "@/features/group-orders/application/queries";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { formatMoneyAmount } from "@/lib/money/format";
import type { Currency } from "@/lib/money/currency";

type AdminGroupOrdersViewProps = {
  locale: Locale;
  currency: Currency;
  rows: AdminGroupOrderListItem[];
  copy: Dictionary["admin"]["groupOrders"];
};

function shortId(id: string): string {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export function AdminGroupOrdersView({
  locale,
  currency,
  rows,
  copy,
}: AdminGroupOrdersViewProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [detail, setDetail] = useState<GroupOrderDetailView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allIds = rows.map((row) => row.id);
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selected.has(id));

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

  function openDetail(id: string): void {
    setError(null);
    startTransition(async () => {
      const view = await getAdminGroupOrderDetailAction(id, locale, currency);
      setDetail(view);
    });
  }

  function run(
    action: () => Promise<{ ok: boolean; error?: string }>,
  ): void {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Action failed.");
        return;
      }
      if (detail) {
        const refreshed = await getAdminGroupOrderDetailAction(
          detail.id,
          locale,
          currency,
        );
        setDetail(refreshed);
      }
      router.refresh();
    });
  }

  const t = copy.table;
  const d = copy.drawer;

  return (
    <>
      <Card className={`mt-4 ${ADMIN_TABLE_CARD} ${pending ? "opacity-70" : ""}`}>
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
                    onClick={() => openDetail(row.id)}
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
                        aria-label={t.selectOneAria.replace("{id}", idLabel)}
                      />
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      <span className="font-mono text-xs text-gray-900">
                        {idLabel}
                      </span>
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
                      <span
                        className={`${ADMIN_BADGE} ${groupOrderStatusBadgeClass(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className={ADMIN_TABLE_TD_CENTER}>
                      {row.participantCount}
                    </td>
                    <td className={`${ADMIN_TABLE_TD} text-xs`}>
                      {row.paymentMode}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? (
          <p className={`${ADMIN_TABLE_STATE_INSET} text-sm text-gray-600`}>
            {t.empty}
          </p>
        ) : null}
      </Card>

      <SideSheet
        open={detail != null}
        onClose={() => setDetail(null)}
        ariaLabel={d.ariaLabel}
        panelClassName="w-full sm:w-[60%]"
      >
        {detail ? (
          <div className="flex h-full flex-col">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-xl font-bold text-gray-900">{d.title}</h2>
              <p className="mt-1 font-mono text-xs text-gray-500">{detail.id}</p>
              <p className="mt-1 text-sm text-gray-600">
                {detail.status} · {detail.paymentMode}
              </p>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5 text-sm">
              <div>
                <p className="font-medium text-gray-900">
                  {d.organizer} {detail.organizerDisplayName}
                </p>
                <p className="mt-1 break-all text-xs text-gray-500">
                  {d.invite} {detail.invitePath}
                </p>
                <p className="mt-1 text-gray-600">
                  {d.deliveryTotal
                    .replace("{delivery}", detail.deliveryFormatted)
                    .replace("{total}", detail.grandTotalFormatted)}
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  {d.participants}
                </h3>
                <ul className="space-y-3">
                  {detail.participants.map((p) => (
                    <li
                      key={p.id}
                      className="rounded-xl border border-gray-200 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{p.displayName}</p>
                          <p className="text-xs text-gray-500">
                            {d.subtotalDeliveryFinal
                              .replace("{subtotal}", p.subtotalFormatted)
                              .replace("{delivery}", p.deliveryShareFormatted)
                              .replace("{final}", p.finalAmountFormatted)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {d.payment.replace("{status}", p.paymentStatus)}
                          </p>
                          <ul className="mt-2 space-y-1 text-xs text-gray-600">
                            {p.items.map((item) => (
                              <li key={item.id}>
                                {item.title} × {item.quantity} —{" "}
                                {item.lineTotalFormatted}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {p.paymentStatus !== "PAID" &&
                        p.paymentStatus !== "MARKED_RECEIVED" &&
                        p.finalAmount > 0 ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              run(async () =>
                                adminMarkParticipantPaidAction(
                                  {
                                    groupOrderId: detail.id,
                                    participantId: p.id,
                                  },
                                  locale,
                                ),
                              )
                            }
                          >
                            {d.markPaid}
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gray-900">{d.activity}</h3>
                <ul className="space-y-1 text-xs text-gray-500">
                  {detail.events.map((event) => (
                    <li key={event.id}>
                      {new Date(event.createdAt).toLocaleString()} —{" "}
                      {event.eventType}
                      {event.fromState || event.toState
                        ? ` (${event.fromState ?? "—"} → ${event.toState ?? "—"})`
                        : ""}
                    </li>
                  ))}
                </ul>
              </div>

              {error ? (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-gray-100 px-6 py-4">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() =>
                  run(async () =>
                    adminCloseJoinsAction({ groupOrderId: detail.id }, locale),
                  )
                }
              >
                {d.closeJoins}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                onClick={() =>
                  run(async () =>
                    adminCancelGroupOrderAction(
                      { groupOrderId: detail.id },
                      locale,
                    ),
                  )
                }
              >
                {d.cancel}
              </Button>
            </div>
          </div>
        ) : null}
      </SideSheet>
    </>
  );
}
