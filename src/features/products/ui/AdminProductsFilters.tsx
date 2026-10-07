'use client';

import { useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';

import { SelectDropdown } from '@/components/ui/SelectDropdown';
import { ADMIN_LABEL } from '@/features/admin/ui/admin-form-classes';
import type { AdminCategoryOption } from '@/features/products/application/list-admin-products';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

const FILTER_INPUT =
  'h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-300';

type AdminProductsFiltersProps = {
  total: number;
  q?: string;
  categoryId?: string;
  status: 'all' | 'active' | 'inactive' | 'draft' | 'low_remaining';
  categories: AdminCategoryOption[];
  sort: string;
  dir: string;
  copy: Dictionary['admin']['products']['filters'];
  action?: ReactNode;
};

export function AdminProductsFilters({
  total,
  q,
  categoryId,
  status,
  categories,
  sort,
  dir,
  copy,
  action,
}: AdminProductsFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [categoryValue, setCategoryValue] = useState(categoryId ?? '');
  const [stopList, setStopList] = useState(status === 'draft');

  const categoryOptions = categories.map((category) => ({
    label: category.title,
    value: category.id,
  }));

  function applyCategory(next: string): void {
    flushSync(() => setCategoryValue(next));
    formRef.current?.requestSubmit();
  }

  function toggleStopList(): void {
    flushSync(() => setStopList((current) => !current));
    formRef.current?.requestSubmit();
  }

  return (
    <div className="mb-4">
      <form ref={formRef} method="get">
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="dir" value={dir} />
        <input type="hidden" name="status" value={stopList ? 'draft' : 'all'} />
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={stopList}
            aria-label={copy.statusDraft}
            onClick={toggleStopList}
            className="inline-flex items-center gap-3 text-sm font-semibold text-[#1e1e1e]"
          >
            <span
              className={`relative h-6 w-11 rounded-full transition-colors ${
                stopList ? 'bg-[#ff6b00]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  stopList ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </span>
            {copy.statusDraft}
          </button>
          {action ? <div className="w-full sm:w-auto">{action}</div> : null}
        </div>
        <p className="mb-3 text-sm text-gray-600">
          {copy.totalProducts.replace('{total}', String(total))}
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label>
          <span className={ADMIN_LABEL}>{copy.searchByTitleOrSlug}</span>
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder={copy.searchByTitleOrSlugPlaceholder}
            className={`${FILTER_INPUT} mt-1`}
            aria-label={copy.searchByTitleOrSlugAria}
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
        </div>
      </form>
    </div>
  );
}
