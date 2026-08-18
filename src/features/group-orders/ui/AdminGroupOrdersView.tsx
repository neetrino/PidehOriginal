"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { SideSheet } from "@/components/ui/SideSheet";
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
import type { Locale } from "@/lib/i18n/config";
import type { Currency } from "@/lib/money/currency";

type AdminGroupOrdersViewProps = {
  locale: Locale;
  currency: Currency;
  rows: AdminGroupOrderListItem[];
};

export function AdminGroupOrdersView({
  locale,
  currency,
  rows,
}: AdminGroupOrdersViewProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [detail, setDetail] = useState<GroupOrderDetailView | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <>
      <div className={`overflow-x-auto rounded-xl border border-gray-200 bg-white ${pending ? "opacity-70" : ""}`}>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Organizer</th>
              <th className="px-4 py-3">Mode</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Participants</th>
              <th className="px-4 py-3">Delivery</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No group orders yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b border-gray-50 hover:bg-gray-50"
                  onClick={() => openDetail(row.id)}
                >
                  <td className="px-4 py-3 font-mono text-xs">{row.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3">{row.organizerDisplayName}</td>
                  <td className="px-4 py-3 text-xs">{row.paymentMode}</td>
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3">{row.participantCount}</td>
                  <td className="px-4 py-3">{row.deliveryAmount} ֏</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <SideSheet
        open={detail != null}
        onClose={() => setDetail(null)}
        ariaLabel="Group order details"
        panelClassName="w-full sm:w-[60%]"
      >
        {detail ? (
          <div className="flex h-full flex-col">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-xl font-bold text-gray-900">Group order</h2>
              <p className="mt-1 font-mono text-xs text-gray-500">{detail.id}</p>
              <p className="mt-1 text-sm text-gray-600">
                {detail.status} · {detail.paymentMode}
              </p>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5 text-sm">
              <div>
                <p className="font-medium text-gray-900">
                  Organizer: {detail.organizerDisplayName}
                </p>
                <p className="mt-1 break-all text-xs text-gray-500">
                  Invite: {detail.invitePath}
                </p>
                <p className="mt-1 text-gray-600">
                  Delivery: {detail.deliveryFormatted} · Total:{" "}
                  {detail.grandTotalFormatted}
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gray-900">Participants</h3>
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
                            Subtotal {p.subtotalFormatted} · Delivery{" "}
                            {p.deliveryShareFormatted} · Final{" "}
                            {p.finalAmountFormatted}
                          </p>
                          <p className="text-xs text-gray-500">
                            Payment: {p.paymentStatus}
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
                            Mark paid
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gray-900">Activity</h3>
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
                Close joins
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
                Cancel group order
              </Button>
            </div>
          </div>
        ) : null}
      </SideSheet>
    </>
  );
}
