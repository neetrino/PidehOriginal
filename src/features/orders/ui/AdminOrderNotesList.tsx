'use client';

import type { AdminOrderNote } from '@/features/orders/application/admin-order-notes';
import type { Locale } from '@/lib/i18n/config';

type AdminOrderNotesListProps = {
  notes: AdminOrderNote[];
  locale: Locale;
  emptyLabel: string;
  /** When set, each note shows its order number as a button that opens the order. */
  onOpenOrder?: (orderNumber: string) => void;
};

function formatNoteDateTime(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'Asia/Yerevan',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(value));
}

export function AdminOrderNotesList({
  notes,
  locale,
  emptyLabel,
  onOpenOrder,
}: AdminOrderNotesListProps) {
  if (notes.length === 0) {
    return <p className="text-sm text-[#1e1e1e]/50">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2">
      {notes.map((note) => (
        <li key={note.id} className="rounded-[18px] border border-[#1e1e1e]/10 bg-[#fff8e7]/60 p-3">
          <p className="text-sm whitespace-pre-wrap text-[#1e1e1e]">{note.note}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-[#1e1e1e]/60">
            {onOpenOrder ? (
              <button
                type="button"
                onClick={() => onOpenOrder(note.orderNumber)}
                className="font-bold text-[#ff6b00] hover:underline"
              >
                #{note.orderNumber}
              </button>
            ) : null}
            {note.authorName ? <span>{note.authorName}</span> : null}
            <span>{formatNoteDateTime(note.createdAt, locale)}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
