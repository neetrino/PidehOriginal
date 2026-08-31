"use server";

import { z } from "zod";

import { getCartWithItems } from "@/features/cart/cart";
import { cartLineUnitAmount } from "@/features/cart/domain/line-price";
import {
  buildGiftCardRedeemPreview,
  type GiftCardRedeemPreview,
} from "@/features/gift-cards/domain/gift-card-rules";
import { evaluateGiftCardForRedeem } from "@/features/gift-cards/application/queries";
import {
  calculateMaxRedeemAmount,
  clampBonusRedeemRequest,
  bonusEligibleMerchandiseAmount,
} from "@/features/bonuses/domain/bonus-rules";
import { getUserBonusBalance } from "@/features/bonuses/application/queries";
import { resolveProductPrices } from "@/features/promotions/application/resolve-product-prices";
import {
  couponDiscountErrorMessage,
  evaluateCouponDiscount,
  isCouponUserEligible,
} from "@/features/promotions/domain/evaluate-coupon";
import { normalizePromotionCode } from "@/features/promotions/domain/promotion-rules";
import { getDb } from "@/db/client";
import { promotionUsers, promotions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { getStoreBonusSettings } from "@/features/settings/application/queries";

const previewSchema = z.object({
  giftCardCode: z.string().trim().min(1).max(64),
  couponCode: z.string().trim().max(64).optional(),
  bonusRedeemAmount: z.coerce.number().int().min(0).max(100_000_000).optional(),
  deliveryAmount: z.coerce.number().int().min(0).max(100_000_000).optional(),
});

export type PreviewGiftCardResult =
  | { ok: true; preview: GiftCardRedeemPreview }
  | { ok: false; error: string };

/** Validates a gift card against current cart totals without consuming balance. */
export async function previewGiftCardAction(
  raw: z.infer<typeof previewSchema>,
): Promise<PreviewGiftCardResult> {
  const parsed = previewSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Enter a gift card code." };
  }

  const { items } = await getCartWithItems();
  if (items.length === 0) {
    return { ok: false, error: "Cart is empty." };
  }

  const prices = await resolveProductPrices(
    items.map(({ product }) => ({
      id: product.id,
      priceAmount: product.priceAmount,
      compareAtAmount: product.compareAtAmount,
    })),
  );
  const subtotal = items.reduce((sum, { item, product, modifiers }) => {
    const unit = prices.get(product.id)?.unitAmount ?? product.priceAmount;
    return sum + item.quantity * cartLineUnitAmount(unit, modifiers);
  }, 0);

  let discountAmount = 0;
  const user = await getCurrentUser();
  if (parsed.data.couponCode?.trim()) {
    const code = normalizePromotionCode(parsed.data.couponCode);
    const [coupon] = await getDb()
      .select()
      .from(promotions)
      .where(and(eq(promotions.kind, "COUPON"), eq(promotions.code, code)))
      .limit(1);
    const evaluated = evaluateCouponDiscount(coupon, subtotal);
    if (!evaluated.ok || !coupon) {
      return {
        ok: false,
        error: couponDiscountErrorMessage(
          evaluated.ok ? "INVALID_OR_INACTIVE" : evaluated.error,
        ),
      };
    }
    const allowlistRows = await getDb()
      .select({ userId: promotionUsers.userId })
      .from(promotionUsers)
      .where(eq(promotionUsers.promotionId, coupon.id));
    if (
      !isCouponUserEligible(
        allowlistRows.map((row) => row.userId),
        user?.id,
      )
    ) {
      return {
        ok: false,
        error: couponDiscountErrorMessage("USER_NOT_ELIGIBLE"),
      };
    }
    discountAmount = evaluated.discountAmount;
  }

  const merchandiseAfterDiscount = bonusEligibleMerchandiseAmount(
    subtotal,
    discountAmount,
  );

  let bonusRedeemedAmount = 0;
  if (user && (parsed.data.bonusRedeemAmount ?? 0) > 0) {
    const settings = await getStoreBonusSettings();
    const balance = await getUserBonusBalance(user.id);
    const maxRedeem = calculateMaxRedeemAmount({
      eligibleMerchandiseAmount: merchandiseAfterDiscount,
      availableBalance: balance,
      maxRedeemPercent: settings.maxRedeemPercent,
    });
    bonusRedeemedAmount = clampBonusRedeemRequest(
      parsed.data.bonusRedeemAmount ?? 0,
      maxRedeem,
    );
  }

  const deliveryAmount = parsed.data.deliveryAmount ?? 0;
  const payableBeforeGiftCard =
    Math.max(0, merchandiseAfterDiscount - bonusRedeemedAmount) +
    deliveryAmount;

  const evaluated = await evaluateGiftCardForRedeem(
    parsed.data.giftCardCode,
    user ? { id: user.id, email: user.email } : null,
  );
  if (!evaluated.ok) {
    return { ok: false, error: evaluated.error };
  }

  return {
    ok: true,
    preview: buildGiftCardRedeemPreview({
      giftCardId: evaluated.card.id,
      code: evaluated.card.code,
      initialAmount: evaluated.card.initialAmount,
      balanceAmount: evaluated.card.balanceAmount,
      payableBeforeGiftCard,
    }),
  };
}
