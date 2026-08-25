/**
 * Splits an order-level eligible bonus base across group participants
 * by merchandise share. Remainder AMD goes to the last share (organizer).
 */

export type ParticipantBonusShare = {
  userId: string;
  merchandiseAmount: number;
};

export type AllocatedBonusBase = {
  userId: string;
  eligibleAmount: number;
};

/**
 * Allocates `eligibleMerchandiseAmount` across registered participants.
 * Shares with `merchandiseAmount <= 0` are skipped.
 * Same `userId` rows are merged before allocation.
 */
export function allocateParticipantBonusBases(input: {
  eligibleMerchandiseAmount: number;
  shares: readonly ParticipantBonusShare[];
  /** Receives flooring remainder when present in the share list. */
  remainderUserId: string | null;
}): AllocatedBonusBase[] {
  const { eligibleMerchandiseAmount, remainderUserId } = input;
  if (
    !Number.isInteger(eligibleMerchandiseAmount) ||
    eligibleMerchandiseAmount <= 0
  ) {
    return [];
  }

  const merged = new Map<string, number>();
  for (const share of input.shares) {
    if (share.merchandiseAmount <= 0) continue;
    merged.set(
      share.userId,
      (merged.get(share.userId) ?? 0) + share.merchandiseAmount,
    );
  }

  if (merged.size === 0) {
    return [];
  }

  const totalMerch = [...merged.values()].reduce((sum, n) => sum + n, 0);
  if (totalMerch <= 0) {
    return [];
  }

  const orderedIds = [...merged.keys()];
  if (remainderUserId && orderedIds.includes(remainderUserId)) {
    const without = orderedIds.filter((id) => id !== remainderUserId);
    orderedIds.splice(0, orderedIds.length, ...without, remainderUserId);
  }

  let allocated = 0;
  const result: AllocatedBonusBase[] = [];
  for (let index = 0; index < orderedIds.length; index += 1) {
    const userId = orderedIds[index]!;
    const merchandiseAmount = merged.get(userId) ?? 0;
    const isLast = index === orderedIds.length - 1;
    const eligibleAmount = isLast
      ? eligibleMerchandiseAmount - allocated
      : Math.floor(
          (eligibleMerchandiseAmount * merchandiseAmount) / totalMerch,
        );
    allocated += eligibleAmount;
    if (eligibleAmount > 0) {
      result.push({ userId, eligibleAmount });
    }
  }

  return result;
}
