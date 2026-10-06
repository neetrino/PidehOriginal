'use client';

import { useState, useTransition } from 'react';

import { markOrderAdminSeenAction } from '@/features/orders/application/admin-order-alerts';
import type { AdminOrderNote } from '@/features/orders/application/admin-order-notes';
import type { AdminOrderDetailView } from '@/features/orders/application/order-detail-view';
import { getAdminOrderDetailAction } from '@/features/orders/application/get-order-detail';
import { getAdminOrderNotesAction } from '@/features/orders/application/get-order-notes';
import { AdminOrderNotesSection } from '@/features/orders/ui/AdminOrderNotesSection';
import { OrderDetailsDrawer } from '@/features/orders/ui/OrderDetailsDrawer';
import { useAdminOrderAlertsOptional } from '@/features/orders/ui/AdminOrderAlertsProvider';
import { isLocale, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

export type AdminOrderDetailsDrawerState = {
  open: boolean;
  locale: Locale;
  detail: AdminOrderDetailView | null;
  notes: AdminOrderNote[];
  error: string | null;
  isLoading: boolean;
  openOrder: (orderNumber: string) => void;
  closeDrawer: () => void;
  addNote: (note: AdminOrderNote) => void;
};

/**
 * Shared admin order-details drawer state used by list pages and related admin surfaces.
 * Opening an order marks it as seen (clears "new" badge/filter) and loads internal notes.
 */
export function useAdminOrderDetailsDrawer(
  locale: string,
  options: { onNoteAdded?: (note: AdminOrderNote) => void } = {},
): AdminOrderDetailsDrawerState {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<AdminOrderDetailView | null>(null);
  const [notes, setNotes] = useState<AdminOrderNote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const alerts = useAdminOrderAlertsOptional();

  function openOrder(orderNumber: string): void {
    setOpen(true);
    setDetail(null);
    setNotes([]);
    setError(null);

    startTransition(async () => {
      const [detailResult, notesResult] = await Promise.all([
        getAdminOrderDetailAction(locale, orderNumber),
        getAdminOrderNotesAction(locale, orderNumber),
      ]);
      if (!detailResult.ok) {
        setError(detailResult.error.message);
        return;
      }
      if (!notesResult.ok) {
        setError(notesResult.error.message);
        return;
      }

      setDetail(detailResult.value);
      setNotes(notesResult.value);
      await markOrderAdminSeenAction(locale, orderNumber);
      alerts?.notifyOrderOpened(orderNumber);
    });
  }

  function closeDrawer(): void {
    setOpen(false);
    setDetail(null);
    setNotes([]);
    setError(null);
  }

  function addNote(note: AdminOrderNote): void {
    setNotes((current) => [note, ...current]);
    options.onNoteAdded?.(note);
  }

  return {
    open,
    locale: isLocale(locale) ? locale : 'hy',
    detail,
    notes,
    error,
    isLoading: isPending,
    openOrder,
    closeDrawer,
    addNote,
  };
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
      adminNotesSlot={
        state.detail ? (
          <AdminOrderNotesSection
            key={state.detail.orderNumber}
            locale={state.locale}
            orderNumber={state.detail.orderNumber}
            notes={state.notes}
            onNoteAdded={state.addNote}
            copy={copy.orders.notes}
          />
        ) : null
      }
    />
  );
}
