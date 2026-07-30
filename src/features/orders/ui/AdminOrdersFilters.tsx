"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import { Card } from "@/components/ui/Card";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import type { OrderStatus } from "@/features/orders/domain/order-status";
import type { PaymentStatus } from "@/features/orders/domain/payment-status";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const FILTER_SEARCH =
  "h-11 min-w-0 flex-1 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-300";

type AdminOrdersFiltersProps = {
  total: number;
  status?: OrderStatus;
  paymentStatus?: string;
  q?: string;
  copy: Dictionary["admin"];
};

export function AdminOrdersFilters({
  total,
  status,
  paymentStatus,
  q,
  copy,
}: AdminOrdersFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [statusValue, setStatusValue] = useState(status ?? "");
  const [paymentValue, setPaymentValue] = useState(paymentStatus ?? "");

  const f = copy.orders.filters;

  const orderStatusFilters = [
    { label: f.statusPending, value: "PENDING" as OrderStatus },
    { label: f.statusProcessing, value: "PROCESSING" as OrderStatus },
    { label: f.statusCompleted, value: "DELIVERED" as OrderStatus },
    { label: f.statusCancelled, value: "CANCELLED" as OrderStatus },
  ];

  const paymentStatusFilters = [
    { label: f.paymentPaid, value: "CAPTURED" as PaymentStatus },
    { label: f.paymentPending, value: "PENDING" as PaymentStatus },
    { label: f.paymentFailed, value: "FAILED" as PaymentStatus },
  ];

  function applyStatus(next: string): void {
    flushSync(() => setStatusValue(next));
    formRef.current?.requestSubmit();
  }

  function applyPayment(next: string): void {
    flushSync(() => setPaymentValue(next));
    formRef.current?.requestSubmit();
  }

  return (
    <Card className="mb-6 overflow-visible">
      <form
        ref={formRef}
        method="get"
        className="flex flex-nowrap items-center gap-3 p-4"
      >
        <SelectDropdown
          name="status"
          ariaLabel={f.orderStatusAria}
          value={statusValue}
          allLabel={f.allStatuses}
          options={orderStatusFilters}
          className="w-[180px] shrink-0"
          onValueChange={applyStatus}
        />
        <SelectDropdown
          name="paymentStatus"
          ariaLabel={f.paymentStatusAria}
          value={paymentValue}
          allLabel={f.allPaymentStatuses}
          options={paymentStatusFilters}
          className="w-[200px] shrink-0"
          onValueChange={applyPayment}
        />
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder={f.searchPlaceholder}
          className={FILTER_SEARCH}
          aria-label={f.searchAria}
        />
      </form>
      <div className="border-t border-gray-200 px-4 py-3">
        <p className="text-sm text-gray-600">
          {f.totalOrders.replace("{total}", String(total))}
        </p>
      </div>
    </Card>
  );
}
