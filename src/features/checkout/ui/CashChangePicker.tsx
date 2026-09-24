'use client';

import {
  CASH_CHANGE_NOT_NEEDED,
  type CashChangeDenominationView,
} from '@/features/delivery/domain/cash-change';
import { formatMoneyAmount } from '@/lib/money/format';
import type { Locale } from '@/lib/i18n/config';

type CashChangePickerLabels = {
  title: string;
  hint: string;
  ariaLabel: string;
  notNeeded: string;
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
      <legend className="font-display text-xl leading-none text-[#1e1e1e] uppercase">
        {labels.title}
      </legend>
      <p className="mt-2 text-sm text-[#1e1e1e]/60">{labels.hint}</p>
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
                  ? 'border-[#ff6b00] bg-[#fff8e7]'
                  : 'border-[#ff6b00]/20 bg-white hover:border-[#ff6b00]/45'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span className="flex aspect-[2.15/1] w-full items-center justify-center overflow-hidden rounded-xl bg-[#fff8e7]">
                {option.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- CDN/local media URL
                  <img src={option.imageUrl} alt="" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-lg font-bold text-[#ff6b00]">
                    {Math.round(option.amount / 1000)}k
                  </span>
                )}
              </span>
              <span className="text-sm font-bold text-[#1e1e1e]">
                {formatMoneyAmount(option.amount, 'AMD', locale)}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          role="radio"
          aria-checked={value === CASH_CHANGE_NOT_NEEDED}
          disabled={disabled}
          onClick={() => onChange(CASH_CHANGE_NOT_NEEDED)}
          className={`col-span-2 flex h-12 items-center justify-center rounded-2xl border px-3 text-center text-sm font-bold transition-colors sm:col-span-4 ${
            value === CASH_CHANGE_NOT_NEEDED
              ? 'border-[#ff6b00] bg-[#fff8e7] text-[#ff6b00]'
              : 'border-[#ff6b00]/20 bg-white text-[#1e1e1e] hover:border-[#ff6b00]/45'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {labels.notNeeded}
        </button>
      </div>
    </fieldset>
  );
}
