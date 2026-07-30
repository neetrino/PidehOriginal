"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AppLink } from "@/components/ui/AppLink";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import type { CatalogPriceBounds } from "@/features/products/application/catalog-price-bounds";
import {
  catalogHref,
  clearCatalogFiltersHref,
} from "@/features/products/application/catalog-search-params";
import type { CatalogFilters } from "@/features/products/schemas/catalog-list";
import { CATALOG_PRICE_FILTER_MAX } from "@/features/products/schemas/catalog-list";
import { CatalogPriceRange } from "@/features/products/ui/CatalogPriceRange";
import type { Currency } from "@/lib/money/currency";

export type CatalogFilterLabels = {
  filters: string;
  clearFilters: string;
  searchLabel: string;
  searchPlaceholder: string;
  categoryLabel: string;
  allCategories: string;
  priceLabel: string;
  availabilityLabel: string;
  inStockOnly: string;
  onSaleOnly: string;
};

type CategoryOption = {
  slug: string;
  title: string;
};

type CatalogFilterFormProps = {
  locale: string;
  currency: Currency;
  filters: CatalogFilters;
  categories: CategoryOption[];
  priceBounds: CatalogPriceBounds;
  labels: CatalogFilterLabels;
  active: boolean;
  className?: string;
};

const FIELD =
  "mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400";

const CHECK =
  "size-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400";

const TEXT_DEBOUNCE_MS = 350;

function resolveRange(
  filters: CatalogFilters,
  bounds: CatalogPriceBounds,
): { min: number; max: number } {
  const min = Math.max(0, filters.minPrice ?? bounds.min);
  const max = Math.max(
    min,
    Math.min(CATALOG_PRICE_FILTER_MAX, filters.maxPrice ?? bounds.max),
  );
  return { min, max };
}

function toFilterPrice(
  value: number,
  defaultBound: number,
  edge: "min" | "max",
): number | undefined {
  if (edge === "min") {
    if (value <= 0 || value === defaultBound) return undefined;
    return value;
  }
  if (value >= CATALOG_PRICE_FILTER_MAX || value === defaultBound) {
    return undefined;
  }
  return value;
}

export function CatalogFilterForm({
  locale,
  currency,
  filters,
  categories,
  priceBounds,
  labels,
  active,
  className = "",
}: CatalogFilterFormProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const initialRange = resolveRange(filters, priceBounds);
  const [categoryValue, setCategoryValue] = useState(filters.category ?? "");
  const [searchValue, setSearchValue] = useState(filters.q ?? "");
  const [rangeMin, setRangeMin] = useState(initialRange.min);
  const [rangeMax, setRangeMax] = useState(initialRange.max);
  const [inStock, setInStock] = useState(Boolean(filters.inStock));
  const [onSale, setOnSale] = useState(Boolean(filters.onSale));

  const [prevFilters, setPrevFilters] = useState(filters);
  if (filters !== prevFilters) {
    const previousRange = resolveRange(prevFilters, priceBounds);
    const nextRange = resolveRange(filters, priceBounds);
    setPrevFilters(filters);
    setCategoryValue(filters.category ?? "");
    setInStock(Boolean(filters.inStock));
    setOnSale(Boolean(filters.onSale));
    if (searchValue === (prevFilters.q ?? "")) {
      setSearchValue(filters.q ?? "");
    }
    if (rangeMin === previousRange.min && rangeMax === previousRange.max) {
      setRangeMin(nextRange.min);
      setRangeMax(nextRange.max);
    }
  }

  const isFirstDebouncePass = useRef(true);

  function pushFilters(
    next: Partial<CatalogFilters>,
    draft?: {
      searchValue: string;
      rangeMin: number;
      rangeMax: number;
      categoryValue: string;
      inStock: boolean;
      onSale: boolean;
    },
  ): void {
    const current = draft ?? {
      searchValue,
      rangeMin,
      rangeMax,
      categoryValue,
      inStock,
      onSale,
    };
    const href = catalogHref(locale, filters, {
      q: current.searchValue.trim() || undefined,
      minPrice: toFilterPrice(current.rangeMin, priceBounds.min, "min"),
      maxPrice: toFilterPrice(current.rangeMax, priceBounds.max, "max"),
      category: current.categoryValue || undefined,
      inStock: current.inStock ? true : undefined,
      onSale: current.onSale ? true : undefined,
      ...next,
      page: 1,
    });

    startTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  useEffect(() => {
    if (isFirstDebouncePass.current) {
      isFirstDebouncePass.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      const nextQ = searchValue.trim() || undefined;
      const nextMin = toFilterPrice(rangeMin, priceBounds.min, "min");
      const nextMax = toFilterPrice(rangeMax, priceBounds.max, "max");

      if (
        (nextQ ?? "") === (filters.q ?? "") &&
        nextMin === filters.minPrice &&
        nextMax === filters.maxPrice
      ) {
        return;
      }

      pushFilters({
        q: nextQ,
        minPrice: nextMin,
        maxPrice: nextMax,
      });
    }, TEXT_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce search/price only
  }, [searchValue, rangeMin, rangeMax]);

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-4 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-900">{labels.filters}</h2>
        {active ? (
          <AppLink
            href={clearCatalogFiltersHref(locale)}
            prefetchPolicy="intent"
            className="text-xs font-medium text-gray-600 underline-offset-2 hover:underline"
            scroll={false}
          >
            {labels.clearFilters}
          </AppLink>
        ) : null}
      </div>

      <div className="flex flex-col gap-5">
        <label className="block">
          <span className="text-sm font-medium text-gray-900">
            {labels.searchLabel}
          </span>
          <input
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={labels.searchPlaceholder}
            className={FIELD}
            autoComplete="off"
          />
        </label>

        <div>
          <span className="text-sm font-medium text-gray-900">
            {labels.categoryLabel}
          </span>
          <div className="mt-1">
            <SelectDropdown
              ariaLabel={labels.categoryLabel}
              value={categoryValue}
              allLabel={labels.allCategories}
              options={categories.map((category) => ({
                label: category.title,
                value: category.slug,
              }))}
              onValueChange={(next) => {
                setCategoryValue(next);
                pushFilters(
                  { category: next.trim() ? next : undefined },
                  {
                    searchValue,
                    rangeMin,
                    rangeMax,
                    categoryValue: next,
                    inStock,
                    onSale,
                  },
                );
              }}
              deferChange={false}
            />
          </div>
        </div>

        <CatalogPriceRange
          label={labels.priceLabel}
          currency={currency}
          bounds={priceBounds}
          minValue={rangeMin}
          maxValue={rangeMax}
          onRangeChange={(min, max) => {
            setRangeMin(min);
            setRangeMax(max);
          }}
        />

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-gray-900">
            {labels.availabilityLabel}
          </legend>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(event) => {
                const next = event.target.checked;
                setInStock(next);
                pushFilters(
                  { inStock: next ? true : undefined },
                  {
                    searchValue,
                    rangeMin,
                    rangeMax,
                    categoryValue,
                    inStock: next,
                    onSale,
                  },
                );
              }}
              className={CHECK}
            />
            {labels.inStockOnly}
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={onSale}
              onChange={(event) => {
                const next = event.target.checked;
                setOnSale(next);
                pushFilters(
                  { onSale: next ? true : undefined },
                  {
                    searchValue,
                    rangeMin,
                    rangeMax,
                    categoryValue,
                    inStock,
                    onSale: next,
                  },
                );
              }}
              className={CHECK}
            />
            {labels.onSaleOnly}
          </label>
        </fieldset>
      </div>
    </div>
  );
}
