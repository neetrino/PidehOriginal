'use client';

import { Search } from 'lucide-react';
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { Card } from '@/components/ui/Card';
import { SelectDropdown } from '@/components/ui/SelectDropdown';
import {
  GROUP_ORDER_PAYMENT_MODES,
  GROUP_ORDER_STATUSES,
} from '@/features/group-orders/domain/status';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

const FILTER_SEARCH =
  'h-11 w-full min-w-0 rounded-2xl border border-gray-200 bg-white py-0 pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-300';

type AdminGroupOrdersFiltersProps = {
  total: number;
  status?: string;
  paymentMode?: string;
  q?: string;
  copy: Dictionary['admin']['groupOrders'];
};

export function AdminGroupOrdersFilters({
  total,
  status,
  paymentMode,
  q,
  copy,
}: AdminGroupOrdersFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [statusValue, setStatusValue] = useState(status ?? '');
  const [modeValue, setModeValue] = useState(paymentMode ?? '');

  const f = copy.filters;

  const statusOptions = GROUP_ORDER_STATUSES.map((value) => ({
    label: value,
    value,
  }));

  const modeOptions = GROUP_ORDER_PAYMENT_MODES.map((value) => ({
    label: value,
    value,
  }));

  function applyStatus(next: string): void {
    flushSync(() => setStatusValue(next));
    formRef.current?.requestSubmit();
  }

  function applyMode(next: string): void {
    flushSync(() => setModeValue(next));
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <Card className="overflow-visible">
        <form ref={formRef} method="get" className="flex flex-nowrap items-center gap-3 p-4">
          <SelectDropdown
            name="status"
            ariaLabel={f.statusAria}
            value={statusValue}
            allLabel={f.allStatuses}
            options={statusOptions}
            className="w-[200px] shrink-0"
            onValueChange={applyStatus}
          />
          <SelectDropdown
            name="paymentMode"
            ariaLabel={f.modeAria}
            value={modeValue}
            allLabel={f.allModes}
            options={modeOptions}
            className="w-[220px] shrink-0"
            onValueChange={applyMode}
          />
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            />
            <input
              name="q"
              defaultValue={q ?? ''}
              placeholder={f.searchPlaceholder}
              className={FILTER_SEARCH}
              aria-label={f.searchAria}
            />
          </div>
        </form>
      </Card>
      <p className="mt-4 text-sm text-gray-600">
        {f.totalGroupOrders.replace('{total}', String(total))}
      </p>
    </>
  );
}
