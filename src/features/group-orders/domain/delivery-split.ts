/**
 * Split delivery fee across participants who have at least one item.
 * Remainder goes to the organizer when the fee does not divide evenly.
 * Amounts are integer AMD (minor units = whole dram).
 */

export type DeliveryShareAllocation = {
  participantId: string;
  deliveryShareAmount: number;
};

export type SplitDeliveryInput = {
  deliveryAmount: number;
  /** Participants with ≥1 item, ordered with organizer last for remainder. */
  participantIdsWithItems: readonly string[];
  organizerParticipantId: string;
};

export type SplitDeliveryResult =
  | { ok: true; shares: DeliveryShareAllocation[] }
  | { ok: false; reason: "NEGATIVE" | "NOT_INTEGER" | "NO_PARTICIPANTS" };

/**
 * Divide `deliveryAmount` across participants who have items.
 * Base share = floor(total / n); remainder AMD added to the organizer's share.
 */
export function splitDeliveryFee(
  input: SplitDeliveryInput,
): SplitDeliveryResult {
  const { deliveryAmount, participantIdsWithItems, organizerParticipantId } =
    input;

  if (!Number.isInteger(deliveryAmount) || deliveryAmount < 0) {
    return {
      ok: false,
      reason: deliveryAmount < 0 ? "NEGATIVE" : "NOT_INTEGER",
    };
  }

  if (participantIdsWithItems.length === 0) {
    return { ok: false, reason: "NO_PARTICIPANTS" };
  }

  const count = participantIdsWithItems.length;
  const baseShare = Math.floor(deliveryAmount / count);
  const remainder = deliveryAmount - baseShare * count;

  const organizerInList = participantIdsWithItems.includes(
    organizerParticipantId,
  );
  const remainderTargetId = organizerInList
    ? organizerParticipantId
    : participantIdsWithItems[0]!;

  const shares: DeliveryShareAllocation[] = participantIdsWithItems.map(
    (participantId) => ({
      participantId,
      deliveryShareAmount:
        baseShare + (participantId === remainderTargetId ? remainder : 0),
    }),
  );

  return { ok: true, shares };
}

/** Organizer pays all — delivery share is entirely on the organizer. */
export function organizerPaysAllDeliveryShares(input: {
  deliveryAmount: number;
  organizerParticipantId: string;
  activeParticipantIds: readonly string[];
}): SplitDeliveryResult {
  if (!Number.isInteger(input.deliveryAmount) || input.deliveryAmount < 0) {
    return {
      ok: false,
      reason: input.deliveryAmount < 0 ? "NEGATIVE" : "NOT_INTEGER",
    };
  }

  return {
    ok: true,
    shares: input.activeParticipantIds.map((participantId) => ({
      participantId,
      deliveryShareAmount:
        participantId === input.organizerParticipantId
          ? input.deliveryAmount
          : 0,
    })),
  };
}
