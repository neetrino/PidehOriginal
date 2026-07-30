"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { ADMIN_LABEL } from "@/features/admin/ui/admin-form-classes";
import { updateContactStatusAction } from "@/features/contact/application/update-contact-status";
import type { ContactStatus } from "@/features/contact/domain/contact-rules";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type UpdateContactStatusFormProps = {
  locale: string;
  messageId: string;
  currentStatus: ContactStatus;
  eligibleStatuses: ContactStatus[];
  copy: Dictionary["admin"];
};

export function UpdateContactStatusForm({
  locale,
  messageId,
  currentStatus,
  eligibleStatuses,
  copy,
}: UpdateContactStatusFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(eligibleStatuses[0] ?? "");
  const [isPending, startTransition] = useTransition();

  if (eligibleStatuses.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        {copy.messages.updateStatus.noFurtherChanges}
      </p>
    );
  }

  return (
    <Card className="p-6">
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();

          startTransition(async () => {
            setError(null);
            const result = await updateContactStatusAction(locale, {
              messageId,
              status: status as ContactStatus,
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
          <span className={ADMIN_LABEL}>
            {copy.messages.updateStatus.newStatus}
          </span>
          <SelectDropdown
            name="status"
            ariaLabel={copy.messages.updateStatus.newStatusAria}
            value={status}
            options={eligibleStatuses.map((item) => ({
              label: item,
              value: item,
            }))}
            disabled={isPending}
            deferChange={false}
            className="mt-1"
            onValueChange={setStatus}
          />
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending
            ? copy.common.updating
            : copy.messages.updateStatus.updateStatus}
        </Button>
      </form>
    </Card>
  );
}
