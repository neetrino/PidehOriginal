"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";
import { catalogHref } from "@/features/products/application/catalog-search-params";
import type { CatalogFilters } from "@/features/products/schemas/catalog-list";
import {
  CATALOG_SORT_VALUES,
  type CatalogSort,
} from "@/features/products/schemas/catalog-list";

type ShopSortLabels = {
  sortAction: string;
  sortNewest: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortPopular: string;
};

type ShopSortButtonProps = {
  locale: string;
  filters: CatalogFilters;
  labels: ShopSortLabels;
};

function sortOptionLabel(sort: CatalogSort, labels: ShopSortLabels): string {
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

export function ShopSortButton({ locale, filters, labels }: ShopSortButtonProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const options = CATALOG_SORT_VALUES.map((value) => ({
    value,
    label: sortOptionLabel(value, labels),
  }));

  function navigateSort(next: string): void {
    startTransition(() => {
      router.push(
        catalogHref(locale, filters, { sort: next as CatalogSort, page: 1 }),
        { scroll: false },
      );
    });
  }

  return (
    <div className="relative w-max max-w-full shrink-0">
      <SelectDropdown
        ariaLabel={labels.sortAction}
        value={filters.sort}
        options={options}
        onValueChange={navigateSort}
        deferChange={false}
        trigger={
          <span className="inline-flex h-[53px] min-w-[162px] items-center justify-center gap-px rounded-[30px] bg-[#ff6900] px-3 py-1.5 text-sm font-bold text-white transition duration-200 hover:scale-[1.04] hover:brightness-105">
            <Image
              src={PIDEH_ASSETS.shopFilter}
              alt=""
              width={28}
              height={28}
              className="size-7 shrink-0"
            />
            {labels.sortAction}
          </span>
        }
      />
    </div>
  );
}
