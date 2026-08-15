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

type CustomerOrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  baseCurrency: string;
  placedAt: string | Date;
};

type CustomerOrdersTableProps = {
  orders: CustomerOrderRow[];
  onOpenOrder: (orderNumber: string) => void;
};

export function CustomerOrdersTable({
  orders,
  onOpenOrder,
}: CustomerOrdersTableProps) {
  return (
    <div className={`${PROFILE_PANEL} overflow-hidden p-0`}>
      <div className={ADMIN_TABLE_OUTER_SCROLL}>
        <table className={ADMIN_TABLE}>
          <thead className={ADMIN_TABLE_THEAD}>
            <tr>
              <th className={ADMIN_TABLE_TH}>Order</th>
              <th className={ADMIN_TABLE_TH}>Status</th>
              <th className={ADMIN_TABLE_TH}>Payment</th>
              <th className={ADMIN_TABLE_TH}>Total</th>
              <th className={ADMIN_TABLE_TH}>Placed</th>
            </tr>
          </thead>
          <tbody className={ADMIN_TABLE_TBODY}>
            {orders.map((order) => (
              <tr key={order.id} className={ADMIN_TABLE_ROW}>
                <td className={ADMIN_TABLE_TD}>
                  <button
                    type="button"
                    onClick={() => onOpenOrder(order.orderNumber)}
                    className="font-bold text-[#ff6b00] hover:underline"
                  >
                    {order.orderNumber}
                  </button>
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
                  <span className="text-xs text-gray-500">
                    {new Date(order.placedAt)
                      .toISOString()
                      .slice(0, 16)
                      .replace("T", " ")}{" "}
                    UTC
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
            {orders.length} order{orders.length === 1 ? "" : "s"} on this page
          </p>
        </div>
      )}
    </div>
  );
}
