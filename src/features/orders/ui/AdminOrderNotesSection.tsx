'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/Button';
import { ADMIN_TEXTAREA } from '@/features/admin/ui/admin-form-classes';
import { addOrderNoteAction } from '@/features/orders/application/add-order-note';
import type { AdminOrderNote } from '@/features/orders/application/admin-order-notes';
import { AdminOrderNotesList } from '@/features/orders/ui/AdminOrderNotesList';
import { ORDER_NOTE_MAX_LENGTH } from '@/features/orders/schemas/change-status';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type AdminOrderNotesSectionProps = {
  locale: Locale;
  orderNumber: string;
  notes: AdminOrderNote[];
  onNoteAdded: (note: AdminOrderNote) => void;
  copy: Dictionary['admin']['orders']['notes'];
};

/** Internal admin notes for an order: list plus add form (admin drawer only). */
export function AdminOrderNotesSection({
  locale,
  orderNumber,
  notes,
  onNoteAdded,
  copy,
}: AdminOrderNotesSectionProps) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const trimmed = draft.trim();

  return (
    <section className="rounded-2xl border border-gray-200 px-5 py-4">
      <h3 className="mb-1 text-base font-semibold text-gray-900">{copy.title}</h3>
      <p className="mb-4 text-sm text-gray-500">{copy.hint}</p>
      <form
        className="mb-4 flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!trimmed) return;
          setError(null);
          startTransition(async () => {
            const result = await addOrderNoteAction(locale, { orderNumber, note: trimmed });
            if (!result.ok) {
              setError(result.error.message);
              return;
            }
            setDraft('');
            onNoteAdded(result.value);
          });
        }}
      >
        <textarea
          aria-label={copy.note}
          rows={3}
          maxLength={ORDER_NOTE_MAX_LENGTH}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={copy.placeholder}
          className={ADMIN_TEXTAREA}
          disabled={isPending}
        />
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <Button type="submit" size="sm" className="w-fit" disabled={isPending || !trimmed}>
          {isPending ? copy.saving : copy.addNote}
        </Button>
      </form>
      <AdminOrderNotesList notes={notes} locale={locale} emptyLabel={copy.empty} />
    </section>
  );
}
