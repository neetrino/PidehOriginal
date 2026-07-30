"use client";

import { SideSheet } from "@/components/ui/SideSheet";
import type { AdminOrderDetailView } from "@/features/orders/application/order-detail-view";
import { OrderDetailsDrawerItems } from "@/features/orders/ui/OrderDetailsDrawerItems";
import { OrderDetailsDrawerShipping } from "@/features/orders/ui/OrderDetailsDrawerShipping";
import { OrderDetailsDrawerSummary } from "@/features/orders/ui/OrderDetailsDrawerSummary";
import { OrderDetailsDrawerTotals } from "@/features/orders/ui/OrderDetailsDrawerTotals";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type OrderDetailsDrawerProps = {
  open: boolean;
  onClose: () => void;
  detail: AdminOrderDetailView | null;
  error: string | null;
  isLoading: boolean;
  copy: Dictionary["admin"];
};

export function OrderDetailsDrawer({
  open,
  onClose,
  detail,
  error,
  isLoading,
  copy,
}: OrderDetailsDrawerProps) {
  return (
    <SideSheet
      open={open}
      onClose={onClose}
      ariaLabel={copy.orders.drawer.ariaLabel}
      panelClassName="w-full sm:w-[60%]"
    >
      <div className="border-b border-gray-100 px-6 py-5">
        <h2 className="text-2xl font-semibold text-gray-900">{copy.orders.drawer.title}</h2>
        {detail ? (
          <p className="mt-1 text-sm text-gray-500">#{detail.orderNumber}</p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
        {isLoading ? (
          <p className="py-4 text-sm text-gray-600">{copy.orders.drawer.loading}</p>
        ) : null}
        {error ? <p className="py-4 text-sm text-red-700">{error}</p> : null}
        {!isLoading && !error && detail ? (
          <>
            <OrderDetailsDrawerSummary detail={detail} copy={copy} />
            <OrderDetailsDrawerShipping detail={detail} copy={copy} />
            <OrderDetailsDrawerTotals detail={detail} copy={copy} />
            <OrderDetailsDrawerItems detail={detail} copy={copy} />
          </>
        ) : null}
      </div>
    </SideSheet>
  );
}
