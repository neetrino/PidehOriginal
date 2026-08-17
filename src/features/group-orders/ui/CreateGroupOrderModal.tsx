"use client";

import { Info, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/Button";
import { createGroupOrderAction } from "@/features/group-orders/actions";
import type { GroupOrderPaymentMode } from "@/features/group-orders/domain/status";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

type CreateGroupOrderModalProps = {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  labels: Dictionary["groupOrder"];
  defaultName?: string;
};

export function CreateGroupOrderModal({
  open,
  onClose,
  locale,
  labels,
  defaultName = "",
}: CreateGroupOrderModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [paymentMode, setPaymentMode] =
    useState<GroupOrderPaymentMode>("ORGANIZER_PAYS_ALL");
  const [name, setName] = useState(defaultName);
  const [spendLimit, setSpendLimit] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open || typeof document === "undefined") return null;

  function submit(): void {
    setError(null);
    const limitRaw = spendLimit.trim();
    const spendLimitAmount =
      paymentMode === "ORGANIZER_PAYS_ALL" && limitRaw
        ? Number.parseInt(limitRaw, 10)
        : null;

    if (
      spendLimitAmount != null &&
      (!Number.isInteger(spendLimitAmount) || spendLimitAmount < 1)
    ) {
      setError(labels.errorGeneric);
      return;
    }

    startTransition(async () => {
      const result = await createGroupOrderAction({
        paymentMode,
        organizerDisplayName: name.trim() || labels.organizer,
        spendLimitAmount,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
      router.push(`/${locale}/group-orders/${result.inviteToken}`);
    });
  }

  return createPortal(
    <div className="fixed inset-0 z-[220] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label={labels.close}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={labels.createTitle}
        className="relative z-[221] flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {labels.createTitle}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {labels.createDescription}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label={labels.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">
              {labels.organizerNameLabel}
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={labels.organizerNamePlaceholder}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400"
            />
          </label>

          <PaymentOption
            selected={paymentMode === "ORGANIZER_PAYS_ALL"}
            title={labels.paymentModeOrganizer}
            hint={labels.paymentModeOrganizerHint}
            onSelect={() => setPaymentMode("ORGANIZER_PAYS_ALL")}
          >
            {paymentMode === "ORGANIZER_PAYS_ALL" ? (
              <div className="mt-3">
                <p className="mb-1.5 text-xs text-gray-500">
                  {labels.spendLimitHint}
                </p>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <span className="text-sm text-gray-500">֏</span>
                  <input
                    inputMode="numeric"
                    value={spendLimit}
                    onChange={(e) => setSpendLimit(e.target.value)}
                    placeholder={labels.spendLimitLabel}
                    className="w-full bg-transparent text-sm text-gray-900 outline-none"
                  />
                </div>
              </div>
            ) : null}
          </PaymentOption>

          <div className="border-t border-gray-100" />

          <PaymentOption
            selected={paymentMode === "SPLIT_PER_PARTICIPANT"}
            title={labels.paymentModeSplit}
            onSelect={() => setPaymentMode("SPLIT_PER_PARTICIPANT")}
          />

          <p className="flex items-start gap-2 text-xs leading-relaxed text-gray-500">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {labels.infoNote}
          </p>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="border-t border-gray-100 px-5 py-4">
          <Button
            type="button"
            className="w-full rounded-full"
            size="lg"
            disabled={pending || !name.trim()}
            onClick={submit}
          >
            {labels.start}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function PaymentOption({
  selected,
  title,
  hint,
  onSelect,
  children,
}: {
  selected: boolean;
  title: string;
  hint?: string;
  onSelect: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition-colors ${
        selected
          ? "border-gray-900 bg-gray-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <Users className="mt-0.5 h-5 w-5 shrink-0 text-gray-700" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {hint ? <p className="mt-0.5 text-xs text-gray-500">{hint}</p> : null}
          {children}
        </div>
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? "border-gray-900" : "border-gray-300"
          }`}
          aria-hidden
        >
          {selected ? (
            <span className="h-2.5 w-2.5 rounded-full bg-gray-900" />
          ) : null}
        </span>
      </div>
    </button>
  );
}
