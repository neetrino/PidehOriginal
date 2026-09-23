'use client';

import { Button } from '@/components/ui/Button';
import { SideSheet } from '@/components/ui/SideSheet';
import type { GroupOrderDetailView } from '@/features/group-orders/application/queries';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type AdminGroupOrderSessionSheetProps = {
  detail: GroupOrderDetailView | null;
  error: string | null;
  copy: Dictionary['admin']['groupOrders']['drawer'];
  onClose: () => void;
  onMarkPaid: (participantId: string) => void;
  onCloseJoins: () => void;
  onCancel: () => void;
};

export function AdminGroupOrderSessionSheet({
  detail,
  error,
  copy,
  onClose,
  onMarkPaid,
  onCloseJoins,
  onCancel,
}: AdminGroupOrderSessionSheetProps) {
  return (
    <SideSheet open={detail != null} onClose={onClose} ariaLabel={copy.ariaLabel} variant="admin">
      {detail ? (
        <div className="flex h-full flex-col">
          <div className="shrink-0 border-b-2 border-[#1e1e1e]/10 px-5 py-4 sm:px-6">
            <h2 className="font-display text-2xl leading-[0.95] text-[#1e1e1e] uppercase sm:text-3xl">
              {copy.title}
            </h2>
            <p className="mt-1 font-mono text-xs text-[#1e1e1e]/50">{detail.id}</p>
            <p className="mt-1 text-sm text-[#1e1e1e]/65">
              {detail.status} · {detail.paymentMode}
            </p>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5 text-sm">
            <div>
              <p className="font-medium text-gray-900">
                {copy.organizer} {detail.organizerDisplayName}
              </p>
              <p className="mt-1 break-all text-xs text-gray-500">
                {copy.invite} {detail.invitePath}
              </p>
              <p className="mt-1 text-gray-600">
                {copy.deliveryTotal
                  .replace('{delivery}', detail.deliveryFormatted)
                  .replace('{total}', detail.grandTotalFormatted)}
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-gray-900">{copy.participants}</h3>
              <ul className="space-y-3">
                {detail.participants.map((participant) => (
                  <li key={participant.id} className="rounded-xl border border-gray-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{participant.displayName}</p>
                        <p className="text-xs text-gray-500">
                          {copy.subtotalDeliveryFinal
                            .replace('{subtotal}', participant.subtotalFormatted)
                            .replace('{delivery}', participant.deliveryShareFormatted)
                            .replace('{final}', participant.finalAmountFormatted)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {copy.payment.replace('{status}', participant.paymentStatus)}
                        </p>
                        <ul className="mt-2 space-y-1 text-xs text-gray-600">
                          {participant.items.map((item) => (
                            <li key={item.id}>
                              {item.title} × {item.quantity} — {item.lineTotalFormatted}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {participant.paymentStatus !== 'PAID' &&
                      participant.paymentStatus !== 'MARKED_RECEIVED' &&
                      participant.finalAmount > 0 ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => onMarkPaid(participant.id)}
                        >
                          {copy.markPaid}
                        </Button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-gray-900">{copy.activity}</h3>
              <ul className="space-y-1 text-xs text-gray-500">
                {detail.events.map((event) => (
                  <li key={event.id}>
                    {new Date(event.createdAt).toLocaleString()} — {event.eventType}
                    {event.fromState || event.toState
                      ? ` (${event.fromState ?? '—'} → ${event.toState ?? '—'})`
                      : ''}
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
            <Button type="button" size="sm" variant="secondary" onClick={onCloseJoins}>
              {copy.closeJoins}
            </Button>
            <Button type="button" size="sm" variant="danger" onClick={onCancel}>
              {copy.cancel}
            </Button>
          </div>
        </div>
      ) : null}
    </SideSheet>
  );
}
