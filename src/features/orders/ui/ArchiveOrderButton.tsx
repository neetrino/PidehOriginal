"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  ConfirmDialog,
} from "@/components/ui/ConfirmDialog";
import { ADMIN_SECTION_TITLE } from "@/features/admin/ui/admin-form-classes";
import { archiveOrderAction } from "@/features/orders/application/archive-order";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ArchiveOrderButtonProps = {
  locale: string;
  orderNumber: string;
  isArchived: boolean;
  copy: Dictionary["admin"];
};

export function ArchiveOrderButton({
  locale,
  orderNumber,
  isArchived,
  copy,
}: ArchiveOrderButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function runArchive(archive: boolean): void {
    startTransition(async () => {
      setError(null);
      const result = await archiveOrderAction(locale, {
        orderNumber,
        archive,
      });

      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-3">
        <h2 className={ADMIN_SECTION_TITLE}>{copy.orders.archive.title}</h2>
        <p className="text-sm text-gray-600">
          {isArchived
            ? copy.orders.archive.archivedHint
            : copy.orders.archive.activeHint}
        </p>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => {
            if (isArchived) {
              runArchive(false);
              return;
            }
            setConfirmOpen(true);
          }}
        >
          {isPending
            ? copy.common.saving
            : isArchived
              ? copy.orders.archive.restoreOrder
              : copy.orders.archive.archiveOrder}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={copy.confirm.archiveTitle}
        description={copy.confirm.archiveOrder.replace("{orderNumber}", orderNumber)}
        confirmLabel={copy.confirm.archiveConfirmLabel}
        cancelLabel={copy.confirm.cancelLabel}
        isPending={isPending}
        onClose={() => {
          if (!isPending) setConfirmOpen(false);
        }}
        onConfirm={() => runArchive(true)}
      />
    </Card>
  );
}
