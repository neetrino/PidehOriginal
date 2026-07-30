"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import {
  ADMIN_LABEL,
  ADMIN_TEXTAREA,
} from "@/features/admin/ui/admin-form-classes";
import { changeOrderStatusAction } from "@/features/orders/application/change-order-status";
import type { OrderStatus } from "@/features/orders/domain/order-status";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ChangeOrderStatusFormProps = {
  locale: string;
  orderNumber: string;
  currentStatus: OrderStatus;
  eligibleStatuses: OrderStatus[];
  copy: Dictionary["admin"];
};

export function ChangeOrderStatusForm({
  locale,
  orderNumber,
  currentStatus,
  eligibleStatuses,
  copy,
}: ChangeOrderStatusFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [toStatus, setToStatus] = useState(eligibleStatuses[0] ?? "");
  const [isPending, startTransition] = useTransition();

  if (eligibleStatuses.length === 0) {
    return (
      <p className="text-sm text-gray-600">{copy.orders.changeStatus.terminal}</p>
    );
  }

  return (
    <Card className="p-6">
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const noteRaw = String(formData.get("note") ?? "").trim();

          startTransition(async () => {
            setError(null);
            const result = await changeOrderStatusAction(locale, {
              orderNumber,
              toStatus: toStatus as OrderStatus,
              note: noteRaw.length > 0 ? noteRaw : undefined,
            });

            if (!result.ok) {
              setError(result.error.message);
              return;
            }

            router.refresh();
          });
        }}
      >
        <p className="text-sm text-gray-700">
          {copy.common.current.replace("{value}", currentStatus)}
        </p>
        <div>
          <span className={ADMIN_LABEL}>{copy.orders.changeStatus.newStatus}</span>
          <SelectDropdown
            name="toStatus"
            ariaLabel={copy.orders.changeStatus.newStatusAria}
            value={toStatus}
            options={eligibleStatuses.map((status) => ({
              label: status,
              value: status,
            }))}
            disabled={isPending}
            deferChange={false}
            className="mt-1"
            onValueChange={setToStatus}
          />
        </div>
        <label>
          <span className={ADMIN_LABEL}>{copy.orders.changeStatus.noteOptional}</span>
          <textarea
            name="note"
            rows={2}
            maxLength={1000}
            className={ADMIN_TEXTAREA}
            disabled={isPending}
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? copy.common.updating : copy.orders.changeStatus.updateStatus}
        </Button>
      </form>
    </Card>
  );
}
