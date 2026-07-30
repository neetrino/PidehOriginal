"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { ADMIN_LABEL } from "@/features/admin/ui/admin-form-classes";
import type { AdminCategoryOption } from "@/features/products/application/list-admin-products";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const FILTER_INPUT =
  "h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-300";

type AdminProductsFiltersProps = {
  total: number;
  q?: string;
  sku?: string;
  categoryId?: string;
  stock: "all" | "in_stock" | "out_of_stock" | "low_stock";
  categories: AdminCategoryOption[];
  sort: string;
  dir: string;
  copy: Dictionary["admin"]["products"]["filters"];
};

export function AdminProductsFilters({
  total,
  q,
  sku,
  categoryId,
  stock,
  categories,
  sort,
  dir,
  copy,
}: AdminProductsFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [categoryValue, setCategoryValue] = useState(categoryId ?? "");
  const [stockValue, setStockValue] = useState(stock);

  const categoryOptions = categories.map((category) => ({
    label: category.title,
    value: category.id,
  }));

  const stockOptions = [
    { label: copy.allProducts, value: "all" as const },
    { label: copy.inStock, value: "in_stock" as const },
    { label: copy.outOfStock, value: "out_of_stock" as const },
    { label: copy.lowStock, value: "low_stock" as const },
  ];

  function applyCategory(next: string): void {
    flushSync(() => setCategoryValue(next));
    formRef.current?.requestSubmit();
  }

  function applyStock(next: string): void {
    flushSync(() =>
      setStockValue(next as AdminProductsFiltersProps["stock"]),
    );
    formRef.current?.requestSubmit();
  }

  return (
    <div className="mb-4">
      <p className="mb-3 text-sm text-gray-600">
        {copy.totalProducts.replace("{total}", String(total))}
      </p>
      <form
        ref={formRef}
        method="get"
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="dir" value={dir} />
        <label>
          <span className={ADMIN_LABEL}>{copy.searchByTitleOrSlug}</span>
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder={copy.searchByTitleOrSlugPlaceholder}
            className={`${FILTER_INPUT} mt-1`}
            aria-label={copy.searchByTitleOrSlugAria}
          />
        </label>
        <label>
          <span className={ADMIN_LABEL}>{copy.searchBySku}</span>
          <input
            name="sku"
            defaultValue={sku ?? ""}
            placeholder={copy.searchBySkuPlaceholder}
            className={`${FILTER_INPUT} mt-1`}
            aria-label={copy.searchBySkuAria}
          />
        </label>
        <div>
          <span className={ADMIN_LABEL}>{copy.filterByCategory}</span>
          <SelectDropdown
            name="categoryId"
            ariaLabel={copy.filterByCategoryAria}
            value={categoryValue}
            allLabel={copy.allCategories}
            options={categoryOptions}
            className="mt-1"
            onValueChange={applyCategory}
          />
        </div>
        <div>
          <span className={ADMIN_LABEL}>{copy.filterByStock}</span>
          <SelectDropdown
            name="stock"
            ariaLabel={copy.filterByStockAria}
            value={stockValue}
            options={stockOptions}
            className="mt-1"
            onValueChange={applyStock}
          />
        </div>
      </form>
    </div>
  );
}
