import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { ADMIN_CARD } from '@/features/admin/ui/admin-form-classes';
import type { Locale } from '@/lib/i18n/config';
import type { Currency } from '@/lib/money/currency';

export function AdminUserLoyaltySectionShell({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className={`${ADMIN_CARD} p-5 sm:p-6`}>
      <header className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff6b00]/12 text-[#ff6b00]">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <h2 className="font-display text-lg uppercase leading-none text-[#1e1e1e] sm:text-xl">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

export function formatLoyaltyDateTime(date: Date | string, locale: Locale): string {
  const value = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'Asia/Yerevan',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(value);
}

export function toLoyaltyCurrency(value: string): Currency {
  if (value === 'USD' || value === 'RUB' || value === 'AMD') {
    return value;
  }
  return 'AMD';
}
