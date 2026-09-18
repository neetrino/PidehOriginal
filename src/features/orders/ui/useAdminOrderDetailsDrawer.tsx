'use client';

import { useState, useTransition } from 'react';

import type { AdminOrderDetailView } from '@/features/orders/application/order-detail-view';
import { getAdminOrderDetailAction } from '@/features/orders/application/get-order-detail';
import { OrderDetailsDrawer } from '@/features/orders/ui/OrderDetailsDrawer';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

export type AdminOrderDetailsDrawerState = {
  open: boolean;
  detail: AdminOrderDetailView | null;
  error: string | null;
  isLoading: boolean;
  openOrder: (orderNumber: string) => void;
  closeDrawer: () => void;
};

/**
 * Shared admin order-details drawer state used by list pages and related admin surfaces.
 */
export function useAdminOrderDetailsDrawer(locale: string): AdminOrderDetailsDrawerState {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<AdminOrderDetailView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openOrder(orderNumber: string): void {
    setOpen(true);
    setDetail(null);
    setError(null);

    startTransition(async () => {
      const result = await getAdminOrderDetailAction(locale, orderNumber);
      if (!result.ok) {
        setError(result.error.message);
        setDetail(null);
        return;
      }
      setDetail(result.value);
    });
  }

  function closeDrawer(): void {
    setOpen(false);
    setDetail(null);
    setError(null);
  }

  return { open, detail, error, isLoading: isPending, openOrder, closeDrawer };
}

type AdminOrderDetailsDrawerBindProps = {
  state: AdminOrderDetailsDrawerState;
  copy: Dictionary['admin'];
};

export function AdminOrderDetailsDrawerBind({
  state,
  copy,
}: AdminOrderDetailsDrawerBindProps) {
  return (
    <OrderDetailsDrawer
      open={state.open}
      onClose={state.closeDrawer}
      detail={state.detail}
      error={state.error}
      isLoading={state.isLoading}
      copy={copy}
    />
  );
}
