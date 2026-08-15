"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import { PROFILE_PANEL } from "@/features/profile/ui/profile-ui-classes";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import type { OrderStatus } from "@/features/orders/domain/order-status";
import type { PaymentStatus } from "@/features/orders/domain/payment-status";

const FILTER_SEARCH =
  "h-11 w-full min-w-0 shrink-0 rounded-2xl border border-[#ff6b00]/20 bg-[#fff8e7] px-4 text-sm text-[#1e1e1e] outline-none transition placeholder:text-[#1e1e1e]/40 hover:border-[#ff6b00]/40 focus:border-[#ff6b00] lg:flex-1 lg:shrink";

const ORDER_STATUS_FILTERS = [
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Completed", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
] as const satisfies ReadonlyArray<{ label: string; value: OrderStatus }>;

const PAYMENT_STATUS_FILTERS = [
  { label: "Paid", value: "CAPTURED" },
  { label: "Pending", value: "PENDING" },
  { label: "Failed", value: "FAILED" },
] as const satisfies ReadonlyArray<{ label: string; value: PaymentStatus }>;

type CustomerOrdersFiltersProps = {
  total: number;
  status?: OrderStatus;
  paymentStatus?: string;
  q?: string;
};

export function CustomerOrdersFilters({
  total,
  status,
  paymentStatus,
  q,
}: CustomerOrdersFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [statusValue, setStatusValue] = useState(status ?? "");
  const [paymentValue, setPaymentValue] = useState(paymentStatus ?? "");

  function applyStatus(next: string): void {
    flushSync(() => setStatusValue(next));
    formRef.current?.requestSubmit();
  }

  function applyPayment(next: string): void {
    flushSync(() => setPaymentValue(next));
    formRef.current?.requestSubmit();
  }

  return (
    <div className={`${PROFILE_PANEL} mb-0 overflow-visible p-0`}>
      <form
        ref={formRef}
        method="get"
        className="flex flex-col gap-3 p-4 lg:flex-row lg:flex-nowrap lg:items-center"
      >
        <SelectDropdown
          name="status"
          ariaLabel="Order status"
          value={statusValue}
          allLabel="All statuses"
          options={ORDER_STATUS_FILTERS}
          className="w-full lg:w-[180px] lg:shrink-0"
          onValueChange={applyStatus}
        />
        <SelectDropdown
          name="paymentStatus"
          ariaLabel="Payment status"
          value={paymentValue}
          allLabel="All payment statuses"
          options={PAYMENT_STATUS_FILTERS}
          className="w-full lg:w-[200px] lg:shrink-0"
          onValueChange={applyPayment}
        />
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by order #"
          className={FILTER_SEARCH}
          aria-label="Search orders"
        />
      </form>
      <div className="border-t border-[#ff6b00]/12 px-4 py-3">
        <p className="text-sm text-[#1e1e1e]/65">Total orders: {total}</p>
      </div>
    </div>
  );
}
