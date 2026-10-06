import { formatOrderDrawerMoney } from '@/features/orders/ui/order-drawer-format';
import type { AdminOrderDetailItemView, AdminOrderDetailView } from '@/features/orders/application/order-detail-view';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type OrderDetailsDrawerItemsProps = {
  detail: AdminOrderDetailView;
  copy: Dictionary['admin'];
};

export function OrderDetailsDrawerItems({ detail, copy }: OrderDetailsDrawerItemsProps) {
  const d = copy.orders.drawer;

  return (
    <section>
      <h3 className="mb-3 text-base font-semibold text-[#1e1e1e]">{d.items}</h3>
      <ul className="flex flex-wrap gap-3">
        {detail.items.map((item) => (
          <OrderItemCard key={item.id} item={item} quantityLabel={d.qty} />
        ))}
      </ul>
    </section>
  );
}

function OrderItemCard({
  item,
  quantityLabel,
}: {
  item: AdminOrderDetailItemView;
  quantityLabel: string;
}) {
  const extras = item.modifiers.map((modifier) => modifier.name).join(', ');

  return (
    <li className="flex min-w-[15rem] flex-1 items-center gap-3 rounded-[22px] border border-[#1e1e1e]/10 bg-white px-3 py-3 shadow-[0_8px_18px_rgba(30,30,30,0.06)]">
      <ItemThumb title={item.title} imageUrl={item.imageUrl} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#1e1e1e]">{item.title}</p>
        {extras ? <p className="mt-0.5 truncate text-xs text-[#1e1e1e]/55">{extras}</p> : null}
        {item.customerNote ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-[#1e1e1e]/55">{item.customerNote}</p>
        ) : null}
        <p className="mt-1 text-sm font-extrabold text-[#1e1e1e]">
          {formatOrderDrawerMoney(item.unitPriceAmount, item.currency)}
        </p>
      </div>
      <span
        className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full border border-[#1e1e1e]/15 bg-white px-2 text-sm font-bold text-[#1e1e1e]"
        aria-label={`${quantityLabel} ${item.quantity}`}
      >
        {item.quantity}
      </span>
    </li>
  );
}

function ItemThumb({ title, imageUrl }: { title: string; imageUrl: string | null }) {
  if (!imageUrl) {
    return <span className="size-14 shrink-0 rounded-xl bg-[#fff8e7]" aria-hidden />;
  }

  return (
    // Order images can come from R2 hosts that are not in the next/image allowlist.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl} alt={title} className="size-14 shrink-0 rounded-xl bg-[#fff8e7] object-cover" />
  );
}
