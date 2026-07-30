import {
  createDefaultCashChangeDenominations,
  parseCashChangeDenominations,
  type CashChangeDenomination,
} from "@/features/delivery/domain/cash-change";
import {
  DEFAULT_DELIVERY_SCHEDULE,
  parseDeliverySchedule,
  type DeliveryScheduleSettings,
} from "@/features/delivery/domain/delivery-schedule";

export type StoreDeliverySettings = {
  originAddress: string;
  originLat: number | null;
  originLng: number | null;
  /** Whole AMD charged per kilometer (fractional km kept in fee math). */
  pricePerKmAmount: number;
  isActive: boolean;
  schedule: DeliveryScheduleSettings;
  /** COD banknote options customers can select for change. */
  cashChangeDenominations: CashChangeDenomination[];
};

export const DEFAULT_DELIVERY_SETTINGS: StoreDeliverySettings = {
  originAddress: "",
  originLat: null,
  originLng: null,
  pricePerKmAmount: 0,
  isActive: false,
  schedule: structuredClone(DEFAULT_DELIVERY_SCHEDULE),
  cashChangeDenominations: createDefaultCashChangeDenominations(),
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Parses `store.delivery` JSON into a safe settings object. */
export function parseDeliverySettings(value: unknown): StoreDeliverySettings {
  if (!value || typeof value !== "object") {
    return structuredClone(DEFAULT_DELIVERY_SETTINGS);
  }

  const record = value as Record<string, unknown>;
  const originAddress =
    typeof record.originAddress === "string"
      ? record.originAddress.trim().slice(0, 300)
      : "";
  const priceRaw = record.pricePerKmAmount;
  const pricePerKmAmount =
    typeof priceRaw === "number"
      ? priceRaw
      : typeof priceRaw === "string"
        ? Number(priceRaw)
        : 0;
  const originLat = isFiniteNumber(record.originLat) ? record.originLat : null;
  const originLng = isFiniteNumber(record.originLng) ? record.originLng : null;

  return {
    originAddress,
    originLat,
    originLng,
    pricePerKmAmount:
      Number.isInteger(pricePerKmAmount) && pricePerKmAmount >= 0
        ? pricePerKmAmount
        : 0,
    isActive: record.isActive === true,
    schedule: parseDeliverySchedule(record.schedule),
    cashChangeDenominations: parseCashChangeDenominations(
      record.cashChangeDenominations,
    ),
  };
}

/** True when checkout can offer distance-based delivery. */
export function isDistanceDeliveryReady(
  settings: StoreDeliverySettings,
): boolean {
  return (
    settings.isActive &&
    settings.originAddress.trim().length > 0 &&
    settings.originLat != null &&
    settings.originLng != null &&
    settings.pricePerKmAmount >= 0
  );
}
