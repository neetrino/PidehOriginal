"use client";

import { Calendar } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { ADMIN_INPUT, ADMIN_LABEL } from "@/features/admin/ui/admin-form-classes";
import type {
  ProductDiscountDraft,
  ProductDiscountType,
} from "@/features/products/types/product-discount";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ProductDrawerDiscountProps = {
  value: ProductDiscountDraft | null;
  disabled?: boolean;
  onChange: (next: ProductDiscountDraft | null) => void;
  copy: Dictionary["admin"]["products"]["discount"];
};

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromLocalInput(local: string): string | null {
  if (!local.trim()) return null;
  const date = new Date(local);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function ProductDrawerDiscount({
  value,
  disabled = false,
  onChange,
  copy,
}: ProductDrawerDiscountProps) {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [type, setType] = useState<ProductDiscountType>(
    value?.type ?? "PERCENTAGE",
  );
  const [amount, setAmount] = useState(
    value?.value != null && value.value > 0 ? String(value.value) : "",
  );
  const [startsAt, setStartsAt] = useState<string | null>(value?.startsAt ?? null);
  const [endsAt, setEndsAt] = useState<string | null>(value?.endsAt ?? null);
  const rootRef = useRef<HTMLDivElement>(null);
  const typeListId = useId();
  const scheduleId = useId();
  const hasSchedule = Boolean(startsAt || endsAt);

  useEffect(() => {
    setType(value?.type ?? "PERCENTAGE");
    setAmount(value?.value != null && value.value > 0 ? String(value.value) : "");
    setStartsAt(value?.startsAt ?? null);
    setEndsAt(value?.endsAt ?? null);
  }, [value]);

  useEffect(() => {
    if (!typeMenuOpen && !scheduleOpen) return;

    function handlePointerDown(event: MouseEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) {
        setTypeMenuOpen(false);
        setScheduleOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setTypeMenuOpen(false);
        setScheduleOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [typeMenuOpen, scheduleOpen]);

  function emit(
    nextType: ProductDiscountType,
    nextAmount: string,
    nextStarts: string | null,
    nextEnds: string | null,
  ): void {
    const parsed = Number(nextAmount);
    if (!nextAmount.trim() || !Number.isFinite(parsed) || parsed <= 0) {
      onChange(null);
      return;
    }
    onChange({
      type: nextType,
      value: Math.floor(parsed),
      startsAt: nextStarts,
      endsAt: nextEnds,
    });
  }

  return (
    <div ref={rootRef} className="relative">
      <span className={ADMIN_LABEL}>{copy.label}</span>
      <div className="flex items-stretch gap-2">
        <div className="relative flex min-w-0 flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm focus-within:border-gray-300">
          <button
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={typeMenuOpen}
            aria-controls={typeListId}
            onClick={() => {
              setScheduleOpen(false);
              setTypeMenuOpen((open) => !open);
            }}
            className="flex h-11 w-14 shrink-0 items-center justify-center border-r border-gray-200 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:opacity-40"
          >
            {type === "PERCENTAGE" ? "%" : "֏"}
          </button>
          <input
            type="number"
            min={0}
            max={type === "PERCENTAGE" ? 100 : undefined}
            value={amount}
            disabled={disabled}
            placeholder={copy.placeholder}
            onChange={(event) => {
              const next = event.target.value;
              setAmount(next);
              emit(type, next, startsAt, endsAt);
            }}
            className="h-11 min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-gray-900 outline-none"
          />
        </div>

        <button
          type="button"
          disabled={disabled}
          aria-expanded={scheduleOpen}
          aria-controls={scheduleId}
          aria-label={copy.scheduleAria}
          onClick={() => {
            setTypeMenuOpen(false);
            setScheduleOpen((open) => !open);
          }}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border bg-white shadow-sm transition hover:bg-gray-50 disabled:opacity-40 ${
            hasSchedule
              ? "border-amber-400 text-amber-600"
              : "border-gray-200 text-gray-500"
          }`}
        >
          <Calendar className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {typeMenuOpen ? (
        <ul
          id={typeListId}
          role="listbox"
          className="absolute left-0 z-20 mt-1 w-28 overflow-hidden rounded-xl bg-gray-800 py-1 text-sm text-white shadow-lg"
        >
          {(
            [
              { type: "PERCENTAGE" as const, label: "%" },
              { type: "FIXED" as const, label: "֏" },
            ]
          ).map((option) => (
            <li key={option.type} role="option" aria-selected={type === option.type}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-700"
                onClick={() => {
                  setType(option.type);
                  setTypeMenuOpen(false);
                  emit(option.type, amount, startsAt, endsAt);
                }}
              >
                <span>{option.label}</span>
                {type === option.type ? <span aria-hidden>✓</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {scheduleOpen ? (
        <div
          id={scheduleId}
          className="absolute right-0 z-20 mt-2 w-[min(100%,20rem)] space-y-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg"
        >
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600">
              {copy.starts}
            </span>
            <input
              type="datetime-local"
              disabled={disabled}
              value={toLocalInput(startsAt)}
              onChange={(event) => {
                const next = fromLocalInput(event.target.value);
                setStartsAt(next);
                emit(type, amount, next, endsAt);
              }}
              className={ADMIN_INPUT}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600">
              {copy.ends}
            </span>
            <input
              type="datetime-local"
              disabled={disabled}
              value={toLocalInput(endsAt)}
              onChange={(event) => {
                const next = fromLocalInput(event.target.value);
                setEndsAt(next);
                emit(type, amount, startsAt, next);
              }}
              className={ADMIN_INPUT}
            />
          </label>
          {hasSchedule ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setStartsAt(null);
                setEndsAt(null);
                emit(type, amount, null, null);
              }}
              className="text-xs font-medium text-gray-600 hover:text-gray-900"
            >
              {copy.clearSchedule}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
