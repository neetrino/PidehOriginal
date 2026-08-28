import type { ReactNode } from "react";

import { RevealOnView } from "@/components/motion/RevealOnView";
import { pillPop } from "@/components/motion/presets";
import {
  CatalogActiveChips,
  type CatalogChipLabels,
} from "@/features/products/ui/CatalogActiveChips";
import type { CatalogFilters } from "@/features/products/schemas/catalog-list";
import { ShopCategoryChips } from "@/features/products/ui/ShopCategoryChips";
import { ShopSortButton } from "@/features/products/ui/ShopSortButton";

export type CatalogLabels = CatalogChipLabels & {
  allChip: string;
  sortAction: string;
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
  filters: CatalogFilters;
  categories: CategoryOption[];
  total: number;
  labels: CatalogLabels;
  children: ReactNode;
};

export function CatalogControls({
  locale,
  filters,
  categories,
  total,
  labels,
  children,
}: CatalogControlsProps) {
  const resultsLabel =
    total === 1
      ? labels.resultsCountOne
      : labels.resultsCount.replace("{count}", String(total));

  return (
    <div className="flex flex-col gap-6">
      <p className="sr-only">{resultsLabel}</p>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <ShopCategoryChips
          locale={locale}
          filters={filters}
          categories={categories}
          allLabel={labels.allChip}
        />
        <RevealOnView variants={pillPop} delay={0.12} className="shrink-0">
          <ShopSortButton locale={locale} filters={filters} labels={labels} />
        </RevealOnView>
      </div>
      <CatalogActiveChips
        locale={locale}
        filters={filters}
        categories={categories}
        labels={labels}
        omitCategory
      />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
