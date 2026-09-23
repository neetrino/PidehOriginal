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
              </p>
              <p className="text-xs text-gray-600">
                {d.paymentMethod.replace('{method}', participant.paymentMethod)}
              </p>
            </div>

            <dl className="mt-3 grid grid-cols-4 gap-2 text-sm">
              <ParticipantMetric
                label={d.subtotal}
                value={formatOrderDrawerMoney(participant.subtotalAmount, detail.baseCurrency)}
              />
              <ParticipantMetric
                label={d.delivery}
                value={formatOrderDrawerMoney(participant.deliveryShareAmount, detail.baseCurrency)}
              />
              <ParticipantMetric
                label={d.grandTotal}
                value={formatOrderDrawerMoney(participant.finalAmount, detail.baseCurrency)}
              />
              <ParticipantMetric
                label={d.bonusColumn}
                value={`+${formatOrderDrawerMoney(participant.bonusEarnedAmount, detail.baseCurrency)}`}
                valueClassName="text-emerald-700"
              />
            </dl>

            {participant.items.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">{d.emptyParticipantItems}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {participant.items.map((item) => (
                  <li key={item.id} className="flex gap-3 py-1">
                    <ParticipantItemThumb title={item.title} imageUrl={item.imageUrl} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {formatOrderDrawerMoney(item.lineTotalAmount, item.currency)}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {formatOrderDrawerMoney(item.unitPriceAmount, item.currency)} ×{' '}
                        {item.quantity}
                      </p>
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
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ParticipantMetric({
  label,
  value,
  valueClassName = 'text-gray-900',
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className={`mt-0.5 font-medium ${valueClassName}`}>{value}</dd>
    </div>
  );
}

function ParticipantItemThumb({ title, imageUrl }: { title: string; imageUrl: string | null }) {
  if (!imageUrl) {
    return <span className="h-20 w-20 shrink-0 rounded-2xl bg-gray-200" aria-hidden />;
  }

  return (
    // Admin/R2 hosts vary — native img avoids brittle next/image allowlists.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl} alt={title} className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
  );
}
