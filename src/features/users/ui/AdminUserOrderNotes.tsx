'use client';

import { StickyNote } from 'lucide-react';
import { useState } from 'react';

import type { AdminOrderNote } from '@/features/orders/application/admin-order-notes';
import { AdminOrderNotesList } from '@/features/orders/ui/AdminOrderNotesList';
import {
  AdminOrderDetailsDrawerBind,
  useAdminOrderDetailsDrawer,
} from '@/features/orders/ui/useAdminOrderDetailsDrawer';
import { AdminUserLoyaltySectionShell } from '@/features/users/ui/admin-user-loyalty-shared';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type AdminUserOrderNotesProps = {
  locale: Locale;
  notes: AdminOrderNote[];
  copy: Dictionary['admin'];
};

/** Internal order notes across all orders of a customer; each note opens its order. */
export function AdminUserOrderNotes({ locale, notes, copy }: AdminUserOrderNotesProps) {
  const [addedNotes, setAddedNotes] = useState<AdminOrderNote[]>([]);
  const drawer = useAdminOrderDetailsDrawer(locale, {
    onNoteAdded: (note) => setAddedNotes((current) => [note, ...current]),
  });
  const knownIds = new Set(notes.map((note) => note.id));
  const mergedNotes = [...addedNotes.filter((note) => !knownIds.has(note.id)), ...notes];

  return (
    <>
      <AdminUserLoyaltySectionShell title={copy.users.detail.orderNotesTitle} icon={StickyNote}>
        <AdminOrderNotesList
          notes={mergedNotes}
          locale={locale}
          emptyLabel={copy.users.detail.noOrderNotes}
          onOpenOrder={drawer.openOrder}
        />
      </AdminUserLoyaltySectionShell>
      <AdminOrderDetailsDrawerBind state={drawer} copy={copy} />
    </>
  );
}
