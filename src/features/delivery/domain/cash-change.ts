import { createId } from "@/lib/id";

export type CashChangeDenomination = {
  id: string;
  /** Whole AMD banknote amount the customer pays with. */
  amount: number;
  /** Object storage key for the banknote image; null when unset. */
  imageObjectKey: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type CashChangeDenominationView = {
  id: string;
  amount: number;
  imageUrl: string | null;
};

const DEFAULT_AMOUNTS = [10_000, 20_000, 50_000, 100_000] as const;

/** Default cash-change options offered at checkout for COD. */
export function createDefaultCashChangeDenominations(): CashChangeDenomination[] {
  return DEFAULT_AMOUNTS.map((amount, index) => ({
    id: `cash-change-${amount}`,
    amount,
    imageObjectKey: null,
    isActive: true,
    sortOrder: index,
  }));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseOne(raw: unknown, index: number): CashChangeDenomination | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const amountRaw = record.amount;
  const amount =
    typeof amountRaw === "number"
      ? amountRaw
      : typeof amountRaw === "string"
        ? Number(amountRaw)
        : NaN;
  if (!Number.isInteger(amount) || amount < 1 || amount > 100_000_000) {
    return null;
  }

  const id =
    typeof record.id === "string" && record.id.trim().length > 0
      ? record.id.trim().slice(0, 64)
      : createId();
  const imageObjectKey =
    typeof record.imageObjectKey === "string" &&
    record.imageObjectKey.trim().length > 0
      ? record.imageObjectKey.trim().slice(0, 500)
      : null;
  const sortOrder = isFiniteNumber(record.sortOrder)
    ? Math.max(0, Math.floor(record.sortOrder))
    : index;

  return {
    id,
    amount,
    imageObjectKey,
    isActive: record.isActive !== false,
    sortOrder,
  };
}

/** Parses cash-change denominations from `store.delivery` JSON. */
export function parseCashChangeDenominations(
  value: unknown,
): CashChangeDenomination[] {
  if (value == null) {
    return createDefaultCashChangeDenominations();
  }
  if (!Array.isArray(value)) {
    return createDefaultCashChangeDenominations();
  }
  if (value.length === 0) {
    return [];
  }

  const parsed = value
    .map((item, index) => parseOne(item, index))
    .filter((item): item is CashChangeDenomination => item != null)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.amount - b.amount);

  return parsed.length > 0 ? parsed : createDefaultCashChangeDenominations();
}

/** Active denominations customers may pick at checkout (sorted). */
export function listActiveCashChangeDenominations(
  denominations: CashChangeDenomination[],
): CashChangeDenomination[] {
  return denominations
    .filter((item) => item.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.amount - b.amount);
}

/** Finds an active denomination by amount, or null. */
export function findActiveCashChangeByAmount(
  denominations: CashChangeDenomination[],
  amount: number,
): CashChangeDenomination | null {
  return (
    listActiveCashChangeDenominations(denominations).find(
      (item) => item.amount === amount,
    ) ?? null
  );
}
