import "server-only";

import { eq } from "drizzle-orm";

import { giftCards, users } from "@/db/schema";
import type { DbTransaction } from "@/db/transaction";
import { issueGiftCardBalance } from "@/features/gift-cards/application/gift-card-ledger";
import { sendGiftCardEmail } from "@/features/gift-cards/application/send-gift-card-email";
import { generateGiftCardCode } from "@/features/gift-cards/domain/generate-code";
import {
  normalizeGiftCardCode,
  resolveGiftCardExpiresAt,
  type GiftCardSettings,
} from "@/features/gift-cards/domain/gift-card-rules";
import { createId } from "@/lib/id";

const MAX_CODE_ATTEMPTS = 8;

async function allocateUniqueCode(tx: DbTransaction): Promise<string> {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const code = normalizeGiftCardCode(generateGiftCardCode());
    const [existing] = await tx
      .select({ id: giftCards.id })
      .from(giftCards)
      .where(eq(giftCards.code, code))
      .limit(1);
    if (!existing) {
      return code;
    }
  }
  throw new Error("GIFT_CARD_CODE_COLLISION");
}

async function resolveRecipientUserId(
  tx: DbTransaction,
  email: string,
): Promise<string | null> {
  const [user] = await tx
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);
  return user?.id ?? null;
}

export type CreateGiftCardRecordInput = {
  tx: DbTransaction;
  amount: number;
  purchaserName: string;
  purchaserEmail?: string | null;
  purchaserUserId?: string | null;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string | null;
  message?: string | null;
  paymentMethod?: string | null;
  scheduledSendAt?: Date | null;
  expiresAt?: Date | null;
  createdByUserId?: string | null;
  settings: GiftCardSettings;
  now?: Date;
};

/** Inserts a PENDING gift card with zero balance (issue on activate). */
export async function createGiftCardRecord(
  input: CreateGiftCardRecordInput,
): Promise<{ id: string; code: string }> {
  const now = input.now ?? new Date();
  const code = await allocateUniqueCode(input.tx);
  const id = createId();
  const recipientEmail = input.recipientEmail.trim().toLowerCase();
  const recipientUserId = await resolveRecipientUserId(input.tx, recipientEmail);
  const expiresAt =
    input.expiresAt ??
    resolveGiftCardExpiresAt(now, input.settings.defaultExpiryDays);

  await input.tx.insert(giftCards).values({
    id,
    code,
    initialAmount: input.amount,
    balanceAmount: 0,
    currency: "AMD",
    status: "PENDING_PAYMENT",
    purchaserUserId: input.purchaserUserId ?? null,
    recipientUserId,
    purchaserName: input.purchaserName.trim(),
    purchaserEmail: input.purchaserEmail?.trim().toLowerCase() ?? null,
    recipientName: input.recipientName.trim(),
    recipientEmail,
    recipientPhone: input.recipientPhone?.trim() || null,
    message: input.message?.trim() || null,
    paymentMethod: input.paymentMethod ?? null,
    scheduledSendAt: input.scheduledSendAt ?? null,
    expiresAt,
    createdByUserId: input.createdByUserId ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return { id, code };
}

export async function activateGiftCardRecord(input: {
  tx: DbTransaction;
  giftCardId: string;
  actorUserId?: string | null;
  correlationId?: string | null;
  sendEmail?: boolean;
  locale?: string;
  now?: Date;
}): Promise<{ code: string; sent: boolean }> {
  const now = input.now ?? new Date();
  const [card] = await input.tx
    .select()
    .from(giftCards)
    .where(eq(giftCards.id, input.giftCardId))
    .for("update")
    .limit(1);

  if (!card) {
    throw new Error("GIFT_CARD_NOT_FOUND");
  }
  if (card.status === "DISABLED" || card.status === "EXPIRED") {
    throw new Error("GIFT_CARD_NOT_ACTIVATABLE");
  }

  if (card.status === "PENDING_PAYMENT") {
    await issueGiftCardBalance({
      tx: input.tx,
      giftCardId: card.id,
      amount: card.initialAmount,
      actorUserId: input.actorUserId,
      correlationId: input.correlationId,
      now,
    });

    await input.tx
      .update(giftCards)
      .set({
        activatedAt: now,
        updatedAt: now,
      })
      .where(eq(giftCards.id, card.id));
  }

  const shouldSend =
    input.sendEmail !== false &&
    !card.sentAt &&
    (!card.scheduledSendAt || card.scheduledSendAt.getTime() <= now.getTime());

  if (!shouldSend) {
    return { code: card.code, sent: false };
  }

  await sendGiftCardEmail({
    to: card.recipientEmail,
    recipientName: card.recipientName,
    purchaserName: card.purchaserName,
    code: card.code,
    amount: card.initialAmount,
    message: card.message,
    expiresAt: card.expiresAt,
    locale: input.locale,
  });

  await input.tx
    .update(giftCards)
    .set({ sentAt: now, updatedAt: now })
    .where(eq(giftCards.id, card.id));

  return { code: card.code, sent: true };
}
