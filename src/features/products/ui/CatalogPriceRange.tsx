"use client";

import { useId, useState } from "react";
import { ChevronUp } from "lucide-react";

import type { CatalogPriceBounds } from "@/features/products/application/catalog-price-bounds";
import { CATALOG_PRICE_FILTER_MAX } from "@/features/products/schemas/catalog-list";
import type { Currency } from "@/lib/money/currency";
import { currencySymbols } from "@/lib/money/currency";

type CatalogPriceRangeProps = {
  label: string;
  currency: Currency;
  bounds: CatalogPriceBounds;
  minValue: number;
  maxValue: number;
  onRangeChange: (min: number, max: number) => void;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatAmount(value: number): string {
  return value.toLocaleString("en-US");
}

function digitsOnly(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

function parseAmount(raw: string): number | null {
  const digits = digitsOnly(raw);
  if (!digits) return null;
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function CatalogPriceRange({
  label,
  currency,
  bounds,
  minValue,
  maxValue,
  onRangeChange,
}: CatalogPriceRangeProps) {
  const [open, setOpen] = useState(true);
  const [minDraft, setMinDraft] = useState<string | null>(null);
  const [maxDraft, setMaxDraft] = useState<string | null>(null);
  const baseId = useId();
  const symbol = currencySymbols[currency];

  const sliderMin = Math.min(bounds.min, minValue);
  const sliderMax = Math.max(bounds.max, maxValue, sliderMin + 1);
  const span = Math.max(1, sliderMax - sliderMin);
  const minPercent = ((minValue - sliderMin) / span) * 100;
  const maxPercent = ((maxValue - sliderMin) / span) * 100;

  function commitMin(next: number): void {
    onRangeChange(
      clamp(next, 0, Math.min(maxValue, CATALOG_PRICE_FILTER_MAX)),
      maxValue,
    );
  }

  function commitMax(next: number): void {
    onRangeChange(
      minValue,
      clamp(next, minValue, CATALOG_PRICE_FILTER_MAX),
    );
  }

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={open}
        aria-controls={baseId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="text-sm font-semibold tracking-wide text-gray-900 uppercase">
          {label}
        </span>
        <ChevronUp
          className={`size-4 text-gray-400 transition-transform ${open ? "" : "rotate-180"}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div id={baseId} className="mt-4 flex flex-col gap-4">
          <div className="relative h-7">
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-200" />
            <div
              className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-blue-500"
              style={{
                left: `${minPercent}%`,
                right: `${100 - maxPercent}%`,
              }}
            />
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={1}
              value={minValue}
              aria-label={`${label} min`}
              className="catalog-price-range absolute inset-0 z-20 w-full appearance-none bg-transparent"
              onChange={(event) => {
                commitMin(Number.parseInt(event.target.value, 10));
              }}
            />
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={1}
              value={maxValue}
              aria-label={`${label} max`}
              className="catalog-price-range absolute inset-0 z-30 w-full appearance-none bg-transparent"
              onChange={(event) => {
                commitMax(Number.parseInt(event.target.value, 10));
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="flex min-w-0 flex-1 items-center gap-1 rounded-xl bg-gray-50 px-3 py-2.5 ring-1 ring-gray-100 focus-within:ring-gray-300">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                spellCheck={false}
                value={minDraft ?? formatAmount(minValue)}
                onFocus={() => setMinDraft(String(minValue))}
                onChange={(event) => setMinDraft(digitsOnly(event.target.value))}
                onBlur={() => {
                  const parsed = parseAmount(minDraft ?? "");
                  setMinDraft(null);
                  if (parsed != null) commitMin(parsed);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.currentTarget.blur();
                    return;
                  }
                  if (
                    event.key.length === 1 &&
                    !/\d/.test(event.key) &&
                    !event.ctrlKey &&
                    !event.metaKey &&
                    !event.altKey
                  ) {
                    event.preventDefault();
                  }
                }}
                className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 tabular-nums outline-none"
              />
              <span className="shrink-0 text-sm text-gray-500">{symbol}</span>
            </label>

            <span className="h-px w-3 shrink-0 bg-gray-300" aria-hidden />

            <label className="flex min-w-0 flex-1 items-center gap-1 rounded-xl bg-gray-50 px-3 py-2.5 ring-1 ring-gray-100 focus-within:ring-gray-300">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                spellCheck={false}
                value={maxDraft ?? formatAmount(maxValue)}
                onFocus={() => setMaxDraft(String(maxValue))}
                onChange={(event) => setMaxDraft(digitsOnly(event.target.value))}
                onBlur={() => {
                  const parsed = parseAmount(maxDraft ?? "");
                  setMaxDraft(null);
                  if (parsed != null) commitMax(parsed);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.currentTarget.blur();
                    return;
                  }
                  if (
                    event.key.length === 1 &&
                    !/\d/.test(event.key) &&
                    !event.ctrlKey &&
                    !event.metaKey &&
                    !event.altKey
                  ) {
                    event.preventDefault();
                  }
                }}
                className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 tabular-nums outline-none"
              />
              <span className="shrink-0 text-sm text-gray-500">{symbol}</span>
            </label>
          </div>
        </div>
      ) : null}
    </div>
  );
}
