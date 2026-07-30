import { X } from "lucide-react";

import { AppLink } from "@/components/ui/AppLink";
import { catalogHref } from "@/features/products/application/catalog-search-params";
import type { CatalogFilters } from "@/features/products/schemas/catalog-list";

export type CatalogChipLabels = {
  removeFilter: string;
  chipSearch: string;
  chipCategory: string;
  chipPrice: string;
  chipPriceMin: string;
  chipPriceMax: string;
  chipInStock: string;
  chipOnSale: string;
};

type CategoryOption = {
  slug: string;
  title: string;
};

type CatalogActiveChipsProps = {
  locale: string;
  filters: CatalogFilters;
  categories: CategoryOption[];
  labels: CatalogChipLabels;
};

export function CatalogActiveChips({
  locale,
  filters,
  categories,
  labels,
}: CatalogActiveChipsProps) {
  const chips: Array<{ key: string; label: string; href: string }> = [];

  if (filters.q) {
    chips.push({
      key: "q",
      label: labels.chipSearch.replace("{value}", filters.q),
      href: catalogHref(locale, filters, { q: undefined, page: 1 }),
    });
  }

  if (filters.category) {
    const title =
      categories.find((category) => category.slug === filters.category)
        ?.title ?? filters.category;
    chips.push({
      key: "category",
      label: labels.chipCategory.replace("{value}", title),
      href: catalogHref(locale, filters, { category: undefined, page: 1 }),
    });
  }

  if (filters.minPrice != null && filters.maxPrice != null) {
    chips.push({
      key: "price",
      label: labels.chipPrice
        .replace("{min}", String(filters.minPrice))
        .replace("{max}", String(filters.maxPrice)),
      href: catalogHref(locale, filters, {
        minPrice: undefined,
        maxPrice: undefined,
        page: 1,
      }),
    });
  } else if (filters.minPrice != null) {
    chips.push({
      key: "minPrice",
      label: labels.chipPriceMin.replace("{min}", String(filters.minPrice)),
      href: catalogHref(locale, filters, { minPrice: undefined, page: 1 }),
    });
  } else if (filters.maxPrice != null) {
    chips.push({
      key: "maxPrice",
      label: labels.chipPriceMax.replace("{max}", String(filters.maxPrice)),
      href: catalogHref(locale, filters, { maxPrice: undefined, page: 1 }),
    });
  }

  if (filters.inStock) {
    chips.push({
      key: "inStock",
      label: labels.chipInStock,
      href: catalogHref(locale, filters, { inStock: undefined, page: 1 }),
    });
  }

  if (filters.onSale) {
    chips.push({
      key: "onSale",
      label: labels.chipOnSale,
      href: catalogHref(locale, filters, { onSale: undefined, page: 1 }),
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <li key={chip.key}>
          <AppLink
            href={chip.href}
            prefetchPolicy="intent"
            scroll={false}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            aria-label={labels.removeFilter.replace("{label}", chip.label)}
          >
            {chip.label}
            <X className="size-3.5" aria-hidden />
          </AppLink>
        </li>
      ))}
    </ul>
  );
}
