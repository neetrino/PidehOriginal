import { describe, expect, it } from "vitest";

import { allocateParticipantBonusBases } from "@/features/bonuses/domain/group-bonus-allocation";

describe("allocateParticipantBonusBases", () => {
  it("splits 30_000 eligible 1:2 by merchandise with remainder to organizer", () => {
    const result = allocateParticipantBonusBases({
      eligibleMerchandiseAmount: 30_000,
      remainderUserId: "org",
      shares: [
        { userId: "a", merchandiseAmount: 20_000 },
        { userId: "b", merchandiseAmount: 10_000 },
        { userId: "org", merchandiseAmount: 0 },
      ],
    });
    // org has 0 merchandise → skipped; a gets floor, b gets remainder as last
    expect(result).toEqual([
      { userId: "a", eligibleAmount: 20_000 },
      { userId: "b", eligibleAmount: 10_000 },
    ]);
  });

  it("gives flooring remainder to organizer when organizer has items", () => {
    const result = allocateParticipantBonusBases({
      eligibleMerchandiseAmount: 1000,
      remainderUserId: "org",
      shares: [
        { userId: "p1", merchandiseAmount: 333 },
        { userId: "p2", merchandiseAmount: 333 },
        { userId: "org", merchandiseAmount: 334 },
      ],
    });
    expect(result).toEqual([
      { userId: "p1", eligibleAmount: 333 },
      { userId: "p2", eligibleAmount: 333 },
      { userId: "org", eligibleAmount: 334 },
    ]);
  });

  it("returns empty when no registered merchandise shares", () => {
    expect(
      allocateParticipantBonusBases({
        eligibleMerchandiseAmount: 5000,
        remainderUserId: "org",
        shares: [{ userId: "org", merchandiseAmount: 0 }],
      }),
    ).toEqual([]);
  });
});
