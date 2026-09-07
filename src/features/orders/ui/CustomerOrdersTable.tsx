"use client";

import { PROFILE_PANEL } from "@/features/profile/ui/profile-ui-classes";
import {
  ADMIN_BADGE,
  orderStatusBadgeClass,
  paymentStatusBadgeClass,
} from "@/features/admin/ui/status-badge";
import {
  ADMIN_TABLE,
  ADMIN_TABLE_FOOTER_ROUNDED_B,
  ADMIN_TABLE_OUTER_SCROLL,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_STATE_INSET,
  ADMIN_TABLE_TBODY,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TH,
  ADMIN_TABLE_THEAD,
} from "@/features/admin/ui/admin-table-classes";
import {
  formatOrderDrawerMoney,
  formatOrderStatusLabel,
} from "@/features/orders/ui/order-drawer-format";
import { formatYerevanDateTime } from "@/features/delivery/domain/delivery-schedule";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type CustomerOrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  bonusRedeemedAmount: number;
  bonusEarnedAmount: number;
  baseCurrency: string;
  placedAt: string | Date;
};

type CustomerOrdersTableProps = {
  orders: CustomerOrderRow[];
  onOpenOrder: (orderNumber: string) => void;
  copy: Dictionary["admin"];
};

export function CustomerOrdersTable({
  orders,
  onOpenOrder,
  copy,
}: CustomerOrdersTableProps) {
  const table = copy.orders.table;

  return (
    <div className={`${PROFILE_PANEL} overflow-hidden p-0`}>
      <div className={ADMIN_TABLE_OUTER_SCROLL}>
        <table className={ADMIN_TABLE}>
          <thead className={ADMIN_TABLE_THEAD}>
            <tr>
              <th className={ADMIN_TABLE_TH}>{table.order}</th>
              <th className={ADMIN_TABLE_TH}>{table.status}</th>
              <th className={ADMIN_TABLE_TH}>{table.payment}</th>
              <th className={ADMIN_TABLE_TH}>{table.total}</th>
              <th className={ADMIN_TABLE_TH}>{table.bonus}</th>
              <th className={ADMIN_TABLE_TH}>{table.placed}</th>
            </tr>
          </thead>
          <tbody className={ADMIN_TABLE_TBODY}>
            {orders.map((order) => (
              <tr
                key={order.id}
                className={`${ADMIN_TABLE_ROW} cursor-pointer`}
                onClick={() => onOpenOrder(order.orderNumber)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpenOrder(order.orderNumber);
                  }
                }}
                tabIndex={0}
                role="link"
                aria-label={order.orderNumber}
              >
                <td className={ADMIN_TABLE_TD}>
                  <span className="font-bold text-[#ff6b00]">
                    {order.orderNumber}
                  </span>
                </td>
                <td className={ADMIN_TABLE_TD}>
                  <span
                    className={`${ADMIN_BADGE} ${orderStatusBadgeClass(order.status)}`}
                  >
                    {formatOrderStatusLabel(order.status)}
                  </span>
                </td>
                <td className={ADMIN_TABLE_TD}>
                  <span
                    className={`${ADMIN_BADGE} ${paymentStatusBadgeClass(order.paymentStatus)}`}
                  >
                    {formatOrderStatusLabel(order.paymentStatus)}
                  </span>
                </td>
                <td className={ADMIN_TABLE_TD}>
                  <span className="font-medium text-gray-900">
                    {formatOrderDrawerMoney(
                      order.totalAmount,
                      order.baseCurrency,
                    )}
                  </span>
                </td>
                <td className={ADMIN_TABLE_TD}>
                  <OrderBonusCell
                    earned={order.bonusEarnedAmount}
                    redeemed={order.bonusRedeemedAmount}
                    currency={order.baseCurrency}
                    emptyLabel={table.bonusEmpty}
                  />
                </td>
                <td className={ADMIN_TABLE_TD}>
                  <span className="text-xs text-gray-500">
                    {formatYerevanDateTime(order.placedAt)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 ? (
        <p className={`${ADMIN_TABLE_STATE_INSET} text-sm text-[#1e1e1e]/65`}>
          No orders match these filters.
        </p>
      ) : (
        <div className={ADMIN_TABLE_FOOTER_ROUNDED_B}>
          <p className="text-sm text-[#1e1e1e]/65">
            Showing {orders.length} order{orders.length === 1 ? "" : "s"}
          </p>
        </div>
      )}
    </div>
  );
}

function OrderBonusCell({
  earned,
  redeemed,
  currency,
  emptyLabel,
}: {
  earned: number;
  redeemed: number;
  currency: string;
  emptyLabel: string;
}) {
  if (earned <= 0 && redeemed <= 0) {
    return <span className="text-xs text-gray-400">{emptyLabel}</span>;
  }

  return (
    <div className="flex flex-col gap-0.5 text-xs">
      {earned > 0 ? (
        <span className="font-medium text-emerald-700">
          +{formatOrderDrawerMoney(earned, currency)}
        </span>
      ) : null}
      {redeemed > 0 ? (
        <span className="font-medium text-green-700">
          −{formatOrderDrawerMoney(redeemed, currency)}
        </span>
      ) : null}
    </div>
  );
}
