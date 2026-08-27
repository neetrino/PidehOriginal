"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  deletePopupAction,
  togglePopupAction,
} from "@/features/popups/application/manage-popups";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type PopupControlsProps = {
  locale: string;
  popupId: string;
  popupTitle: string;
  isActive: boolean;
  onEdit: () => void;
  copy: Dictionary["admin"];
};

export function PopupControls({
  locale,
  popupId,
  popupTitle,
  isActive,
  onEdit,
  copy,
}: PopupControlsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function run(
    action: () => Promise<{ ok: boolean; error?: { message: string } }>,
    options?: { closeConfirm?: boolean },
  ): void {
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (!result.ok) {
        setError(result.error?.message ?? copy.common.actionFailed);
        return;
      }
      if (options?.closeConfirm) {
        setConfirmOpen(false);
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={isPending}
          onClick={onEdit}
          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
          aria-label={copy.popups.editAria.replace("{title}", popupTitle)}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setConfirmOpen(true)}
          className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
          aria-label={copy.popups.deleteAria.replace("{title}", popupTitle)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          disabled={isPending}
          onClick={() =>
            run(() =>
              togglePopupAction(locale, {
                popupId,
                isActive: !isActive,
              }),
            )
          }
          className={`relative ml-1 h-5 w-9 rounded-full transition-colors disabled:opacity-50 ${
            isActive ? "bg-green-500" : "bg-gray-300"
          }`}
          aria-label={
            isActive ? copy.popups.deactivateAria : copy.popups.activateAria
          }
        >
          <span
            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
              isActive ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}

      <ConfirmDialog
        open={confirmOpen}
        title={copy.confirm.deleteTitle}
        description={copy.confirm.deleteEntity
          .replace("{entity}", copy.confirm.entityLabels.popup)
          .replace("{name}", popupTitle)}
        confirmLabel={copy.confirm.confirmLabel}
        cancelLabel={copy.confirm.cancelLabel}
        isPending={isPending}
        onClose={() => {
          if (!isPending) setConfirmOpen(false);
        }}
        onConfirm={() =>
          run(() => deletePopupAction(locale, { popupId }), {
            closeConfirm: true,
          })
        }
      />
    </div>
  );
}
