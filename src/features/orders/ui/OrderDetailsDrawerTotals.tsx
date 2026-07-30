import type { AdminOrderDetailView } from "@/features/orders/application/order-detail-view";
import { formatOrderDrawerMoney } from "@/features/orders/ui/order-drawer-format";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type OrderDetailsDrawerTotalsProps = {
  detail: AdminOrderDetailView;
  copy: Dictionary["admin"];
};

export function OrderDetailsDrawerTotals({
  detail,
  copy,
}: OrderDetailsDrawerTotalsProps) {
  const d = copy.orders.drawer;

  const shippingLabel = detail.isPickup
    ? d.freeStorePickup
    : formatOrderDrawerMoney(detail.deliveryAmount, detail.baseCurrency);

  const deliveryRowLabel =
    !detail.isPickup && detail.deliveryLabel
      ? d.deliveryWithLabel.replace("{label}", detail.deliveryLabel)
      : d.delivery;

  const couponRowLabel = detail.couponCode
    ? d.couponDiscountWithCode.replace("{code}", detail.couponCode)
    : d.couponDiscount;

  const discountLabel =
    detail.discountAmount > 0
      ? `−${formatOrderDrawerMoney(detail.discountAmount, detail.baseCurrency)}`
      : formatOrderDrawerMoney(0, detail.baseCurrency);

  return (
    <div className="rounded-2xl border border-gray-200 px-5 py-4">
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-600">{d.subtotal}</span>
          <span className="font-medium text-gray-900">
            {formatOrderDrawerMoney(detail.subtotalAmount, detail.baseCurrency)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-600">{deliveryRowLabel}</span>
          <span className="font-medium text-gray-900">{shippingLabel}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-600">{couponRowLabel}</span>
          <span
            className={`font-medium ${
              detail.discountAmount > 0 ? "text-green-700" : "text-gray-900"
            }`}
          >
            {discountLabel}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3">
          <span className="text-base font-semibold text-gray-900">{d.grandTotal}</span>
          <span className="text-base font-semibold text-gray-900">
            {formatOrderDrawerMoney(detail.totalAmount, detail.baseCurrency)}
          </span>
        </div>
      </div>
    </div>
  );
}
