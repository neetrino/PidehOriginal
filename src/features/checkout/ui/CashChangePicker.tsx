"use client";

import type { CashChangeDenominationView } from "@/features/delivery/domain/cash-change";
import { formatMoneyAmount } from "@/lib/money/format";
import type { Locale } from "@/lib/i18n/config";

type CashChangePickerLabels = {
  title: string;
  hint: string;
  ariaLabel: string;
};

type CashChangePickerProps = {
  options: CashChangeDenominationView[];
  value: number | null;
  onChange: (amount: number) => void;
  disabled?: boolean;
  locale: Locale;
  labels: CashChangePickerLabels;
};

export function CashChangePicker({
  options,
  value,
  onChange,
  disabled = false,
  locale,
  labels,
}: CashChangePickerProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <fieldset className="mt-4" disabled={disabled}>
      <legend className="text-sm font-medium text-gray-900">{labels.title}</legend>
      <p className="mt-1 text-sm text-gray-600">{labels.hint}</p>
      <div
        className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4"
        role="radiogroup"
        aria-label={labels.ariaLabel}
      >
        {options.map((option) => {
          const selected = value === option.amount;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(option.amount)}
              className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-3 text-center transition-colors ${
                selected
                  ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                  : "border-gray-200 bg-white hover:border-gray-300"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span className="flex h-14 w-full items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                {option.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- CDN/local media URL
                  <img
                    src={option.imageUrl}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-lg font-semibold text-gray-700">
                    {Math.round(option.amount / 1000)}k
                  </span>
                )}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {formatMoneyAmount(option.amount, "AMD", locale)}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
