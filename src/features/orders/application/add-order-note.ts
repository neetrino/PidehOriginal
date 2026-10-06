'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { auditLogs, orderEvents, orders } from '@/db/schema';
import { withTransaction } from '@/db/transaction';
import type { AdminOrderNote } from '@/features/orders/application/admin-order-notes';
import {
  addOrderNoteSchema,
  type AddOrderNoteInput,
} from '@/features/orders/schemas/change-status';
import { requireAdmin } from '@/lib/auth/policies';
import type { SessionUser } from '@/lib/auth/session';
import { createId } from '@/lib/id';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { logger } from '@/lib/observability/logger';
import { err, ok, type Result } from '@/lib/result';

function actorDisplayName(actor: SessionUser): string {
  return `${actor.firstName} ${actor.lastName}`.trim() || actor.email;
}

/**
 * Adds an internal admin note to an order. The note is linked to the order's
 * customer through the order and is shown on their admin profile.
 */
export async function addOrderNoteAction(
  locale: string,
  raw: AddOrderNoteInput,
): Promise<Result<AdminOrderNote>> {
  if (!isLocale(locale)) {
    return err('INVALID_LOCALE', 'Invalid locale.');
  }

  const parsed = addOrderNoteSchema.safeParse(raw);
  if (!parsed.success) {
    return err('VALIDATION_ERROR', 'Invalid note payload.');
  }

  const actor = await requireAdmin(locale as Locale);

  try {
    const result = await withTransaction(async (tx) => {
      const [existing] = await tx
        .select({ id: orders.id, orderNumber: orders.orderNumber, userId: orders.userId })
        .from(orders)
        .where(eq(orders.orderNumber, parsed.data.orderNumber))
        .for('update')
        .limit(1);

      if (!existing) {
        throw new Error('NOT_FOUND');
      }

      const [event] = await tx
        .insert(orderEvents)
        .values({
          id: createId(),
          orderId: existing.id,
          eventType: 'NOTE',
          fromState: null,
          toState: null,
          actorUserId: actor.id,
          isCustomerVisible: false,
          payload: { note: parsed.data.note },
        })
        .returning({ id: orderEvents.id, createdAt: orderEvents.createdAt });

      if (!event) {
        throw new Error('NOTE_INSERT_FAILED');
      }

      await tx.insert(auditLogs).values({
        id: createId(),
        actorUserId: actor.id,
        action: 'order.add_note',
        targetType: 'order',
        targetId: existing.id,
        afterDiff: { noteLength: parsed.data.note.length },
        correlationId: createId(),
      });

      return { order: existing, event };
    });

    revalidatePath(`/${locale}/admin/orders/${result.order.orderNumber}`);
    if (result.order.userId) {
      revalidatePath(`/${locale}/admin/users/${result.order.userId}`);
    }

    return ok({
      id: result.event.id,
      orderNumber: result.order.orderNumber,
      note: parsed.data.note,
      authorName: actorDisplayName(actor),
      createdAt: result.event.createdAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return err('NOT_FOUND', 'Order not found.');
    }
    logger.error('order.add_note_failed', {
      orderNumber: parsed.data.orderNumber,
      error: error instanceof Error ? error.message : 'unknown',
    });
    return err('NOTE_FAILED', 'Unable to add note.');
  }
}
