import { describe, expect, it } from "vitest";

import {
  organizerPaysAllDeliveryShares,
  splitDeliveryFee,
} from "@/features/group-orders/domain/delivery-split";

describe("splitDeliveryFee", () => {
  it("splits evenly when divisible", () => {
    const result = splitDeliveryFee({
      deliveryAmount: 1600,
      participantIdsWithItems: ["a", "b", "c", "d"],
      organizerParticipantId: "a",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.shares.map((s) => s.deliveryShareAmount)).toEqual([
      400, 400, 400, 400,
    ]);
  });

  it("adds remainder to the organizer", () => {
    const result = splitDeliveryFee({
      deliveryAmount: 1000,
      participantIdsWithItems: ["p1", "p2", "org"],
      organizerParticipantId: "org",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.shares).toEqual([
      { participantId: "p1", deliveryShareAmount: 333 },
      { participantId: "p2", deliveryShareAmount: 333 },
      { participantId: "org", deliveryShareAmount: 334 },
    ]);
  });

  it("rejects empty participant list", () => {
    const result = splitDeliveryFee({
      deliveryAmount: 500,
      participantIdsWithItems: [],
      organizerParticipantId: "org",
    });
    expect(result).toEqual({ ok: false, reason: "NO_PARTICIPANTS" });
  });
});

describe("organizerPaysAllDeliveryShares", () => {
  it("assigns full delivery to organizer only", () => {
    const result = organizerPaysAllDeliveryShares({
      deliveryAmount: 1600,
      organizerParticipantId: "org",
      activeParticipantIds: ["org", "p1", "p2"],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.shares).toEqual([
      { participantId: "org", deliveryShareAmount: 1600 },
      { participantId: "p1", deliveryShareAmount: 0 },
      { participantId: "p2", deliveryShareAmount: 0 },
    ]);
  });
});
