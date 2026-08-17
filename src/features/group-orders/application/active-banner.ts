import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { groupOrders } from "@/db/schema";
import { peekGroupOrderSession } from "@/features/group-orders/session";

export type ActiveGroupOrderBannerData = {
  inviteToken: string;
  organizerDisplayName: string;
};

/** Lightweight read for the storefront active-session banner. */
export async function getActiveGroupOrderBanner(): Promise<ActiveGroupOrderBannerData | null> {
  const session = await peekGroupOrderSession();
  if (!session.inviteToken || !session.participantId) return null;

  const [row] = await getDb()
    .select({
      inviteToken: groupOrders.inviteToken,
      organizerDisplayName: groupOrders.organizerDisplayName,
      status: groupOrders.status,
    })
    .from(groupOrders)
    .where(eq(groupOrders.inviteToken, session.inviteToken))
    .limit(1);

  if (!row) return null;
  if (
    row.status === "CANCELLED" ||
    row.status === "EXPIRED" ||
    row.status === "COMPLETED"
  ) {
    return null;
  }

  return {
    inviteToken: row.inviteToken,
    organizerDisplayName: row.organizerDisplayName,
  };
}
