import {
  ADMIN_TABLE,
  ADMIN_TABLE_OUTER_SCROLL,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_TBODY,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TH,
  ADMIN_TABLE_THEAD,
} from "@/features/admin/ui/admin-table-classes";
import type { AdminOrderDetailView } from "@/features/orders/application/order-detail-view";
import { formatOrderDrawerMoney } from "@/features/orders/ui/order-drawer-format";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type OrderDetailsDrawerItemsProps = {
  detail: AdminOrderDetailView;
  copy: Dictionary["admin"];
};

export function OrderDetailsDrawerItems({
  detail,
  copy,
}: OrderDetailsDrawerItemsProps) {
  const d = copy.orders.drawer;
  return (
    <div className="rounded-2xl border border-gray-200 px-5 py-4">
      <h3 className="mb-4 text-base font-semibold text-gray-900">{d.items}</h3>
      <div className={`${ADMIN_TABLE_OUTER_SCROLL} rounded-xl border border-gray-100`}>
        <table className={ADMIN_TABLE}>
          <thead className={ADMIN_TABLE_THEAD}>
            <tr>
              <th className={ADMIN_TABLE_TH}>{d.product}</th>
              <th className={ADMIN_TABLE_TH}>{d.sku}</th>
              <th className={ADMIN_TABLE_TH}>{d.qty}</th>
              <th className={ADMIN_TABLE_TH}>{d.price}</th>
              <th className={ADMIN_TABLE_TH}>{d.itemTotal}</th>
            </tr>
          </thead>
          <tbody className={ADMIN_TABLE_TBODY}>
            {detail.items.map((item) => (
              <tr key={item.id} className={ADMIN_TABLE_ROW}>
                <td className={ADMIN_TABLE_TD}>
                  <div className="flex items-center gap-3">
                    <ProductThumb
                      title={item.title}
                      imageUrl={item.imageUrl}
                    />
                    <div className="min-w-0">
                      <span className="font-medium text-gray-900">
                        {item.title}
                      </span>
                      {item.modifiers.length > 0 ? (
                        <ul className="mt-1 space-y-0.5 text-xs text-gray-600">
                          {item.modifiers.map((modifier) => (
                            <li key={modifier.id}>
                              {modifier.kind === "ADDITION" ? "+ " : "− "}
                              {modifier.name}
                              {modifier.kind === "ADDITION" &&
                              modifier.unitPriceAmount > 0
                                ? ` (+${formatOrderDrawerMoney(
                                    modifier.unitPriceAmount,
                                    item.currency,
                                  )})`
                                : ""}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className={ADMIN_TABLE_TD}>{item.sku}</td>
                <td className={ADMIN_TABLE_TD}>{item.quantity}</td>
                <td className={ADMIN_TABLE_TD}>
                  {formatOrderDrawerMoney(item.unitPriceAmount, item.currency)}
                </td>
                <td className={ADMIN_TABLE_TD}>
                  {formatOrderDrawerMoney(item.lineTotalAmount, item.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductThumb({
  title,
  imageUrl,
}: {
  title: string;
  imageUrl: string | null;
}) {
  if (!imageUrl) {
    return (
      <span
        className="h-10 w-10 shrink-0 rounded-md bg-gray-100"
        aria-hidden
      />
    );
  }

  return (
    // Admin/R2 hosts vary — native img avoids brittle next/image allowlists.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={title}
      className="h-10 w-10 shrink-0 rounded-md object-cover"
    />
  );
}
