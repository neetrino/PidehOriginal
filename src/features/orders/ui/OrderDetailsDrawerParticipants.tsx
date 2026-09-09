import type {
  AdminOrderDetailView,
  AdminOrderParticipantView,
} from '@/features/orders/application/order-detail-view';
import { formatOrderDrawerMoney } from '@/features/orders/ui/order-drawer-format';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type OrderDetailsDrawerParticipantsProps = {
  detail: AdminOrderDetailView;
  participants: AdminOrderParticipantView[];
  copy: Dictionary['admin'];
};

export function OrderDetailsDrawerParticipants({
  detail,
  participants,
  copy,
}: OrderDetailsDrawerParticipantsProps) {
  const d = copy.orders.drawer;

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold tracking-wide text-gray-900 uppercase">
        {d.participants}
      </h3>
      <ul className="space-y-3">
        {participants.map((participant) => (
          <li
            key={participant.id}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-bold tracking-wide text-emerald-800 uppercase">
                {participant.displayName}
                {participant.role === 'ORGANIZER' ? (
                  <span className="ml-2 text-xs font-semibold normal-case text-gray-500">
                    ({d.organizer})
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-gray-600">
                {d.paymentMethod.replace('{method}', participant.paymentMethod)}
              </p>
            </div>

            <dl className="mt-3 space-y-1 text-sm text-gray-600">
              <div className="flex justify-between gap-3">
                <dt>{d.subtotal}</dt>
                <dd className="font-medium text-gray-900">
                  {formatOrderDrawerMoney(participant.subtotalAmount, detail.baseCurrency)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>{d.delivery}</dt>
                <dd className="font-medium text-gray-900">
                  {formatOrderDrawerMoney(participant.deliveryShareAmount, detail.baseCurrency)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>{d.grandTotal}</dt>
                <dd className="font-semibold text-gray-900">
                  {formatOrderDrawerMoney(participant.finalAmount, detail.baseCurrency)}
                </dd>
              </div>
              {participant.bonusEarnedAmount > 0 ? (
                <div className="flex justify-between gap-3">
                  <dt>{d.bonusEarned}</dt>
                  <dd className="font-medium text-emerald-700">
                    +{formatOrderDrawerMoney(participant.bonusEarnedAmount, detail.baseCurrency)}
                  </dd>
                </div>
              ) : null}
            </dl>

            {participant.items.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {participant.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-2.5"
                  >
                    <ParticipantItemThumb title={item.title} imageUrl={item.imageUrl} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                          {item.modifiers.length > 0 ? (
                            <ul className="mt-0.5 space-y-0.5 text-xs text-gray-600">
                              {item.modifiers.map((modifier) => (
                                <li key={modifier.id}>
                                  {modifier.kind === 'ADDITION' ? '+ ' : '− '}
                                  {modifier.name}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-gray-900">
                          {formatOrderDrawerMoney(item.lineTotalAmount, item.currency)}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatOrderDrawerMoney(item.unitPriceAmount, item.currency)} ×{' '}
                        {item.quantity}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ParticipantItemThumb({ title, imageUrl }: { title: string; imageUrl: string | null }) {
  if (!imageUrl) {
    return <span className="h-14 w-14 shrink-0 rounded-lg bg-gray-200" aria-hidden />;
  }

  return (
    // Admin/R2 hosts vary — native img avoids brittle next/image allowlists.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl} alt={title} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
  );
}
