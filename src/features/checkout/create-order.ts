"use server";

import { createHash } from "node:crypto";

import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";

import { getProviders } from "@/config/providers";
import {
  cartItems,
  carts,
  orderEvents,
  orderItemModifiers,
  orderItems,
  orders,
  payments,
  products,
  promotions,
  stockMovements,
} from "@/db/schema";
import { withTransaction } from "@/db/transaction";
import {
  getCartWithItems,
  revalidateCartPaths,
} from "@/features/cart/cart";
import { cartLineUnitAmount } from "@/features/cart/domain/line-price";
import {
  checkoutSchema,
  type CheckoutInput,
} from "@/features/checkout/schemas";
import { toPaymentRecord } from "@/features/checkout/domain/payment-methods";
import {
  quoteDistanceDelivery,
  type DistanceDeliveryQuote,
} from "@/features/delivery/application/quote-distance-delivery";
import { getDeliverySettings } from "@/features/delivery/application/get-delivery-settings";
import {
  findActiveCashChangeByAmount,
  listActiveCashChangeDenominations,
} from "@/features/delivery/domain/cash-change";
import {
  formatDeliverySlotSnapshot,
  isDeliverySlotAvailable,
} from "@/features/delivery/domain/delivery-schedule";
import {
  ORDER_NUMBER_LOCK_KEY,
  formatOrderNumber,
  nextOrderSequence,
} from "@/features/orders/domain/order-number";
import {
  couponDiscountErrorMessage,
  evaluateCouponDiscount,
} from "@/features/promotions/domain/evaluate-coupon";
import { normalizePromotionCode } from "@/features/promotions/domain/promotion-rules";
import { resolveProductPrices } from "@/features/promotions/application/resolve-product-prices";
import { getCurrentUser } from "@/lib/auth/session";
import { getCheckoutRateSnapshot } from "@/lib/fx/service";
import { createId } from "@/lib/id";
import { convertAmount } from "@/lib/money/convert";
import { defaultCurrency } from "@/lib/money/currency";
import {
  CURRENCY_COOKIE_NAME,
  parseCurrencyCookie,
} from "@/lib/money/currency-cookie";

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export type CreateOrderResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: string };

/** Creates a COD order with server-side totals, stock decrement, and cart clear. */
export async function createOrderAction(
  raw: CheckoutInput,
): Promise<CreateOrderResult> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Invalid checkout data." };
  }

  const input = parsed.data;
  const user = await getCurrentUser();
  const { cart, items } = await getCartWithItems();
  const cookieStore = await cookies();
  const displayCurrency = parseCurrencyCookie(
    cookieStore.get(CURRENCY_COOKIE_NAME)?.value,
  );

  if (items.length === 0 || !cart) {
    return { ok: false, error: "Cart is empty." };
  }

  let rateSnapshot;
  try {
    rateSnapshot = await getCheckoutRateSnapshot(displayCurrency);
  } catch {
    return { ok: false, error: "Exchange rate unavailable. Try again shortly." };
  }

  let deliveryQuote: DistanceDeliveryQuote | null = null;
  let deliverySlotSnapshot: string | null = null;
  let cashChangeAmount: number | undefined;
  let cashChangeImageKey: string | undefined;
  const deliverySettings = await getDeliverySettings();

  if (input.shippingMethod === "delivery") {
    const quoted = await quoteDistanceDelivery(input.line1 ?? "");
    if (!quoted.ok) {
      return { ok: false, error: quoted.error };
    }
    deliveryQuote = quoted.quote;

    const selectedSlot = {
      date: input.scheduledDeliveryDate ?? "",
      startTime: input.scheduledDeliveryStart ?? "",
      endTime: input.scheduledDeliveryEnd ?? "",
    };
    if (!isDeliverySlotAvailable(deliverySettings.schedule, selectedSlot)) {
      return {
        ok: false,
        error: "Selected delivery time is no longer available.",
      };
    }
    deliverySlotSnapshot = formatDeliverySlotSnapshot(selectedSlot);
  }

  if (input.paymentMethod === "cash_on_delivery") {
    const activeCashChange = listActiveCashChangeDenominations(
      deliverySettings.cashChangeDenominations,
    );
    if (activeCashChange.length > 0) {
      if (input.cashChangeAmount == null) {
        return {
          ok: false,
          error: "Please select the banknote you will pay with.",
        };
      }
      const matched = findActiveCashChangeByAmount(
        deliverySettings.cashChangeDenominations,
        input.cashChangeAmount,
      );
      if (!matched) {
        return {
          ok: false,
          error: "Selected cash-change amount is no longer available.",
        };
      }
      cashChangeAmount = matched.amount;
      cashChangeImageKey = matched.imageObjectKey ?? undefined;
    }
  }

  const contactName = `${input.firstName} ${input.lastName}`.trim();
  const scopeHash = hashValue(user?.id ?? cart.guestTokenHash ?? cart.id);
  const keyHash = hashValue(input.idempotencyKey);
  const fingerprint = hashValue(
    JSON.stringify({
      cartId: cart.id,
      items: items.map(({ item, modifiers }) => ({
        productId: item.productId,
        quantity: item.quantity,
        selectionKey: item.selectionKey,
        modifierIds: modifiers.map((modifier) => modifier.id).sort(),
      })),
      email: input.contactEmail.toLowerCase(),
      shippingMethod: input.shippingMethod,
      paymentMethod: input.paymentMethod,
      line1: input.shippingMethod === "delivery" ? input.line1?.trim() : null,
      deliveryAmount: deliveryQuote?.deliveryAmount ?? 0,
      distanceMeters: deliveryQuote?.distanceMeters ?? null,
      scheduledDeliveryDate:
        input.shippingMethod === "delivery"
          ? input.scheduledDeliveryDate
          : null,
      scheduledDeliveryStart:
        input.shippingMethod === "delivery"
          ? input.scheduledDeliveryStart
          : null,
      cashChangeAmount: cashChangeAmount ?? null,
    }),
  );

  try {
    const orderNumber = await withTransaction(async (tx) => {
      const [existing] = await tx
        .select({ orderNumber: orders.orderNumber })
        .from(orders)
        .where(
          and(
            eq(orders.idempotencyScopeHash, scopeHash),
            eq(orders.idempotencyKeyHash, keyHash),
            eq(orders.requestFingerprint, fingerprint),
          ),
        )
        .limit(1);

      if (existing) {
        return existing.orderNumber;
      }

      const address = {
        recipientFirstName: input.firstName,
        recipientLastName: input.lastName,
        phone: input.contactPhone,
        countryCode:
          deliveryQuote?.countryCode?.trim().toUpperCase().slice(0, 2) || "AM",
        region: input.region,
        city:
          input.shippingMethod === "pickup"
            ? (input.city?.trim() || "Yerevan")
            : (deliveryQuote?.city?.trim() ||
              input.city?.trim() ||
              "Yerevan"),
        line1:
          input.shippingMethod === "pickup"
            ? (input.line1?.trim() || "Store pickup")
            : (deliveryQuote?.destinationFormattedAddress ||
              input.line1?.trim() ||
              ""),
        line2: input.line2,
        postalCode: input.postalCode,
        ...(input.shippingMethod === "delivery"
          ? {
              floor: input.floor?.trim() || undefined,
              intercomCode: input.intercomCode?.trim() || undefined,
              scheduledDeliveryDate: input.scheduledDeliveryDate,
              scheduledDeliveryStart: input.scheduledDeliveryStart,
              scheduledDeliveryEnd: input.scheduledDeliveryEnd,
              ...(cashChangeAmount != null
                ? {
                    cashChangeAmount,
                    cashChangeImageKey,
                  }
                : {}),
            }
          : {}),
      };

      let subtotal = 0;
      const lineSnapshots: Array<{
        productId: string;
        title: string;
        sku: string;
        quantity: number;
        unitAmount: number;
        unitDisplayAmount: number;
        compareAtAmount: number | null;
        lineDiscountAmount: number;
        lineTotal: number;
        modifiers: Array<{
          modifierId: string;
          kind: "ADDITION" | "EXCEPTION";
          name: string;
          unitPriceAmount: number;
        }>;
      }> = [];

      const qtyByProduct = new Map<string, number>();
      for (const { item, product } of items) {
        if (product.status !== "ACTIVE") {
          throw new Error("A product in the cart is unavailable.");
        }
        qtyByProduct.set(
          product.id,
          (qtyByProduct.get(product.id) ?? 0) + item.quantity,
        );
      }

      const lockedById = new Map<string, typeof products.$inferSelect>();
      for (const [productId, neededQty] of qtyByProduct) {
        const [locked] = await tx
          .select()
          .from(products)
          .where(eq(products.id, productId))
          .for("update")
          .limit(1);

        if (!locked || locked.stockOnHand < neededQty) {
          throw new Error("Insufficient stock for one or more items.");
        }
        lockedById.set(productId, locked);
      }

      const pricedUnits = await resolveProductPrices(
        [...lockedById.values()].map((product) => ({
          id: product.id,
          priceAmount: product.priceAmount,
          compareAtAmount: product.compareAtAmount,
        })),
      );

      const remainingStock = new Map(
        [...lockedById.entries()].map(([id, product]) => [
          id,
          product.stockOnHand,
        ]),
      );

      for (const { item, product, modifiers } of items) {
        const locked = lockedById.get(product.id);
        if (!locked) {
          throw new Error("A product in the cart is unavailable.");
        }

        const resolved = pricedUnits.get(locked.id);
        const baseUnit = resolved?.unitAmount ?? locked.priceAmount;
        const unitAmount = cartLineUnitAmount(baseUnit, modifiers);
        const compareAtAmount = resolved?.compareAtAmount ?? null;
        const lineDiscountAmount = Math.max(
          0,
          (resolved?.listAmount ?? locked.priceAmount) - baseUnit,
        );
        const lineTotal = unitAmount * item.quantity;
        const unitDisplayAmount = Number(
          convertAmount(
            unitAmount,
            rateSnapshot.rate,
            defaultCurrency,
            displayCurrency,
          ).amount,
        );
        subtotal += lineTotal;

        const nextStock =
          (remainingStock.get(locked.id) ?? locked.stockOnHand) - item.quantity;
        remainingStock.set(locked.id, nextStock);

        lineSnapshots.push({
          productId: locked.id,
          title:
            locked.translations.en?.title ??
            locked.translations.hy?.title ??
            locked.sku,
          sku: locked.sku,
          quantity: item.quantity,
          unitAmount,
          unitDisplayAmount,
          compareAtAmount,
          lineDiscountAmount,
          lineTotal,
          modifiers: modifiers.map((modifier) => ({
            modifierId: modifier.id,
            kind: modifier.kind,
            name: modifier.name,
            unitPriceAmount:
              modifier.kind === "ADDITION" ? modifier.priceAmount : 0,
          })),
        });
      }

      const stockAfterOrder = remainingStock;

      const deliveryAmount =
        input.shippingMethod === "pickup"
          ? 0
          : (deliveryQuote?.deliveryAmount ?? 0);

      let discountAmount = 0;
      let appliedPromotion: typeof promotions.$inferSelect | null = null;
      if (input.couponCode) {
        const code = normalizePromotionCode(input.couponCode);
        const [coupon] = await tx
          .select()
          .from(promotions)
          .where(
            and(eq(promotions.kind, "COUPON"), eq(promotions.code, code)),
          )
          .for("update")
          .limit(1);

        const nowCheck = new Date();
        const evaluated = evaluateCouponDiscount(coupon, subtotal, nowCheck);
        if (!evaluated.ok || !coupon) {
          throw new Error(
            couponDiscountErrorMessage(
              evaluated.ok ? "INVALID_OR_INACTIVE" : evaluated.error,
            ),
          );
        }

        discountAmount = evaluated.discountAmount;
        appliedPromotion = coupon;

        await tx
          .update(promotions)
          .set({
            usedCount: sql`${promotions.usedCount} + 1`,
            updatedAt: nowCheck,
          })
          .where(eq(promotions.id, coupon.id));
      }

      const totalAmount = Math.max(0, subtotal - discountAmount) + deliveryAmount;
      const orderId = createId();
      await tx.execute(
        sql`select pg_advisory_xact_lock(${ORDER_NUMBER_LOCK_KEY})`,
      );
      const [maxRow] = await tx
        .select({
          maxSeq: sql<number | null>`max(cast(substring(${orders.orderNumber} from 2) as integer))`,
        })
        .from(orders)
        .where(sql`${orders.orderNumber} ~ '^p[0-9]+$'`);
      const number = formatOrderNumber(nextOrderSequence(maxRow?.maxSeq ?? null));
      const now = new Date();

      await tx.insert(orders).values({
        id: orderId,
        orderNumber: number,
        userId: user?.id,
        contactEmail: input.contactEmail.toLowerCase(),
        contactPhone: input.contactPhone,
        contactName,
        status: "PENDING",
        paymentStatus: "PENDING",
        baseCurrency: defaultCurrency,
        displayCurrency,
        exchangeRate: rateSnapshot.rate,
        exchangeRateSource: rateSnapshot.source,
        exchangeRateAsOf: rateSnapshot.asOf,
        subtotalAmount: subtotal,
        discountAmount,
        taxAmount: 0,
        deliveryAmount,
        totalAmount,
        shippingAddress: address,
        billingAddress: address,
        promotionId: appliedPromotion?.id,
        promotionCodeSnapshot: appliedPromotion?.code ?? null,
        promotionTypeSnapshot: appliedPromotion?.discountType ?? null,
        promotionValueSnapshot: appliedPromotion?.discountValue ?? null,
        promotionDiscountAmount: appliedPromotion ? discountAmount : null,
        deliveryRuleId: null,
        deliveryLabelSnapshot:
          input.shippingMethod === "pickup"
            ? "Store pickup"
            : deliveryQuote
              ? `Distance delivery (${deliveryQuote.distanceLabel})`
              : "Delivery",
        deliveryEstimateSnapshot:
          input.shippingMethod === "pickup"
            ? null
            : [
                deliveryQuote
                  ? `${deliveryQuote.pricePerKmAmount} AMD/km × ${deliveryQuote.distanceLabel}`
                  : null,
                deliverySlotSnapshot,
              ]
                .filter(Boolean)
                .join(" · ") || null,
        idempotencyScopeHash: scopeHash,
        idempotencyKeyHash: keyHash,
        requestFingerprint: fingerprint,
        locale: input.locale,
        placedAt: now,
      });

      for (const line of lineSnapshots) {
        const orderItemId = createId();
        await tx.insert(orderItems).values({
          id: orderItemId,
          orderId,
          productId: line.productId,
          productTitleSnapshot: line.title,
          productSkuSnapshot: line.sku,
          quantity: line.quantity,
          unitBaseAmount: line.unitAmount,
          unitDisplayAmount: line.unitDisplayAmount,
          compareAtAmount: line.compareAtAmount,
          discountAmount: line.lineDiscountAmount * line.quantity,
          lineTotalAmount: line.lineTotal,
          currency: defaultCurrency,
        });

        if (line.modifiers.length > 0) {
          await tx.insert(orderItemModifiers).values(
            line.modifiers.map((modifier) => ({
              id: createId(),
              orderItemId,
              modifierId: modifier.modifierId,
              kind: modifier.kind,
              nameSnapshot: modifier.name,
              unitPriceAmount: modifier.unitPriceAmount,
            })),
          );
        }
      }

      for (const [productId, nextStock] of stockAfterOrder) {
        await tx
          .update(products)
          .set({
            stockOnHand: nextStock,
            version: sql`${products.version} + 1`,
            updatedAt: now,
          })
          .where(eq(products.id, productId));

        const orderedQty =
          (qtyByProduct.get(productId) ?? 0);
        await tx.insert(stockMovements).values({
          id: createId(),
          productId,
          delta: -orderedQty,
          reason: "ORDER",
          orderId,
          resultingBalance: nextStock,
          correlationId: number,
        });
      }

      const payment = await getProviders().payment.createPayment({
        orderId,
        amount: BigInt(totalAmount),
        currency: defaultCurrency,
        idempotencyKey: input.idempotencyKey,
      });
      const paymentRecord = toPaymentRecord(input.paymentMethod);

      await tx.insert(payments).values({
        id: createId(),
        orderId,
        provider: paymentRecord.provider,
        method: paymentRecord.method,
        providerReference: payment.providerReference,
        amount: totalAmount,
        currency: defaultCurrency,
        status: "PENDING",
        attemptNumber: 1,
      });

      await tx.insert(orderEvents).values({
        id: createId(),
        orderId,
        eventType: "STATUS_CHANGE",
        fromState: null,
        toState: "PENDING",
        actorUserId: user?.id,
        isCustomerVisible: true,
        payload: { source: "checkout" },
      });

      await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));
      await tx
        .update(carts)
        .set({ status: "CONVERTED", updatedAt: now })
        .where(eq(carts.id, cart.id));

      return number;
    });

    await revalidateCartPaths();
    return { ok: true, orderNumber };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to place order.";
    return { ok: false, error: message };
  }
}
