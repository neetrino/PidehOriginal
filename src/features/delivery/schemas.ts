import { z } from "zod";

/** Normalizes `HH:mm` / `HH:mm:ss` from `<input type="time">` to `HH:mm`. */
function normalizeTimeHHmm(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const match = value
    .trim()
    .match(/^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d(?:\.\d+)?)?$/);
  if (!match) return value;
  return `${match[1]}:${match[2]}`;
}

const timeHHmm = z.preprocess(
  normalizeTimeHHmm,
  z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time"),
);

const dayHoursSchema = z
  .object({
    isOpen: z.boolean(),
    openTime: timeHHmm,
    closeTime: timeHHmm,
  })
  .superRefine((value, ctx) => {
    if (!value.isOpen) return;
    const openMinutes = (() => {
      const [hours, minutes] = value.openTime.split(":");
      return Number(hours) * 60 + Number(minutes);
    })();
    const closeMinutes = (() => {
      const [hours, minutes] = value.closeTime.split(":");
      return Number(hours) * 60 + Number(minutes);
    })();
    if (closeMinutes <= openMinutes) {
      ctx.addIssue({
        code: "custom",
        path: ["closeTime"],
        message: "Close time must be after open time.",
      });
    }
  });

const deliveryScheduleSchema = z.object({
  slotMinutes: z.coerce.number().int().min(15).max(240),
  maxDaysAhead: z.coerce.number().int().min(1).max(60),
  weekly: z.object({
    1: dayHoursSchema,
    2: dayHoursSchema,
    3: dayHoursSchema,
    4: dayHoursSchema,
    5: dayHoursSchema,
    6: dayHoursSchema,
    7: dayHoursSchema,
  }),
  closedDates: z
    .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .max(366)
    .transform((dates) => [...new Set(dates)].sort()),
});

const cashChangeDenominationSchema = z.object({
  id: z.string().trim().min(1).max(64),
  amount: z.coerce.number().int().min(1).max(100_000_000),
  imageObjectKey: z.preprocess((value) => {
    if (value === "" || value == null) return null;
    return value;
  }, z.string().trim().min(1).max(500).nullable()),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(1000),
});

export const deliverySettingsSchema = z
  .object({
    originAddress: z.string().trim().min(3).max(300),
    pricePerKmAmount: z.coerce.number().int().min(0).max(10_000_000),
    isActive: z.boolean(),
    schedule: deliveryScheduleSchema,
    cashChangeDenominations: z
      .array(cashChangeDenominationSchema)
      .max(20)
      .default([]),
  })
  .superRefine((value, ctx) => {
    const amounts = new Set<number>();
    for (const [index, item] of value.cashChangeDenominations.entries()) {
      if (amounts.has(item.amount)) {
        ctx.addIssue({
          code: "custom",
          path: ["cashChangeDenominations", index, "amount"],
          message: "Duplicate cash-change amount.",
        });
      }
      amounts.add(item.amount);
    }
  });

export type DeliverySettingsInput = z.infer<typeof deliverySettingsSchema>;

export const quoteDistanceDeliverySchema = z.object({
  line1: z.string().trim().min(3).max(300),
});

export type QuoteDistanceDeliveryInput = z.infer<
  typeof quoteDistanceDeliverySchema
>;

/** @deprecated City-based rules; kept for historical order FK rows. */
export const deliveryLocationSchema = z.object({
  country: z.string().trim().min(1).max(80),
  city: z.string().trim().min(1).max(80),
  priceAmount: z.coerce.number().int().min(0).max(10_000_000),
  freeThresholdAmount: z.preprocess((value) => {
    if (value === "" || value == null) return null;
    return value;
  }, z.coerce.number().int().min(0).max(100_000_000).nullable()),
});

export type DeliveryLocationInput = z.infer<typeof deliveryLocationSchema>;
