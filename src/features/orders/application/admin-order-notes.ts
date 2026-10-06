import 'server-only';

import { and, desc, eq, type SQL } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { getDb } from '@/db/client';
import { orderEvents, orders, users } from '@/db/schema';

/** Internal admin note attached to an order (stored as a NOTE order event). */
export type AdminOrderNote = {
  id: string;
  orderNumber: string;
  note: string;
  authorName: string | null;
  createdAt: string;
};

/** Max notes shown on the admin user profile. */
export const USER_ORDER_NOTES_LIMIT = 50;

const noteAuthors = alias(users, 'note_authors');

type NoteRow = {
  id: string;
  orderNumber: string;
  payload: Record<string, unknown> | null;
  authorFirstName: string | null;
  authorLastName: string | null;
  authorEmail: string | null;
  createdAt: Date;
};

function readNoteText(payload: Record<string, unknown> | null): string {
  const value = payload?.note;
  return typeof value === 'string' ? value : '';
}

function toAdminOrderNote(row: NoteRow): AdminOrderNote {
  const fullName = `${row.authorFirstName ?? ''} ${row.authorLastName ?? ''}`.trim();
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    note: readNoteText(row.payload),
    authorName: fullName || row.authorEmail,
    createdAt: row.createdAt.toISOString(),
  };
}

async function listNotes(filter: SQL, limit?: number): Promise<AdminOrderNote[]> {
  const query = getDb()
    .select({
      id: orderEvents.id,
      orderNumber: orders.orderNumber,
      payload: orderEvents.payload,
      authorFirstName: noteAuthors.firstName,
      authorLastName: noteAuthors.lastName,
      authorEmail: noteAuthors.email,
      createdAt: orderEvents.createdAt,
    })
    .from(orderEvents)
    .innerJoin(orders, eq(orders.id, orderEvents.orderId))
    .leftJoin(noteAuthors, eq(noteAuthors.id, orderEvents.actorUserId))
    .where(and(eq(orderEvents.eventType, 'NOTE'), filter))
    .orderBy(desc(orderEvents.createdAt));

  const rows = limit ? await query.limit(limit) : await query;
  return rows.map(toAdminOrderNote);
}

/** Lists internal notes for a single order, newest first. */
export function listOrderNotesByOrderNumber(orderNumber: string): Promise<AdminOrderNote[]> {
  return listNotes(eq(orders.orderNumber, orderNumber));
}

/** Lists internal notes across all orders of a customer, newest first. */
export function listOrderNotesByUserId(userId: string): Promise<AdminOrderNote[]> {
  return listNotes(eq(orders.userId, userId), USER_ORDER_NOTES_LIMIT);
}
