import { z } from "zod";

import { CHECKOUT_PAYMENT_METHODS } from "@/features/checkout/domain/payment-methods";

export const checkoutSchema = z
  .object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    contactEmail: z.string().trim().email().max(254),
    contactPhone: z.string().trim().min(5).max(40),
    shippingMethod: z.literal("delivery"),
    paymentMethod: z.enum(CHECKOUT_PAYMENT_METHODS),
    city: z.string().trim().max(80).optional(),
    line1: z.string().trim().max(300).optional(),
    line2: z.string().trim().max(160).optional(),
    floor: z.string().trim().max(20).optional(),
    intercomCode: z.string().trim().max(40).optional(),
    scheduledDeliveryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    scheduledDeliveryStart: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .optional(),
    scheduledDeliveryEnd: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .optional(),
    cashChangeAmount: z.coerce.number().int().min(1).max(100_000_000).optional(),
    region: z.string().trim().max(80).optional(),
    postalCode: z.string().trim().max(32).optional(),
    idempotencyKey: z.string().trim().min(8).max(128),
    locale: z.enum(["hy", "en", "ru"]),
    couponCode: z.string().trim().max(64).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.line1?.trim() || value.line1.trim().length < 3) {
      ctx.addIssue({
        code: "custom",
        path: ["line1"],
        message: "Address is required for delivery.",
      });
    }
    if (
      !value.scheduledDeliveryDate ||
      !value.scheduledDeliveryStart ||
      !value.scheduledDeliveryEnd
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduledDeliveryDate"],
        message: "Delivery date and time are required.",
      });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
