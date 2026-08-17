import { and, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { groupOrderParticipants, groupOrders } from "@/db/schema";
import {
  getGuestCartToken,
  hashGuestToken,
  peekGuestCartToken,
} from "@/features/cart/guest-token";
import { peekGroupOrderSession } from "@/features/group-orders/session";
import { getCurrentUser } from "@/lib/auth/session";

type GroupOrderRow = typeof groupOrders.$inferSelect;
type ParticipantRow = typeof groupOrderParticipants.$inferSelect;

export type AccessOk = {
  ok: true;
  groupOrder: GroupOrderRow;
  participant: ParticipantRow;
};

export type AccessErr = { ok: false; error: string };

async function loadGroupOrderByInvite(
  inviteToken: string,
): Promise<GroupOrderRow | null> {
  const [row] = await getDb()
    .select()
    .from(groupOrders)
    .where(eq(groupOrders.inviteToken, inviteToken))
    .limit(1);
  return row ?? null;
}

async function resolveCallerIdentity(): Promise<
  | { userId: string }
  | { guestTokenHash: string }
  | null
> {
  const user = await getCurrentUser();
  if (user) return { userId: user.id };

  const token = await peekGuestCartToken();
  if (!token) return null;
  return { guestTokenHash: hashGuestToken(token) };
}

async function findActiveParticipant(
  groupOrderId: string,
  identity: { userId: string } | { guestTokenHash: string },
): Promise<ParticipantRow | null> {
  const [row] = await getDb()
    .select()
    .from(groupOrderParticipants)
    .where(
      and(
        eq(groupOrderParticipants.groupOrderId, groupOrderId),
        eq(groupOrderParticipants.status, "ACTIVE"),
        "userId" in identity
          ? eq(groupOrderParticipants.userId, identity.userId)
          : eq(
              groupOrderParticipants.guestTokenHash,
              identity.guestTokenHash,
            ),
      ),
    )
    .limit(1);
  return row ?? null;
}

/**
 * Resolves the caller's participant for an invite token.
 * Prefers cookie participant id when it matches the invite session.
 */
export async function assertParticipantAccess(
  inviteToken: string,
): Promise<AccessOk | AccessErr> {
  const groupOrder = await loadGroupOrderByInvite(inviteToken);
  if (!groupOrder) return { ok: false, error: "Group order not found." };

  const session = await peekGroupOrderSession();
  if (session.inviteToken === inviteToken && session.participantId) {
    const [byCookie] = await getDb()
      .select()
      .from(groupOrderParticipants)
      .where(
        and(
          eq(groupOrderParticipants.id, session.participantId),
          eq(groupOrderParticipants.groupOrderId, groupOrder.id),
          eq(groupOrderParticipants.status, "ACTIVE"),
        ),
      )
      .limit(1);
    if (byCookie) {
      return { ok: true, groupOrder, participant: byCookie };
    }
  }

  let identity = await resolveCallerIdentity();
  if (!identity) {
    // Ensure guest token exists for write paths that need ownership.
    identity = { guestTokenHash: hashGuestToken(await getGuestCartToken()) };
  }

  const participant = await findActiveParticipant(groupOrder.id, identity);
  if (!participant) {
    return { ok: false, error: "Join the group order first." };
  }

  return { ok: true, groupOrder, participant };
}

export async function assertOrganizerAccess(
  inviteToken: string,
): Promise<AccessOk | AccessErr> {
  const access = await assertParticipantAccess(inviteToken);
  if (!access.ok) return access;
  if (access.participant.role !== "ORGANIZER") {
    return { ok: false, error: "Only the organizer can do this." };
  }
  return access;
}
