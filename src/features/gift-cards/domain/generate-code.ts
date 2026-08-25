import { randomBytes } from "node:crypto";

import { GIFT_CARD_CODE_PREFIX } from "@/features/gift-cards/domain/gift-card-rules";

/** Crockford-ish alphabet without ambiguous I/L/O/0/1. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSegment(length: number): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i += 1) {
    const byte = bytes[i] ?? 0;
    out += CODE_ALPHABET[byte % CODE_ALPHABET.length] ?? "A";
  }
  return out;
}

/** Cryptographically random gift card code, e.g. PID-8F4D-2X91. */
export function generateGiftCardCode(): string {
  return `${GIFT_CARD_CODE_PREFIX}-${randomSegment(4)}-${randomSegment(4)}`;
}
