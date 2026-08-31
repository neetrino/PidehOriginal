import { and, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { groupOrderParticipants, groupOrders } from "@/db/schema";
import { peekGroupOrderSession } from "@/features/group-orders/session";

export type ActiveGroupOrderBannerData = {
  inviteToken: string;
  organizerDisplayName: string;
  isOrganizer: boolean;
};

export type ActiveGroupOrderSessionView =
  | { kind: "active"; banner: ActiveGroupOrderBannerData }
  | { kind: "cancelled"; inviteToken: string; organizerDisplayName: string }
  | { kind: "ended" }
  | { kind: "none" };

/**
 * Resolves the storefront group-order session for banner / cancelled alerts.
 * Terminal CANCELLED returns a notice so clients can alert and clear cookies.
 */
export async function resolveActiveGroupOrderSession(): Promise<ActiveGroupOrderSessionView> {
  const session = await peekGroupOrderSession();
  if (!session.inviteToken || !session.participantId) {
    return { kind: "none" };
  }

  const db = getDb();
  const [row] = await db
    .select({
      inviteToken: groupOrders.inviteToken,
      organizerDisplayName: groupOrders.organizerDisplayName,
      status: groupOrders.status,
      participantRole: groupOrderParticipants.role,
      participantStatus: groupOrderParticipants.status,
    })
    .from(groupOrders)
    .innerJoin(
      groupOrderParticipants,
      and(
        eq(groupOrderParticipants.groupOrderId, groupOrders.id),
        eq(groupOrderParticipants.id, session.participantId),
      ),
    )
    .where(eq(groupOrders.inviteToken, session.inviteToken))
    .limit(1);

  if (!row || row.participantStatus !== "ACTIVE") {
    return { kind: "ended" };
  }

  if (row.status === "CANCELLED") {
    return {
      kind: "cancelled",
      inviteToken: row.inviteToken,
      organizerDisplayName: row.organizerDisplayName,
    };
  }

  if (row.status === "EXPIRED" || row.status === "COMPLETED") {
    return { kind: "ended" };
  }

  return {
    kind: "active",
    banner: {
      inviteToken: row.inviteToken,
      organizerDisplayName: row.organizerDisplayName,
      isOrganizer: row.participantRole === "ORGANIZER",
    },
  };
}

/** Lightweight read for the storefront active-session banner. */
export async function getActiveGroupOrderBanner(): Promise<ActiveGroupOrderBannerData | null> {
  const resolved = await resolveActiveGroupOrderSession();
  return resolved.kind === "active" ? resolved.banner : null;
}
