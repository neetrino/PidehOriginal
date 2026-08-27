import "server-only";

import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import { giftCardTransactions, giftCards, users } from "@/db/schema";
import {
  isGiftCardRedeemable,
  giftCardRedeemErrorMessage,
  normalizeGiftCardCode,
} from "@/features/gift-cards/domain/gift-card-rules";

export type GiftCardTransactionView = {
  id: string;
  type: "ISSUE" | "REDEEM" | "REVERSAL" | "ADJUST";
  delta: number;
  resultingBalance: number;
  orderId: string | null;
  note: string | null;
  createdAt: Date;
};

export type GiftCardListItem = {
  id: string;
  code: string;
  initialAmount: number;
  balanceAmount: number;
  status: "PENDING_PAYMENT" | "ACTIVE" | "USED" | "EXPIRED" | "DISABLED";
  purchaserName: string;
  purchaserEmail: string | null;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string | null;
  message: string | null;
  paymentMethod: string | null;
  scheduledSendAt: Date | null;
  sentAt: Date | null;
  activatedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
};

export type GiftCardDetail = GiftCardListItem & {
  purchaserUserId: string | null;
  recipientUserId: string | null;
  disabledReason: string | null;
  transactions: GiftCardTransactionView[];
};

const listColumns = {
  id: giftCards.id,
  code: giftCards.code,
  initialAmount: giftCards.initialAmount,
  balanceAmount: giftCards.balanceAmount,
  status: giftCards.status,
  purchaserName: giftCards.purchaserName,
  purchaserEmail: giftCards.purchaserEmail,
  recipientName: giftCards.recipientName,
  recipientEmail: giftCards.recipientEmail,
  recipientPhone: giftCards.recipientPhone,
  message: giftCards.message,
  paymentMethod: giftCards.paymentMethod,
  scheduledSendAt: giftCards.scheduledSendAt,
  sentAt: giftCards.sentAt,
  activatedAt: giftCards.activatedAt,
  expiresAt: giftCards.expiresAt,
  createdAt: giftCards.createdAt,
};

export async function findGiftCardByCode(
  rawCode: string,
): Promise<GiftCardListItem | null> {
  const code = normalizeGiftCardCode(rawCode);
  if (!code) {
    return null;
  }
  const [row] = await getDb()
    .select(listColumns)
    .from(giftCards)
    .where(eq(giftCards.code, code))
    .limit(1);
  return row ?? null;
}

export async function getGiftCardDetail(
  id: string,
): Promise<GiftCardDetail | null> {
  const [row] = await getDb()
    .select({
      ...listColumns,
      purchaserUserId: giftCards.purchaserUserId,
      recipientUserId: giftCards.recipientUserId,
      disabledReason: giftCards.disabledReason,
    })
    .from(giftCards)
    .where(eq(giftCards.id, id))
    .limit(1);
  if (!row) {
    return null;
  }

  const transactions = await getDb()
    .select({
      id: giftCardTransactions.id,
      type: giftCardTransactions.type,
      delta: giftCardTransactions.delta,
      resultingBalance: giftCardTransactions.resultingBalance,
      orderId: giftCardTransactions.orderId,
      note: giftCardTransactions.note,
      createdAt: giftCardTransactions.createdAt,
    })
    .from(giftCardTransactions)
    .where(eq(giftCardTransactions.giftCardId, id))
    .orderBy(desc(giftCardTransactions.createdAt));

  return { ...row, transactions };
}

export async function listCustomerGiftCards(
  userId: string,
  userEmail: string,
): Promise<GiftCardListItem[]> {
  const email = userEmail.trim().toLowerCase();
  return getDb()
    .select(listColumns)
    .from(giftCards)
    .where(
      or(
        eq(giftCards.purchaserUserId, userId),
        eq(giftCards.recipientUserId, userId),
        email ? eq(giftCards.recipientEmail, email) : sql`false`,
      ),
    )
    .orderBy(desc(giftCards.createdAt));
}

export type AdminGiftCardFilters = {
  q?: string;
  status?: GiftCardListItem["status"];
  limit?: number;
  offset?: number;
};

export async function listAdminGiftCards(
  filters: AdminGiftCardFilters = {},
): Promise<{ items: GiftCardListItem[]; total: number }> {
  const limit = Math.min(filters.limit ?? 50, 100);
  const offset = Math.max(filters.offset ?? 0, 0);
  const conditions = [];

  if (filters.status) {
    conditions.push(eq(giftCards.status, filters.status));
  }
  if (filters.q?.trim()) {
    const q = `%${filters.q.trim()}%`;
    conditions.push(
      or(
        ilike(giftCards.code, q),
        ilike(giftCards.purchaserName, q),
        ilike(giftCards.purchaserEmail, q),
        ilike(giftCards.recipientName, q),
        ilike(giftCards.recipientEmail, q),
      ),
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countRow] = await getDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(giftCards)
    .where(where);

  const items = await getDb()
    .select(listColumns)
    .from(giftCards)
    .where(where)
    .orderBy(desc(giftCards.createdAt))
    .limit(limit)
    .offset(offset);

  return { items, total: countRow?.count ?? 0 };
}

/** Preview helper for checkout — returns null when not redeemable. */
export async function getRedeemableGiftCardByCode(rawCode: string): Promise<{
  id: string;
  code: string;
  initialAmount: number;
  balanceAmount: number;
  expiresAt: Date | null;
} | null> {
  const evaluated = await evaluateGiftCardForRedeem(rawCode);
  return evaluated.ok ? evaluated.card : null;
}

export type EvaluateGiftCardForRedeemResult =
  | {
      ok: true;
      card: {
        id: string;
        code: string;
        initialAmount: number;
        balanceAmount: number;
        expiresAt: Date | null;
      };
    }
  | {
      ok: false;
      error: string;
    };

/** Resolves a gift card for redeem with a specific user-facing error. */
export async function evaluateGiftCardForRedeem(
  rawCode: string,
): Promise<EvaluateGiftCardForRedeemResult> {
  const card = await findGiftCardByCode(rawCode);
  if (!card) {
    return {
      ok: false,
      error: giftCardRedeemErrorMessage({ found: false }),
    };
  }

  if (
    !isGiftCardRedeemable({
      status: card.status,
      balanceAmount: card.balanceAmount,
      expiresAt: card.expiresAt,
    })
  ) {
    return {
      ok: false,
      error: giftCardRedeemErrorMessage({
        found: true,
        status: card.status,
        balanceAmount: card.balanceAmount,
        expiresAt: card.expiresAt,
      }),
    };
  }

  return {
    ok: true,
    card: {
      id: card.id,
      code: card.code,
      initialAmount: card.initialAmount,
      balanceAmount: card.balanceAmount,
      expiresAt: card.expiresAt,
    },
  };
}

export async function linkRecipientUserByEmail(
  giftCardId: string,
  email: string,
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return;
  }
  const [user] = await getDb()
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);
  if (!user) {
    return;
  }
  await getDb()
    .update(giftCards)
    .set({ recipientUserId: user.id, updatedAt: new Date() })
    .where(
      and(eq(giftCards.id, giftCardId), sql`${giftCards.recipientUserId} is null`),
    );
}
