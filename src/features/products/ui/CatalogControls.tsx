"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { SideSheet } from "@/components/ui/SideSheet";
import type { CatalogPriceBounds } from "@/features/products/application/catalog-price-bounds";
import {
  catalogHref,
  hasActiveCatalogFilters,
} from "@/features/products/application/catalog-search-params";
import type { CatalogFilters } from "@/features/products/schemas/catalog-list";
import {
  CATALOG_SORT_VALUES,
  type CatalogSort,
} from "@/features/products/schemas/catalog-list";
import {
  CatalogActiveChips,
  type CatalogChipLabels,
} from "@/features/products/ui/CatalogActiveChips";
import {
  CatalogFilterForm,
  type CatalogFilterLabels,
} from "@/features/products/ui/CatalogFilterForm";
import type { Currency } from "@/lib/money/currency";

export type CatalogLabels = CatalogFilterLabels &
  CatalogChipLabels & {
    openFilters: string;
    sortLabel: string;
    sortNewest: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortPopular: string;
    resultsCount: string;
    resultsCountOne: string;
  };

type CategoryOption = {
  slug: string;
  title: string;
};

type CatalogControlsProps = {
  locale: string;
  currency: Currency;
  filters: CatalogFilters;
  categories: CategoryOption[];
  priceBounds: CatalogPriceBounds;
  total: number;
  labels: CatalogLabels;
  children: ReactNode;
};

function sortLabelFor(sort: CatalogSort, labels: CatalogLabels): string {
  switch (sort) {
    case "price_asc":
      return labels.sortPriceAsc;
    case "price_desc":
      return labels.sortPriceDesc;
    case "popular":
      return labels.sortPopular;
    case "newest":
    default:
      return labels.sortNewest;
  }
}

export function CatalogControls({
  locale,
  currency,
  filters,
  categories,
  priceBounds,
  total,
  labels,
  children,
}: CatalogControlsProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = hasActiveCatalogFilters(filters);

  const sortOptions = CATALOG_SORT_VALUES.map((value) => ({
    value,
    label: sortLabelFor(value, labels),
  }));

  const resultsLabel =
    total === 1
      ? labels.resultsCountOne
      : labels.resultsCount.replace("{count}", String(total));

  function pushHref(href: string): void {
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  function navigateSort(next: string): void {
    pushHref(
      catalogHref(locale, filters, {
        sort: next as CatalogSort,
        page: 1,
      }),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">{resultsLabel}</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            {labels.openFilters}
          </button>
          <div className="min-w-[12rem] flex-1 sm:flex-none">
            <SelectDropdown
              ariaLabel={labels.sortLabel}
              value={filters.sort}
              options={sortOptions}
              onValueChange={navigateSort}
              deferChange={false}
            />
          </div>
        </div>
      </div>

      <CatalogActiveChips
        locale={locale}
        filters={filters}
        categories={categories}
        labels={labels}
      />

      <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <CatalogFilterForm
              locale={locale}
              currency={currency}
              filters={filters}
              categories={categories}
              priceBounds={priceBounds}
              labels={labels}
              active={active}
            />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>

      <SideSheet
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ariaLabel={labels.filters}
        side="left"
        panelClassName="w-full max-w-sm"
      >
        <div className="flex h-full flex-col overflow-y-auto p-4">
          <CatalogFilterForm
            locale={locale}
            currency={currency}
            filters={filters}
            categories={categories}
            priceBounds={priceBounds}
            labels={labels}
            active={active}
          />
        </div>
      </SideSheet>
    </div>
  );
}
