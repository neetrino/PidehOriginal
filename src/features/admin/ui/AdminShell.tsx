'use client';

import type { ReactNode } from 'react';

import { AdminSidebar } from '@/features/admin/ui/AdminSidebar';
import { AdminSidebarCollapseProvider } from '@/features/admin/ui/AdminSidebarCollapseContext';
import {
  ADMIN_MAIN_COLUMN,
  ADMIN_MAIN_INNER,
  ADMIN_PAGE_SHELL,
} from '@/features/admin/ui/admin-shell-classes';
import { AdminOrderAlertsProvider } from '@/features/orders/ui/AdminOrderAlertsProvider';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type AdminShellProps = {
  locale: string;
  copy: Dictionary['admin'];
  children: ReactNode;
};

export function AdminShell({ locale, copy, children }: AdminShellProps) {
  return (
    <AdminSidebarCollapseProvider>
      <AdminOrderAlertsProvider locale={locale} copy={copy.orders.newOrderAlert}>
        <div className={ADMIN_PAGE_SHELL}>
          <AdminSidebar locale={locale} shell={copy.shell} nav={copy.nav} />
          <div className={ADMIN_MAIN_COLUMN}>
            <div className={ADMIN_MAIN_INNER}>{children}</div>
          </div>
        </div>
      </AdminOrderAlertsProvider>
    </AdminSidebarCollapseProvider>
  );
}
