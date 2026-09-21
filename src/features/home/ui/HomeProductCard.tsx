"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type MouseEvent, type PointerEvent } from "react";

import { PidehPillButton } from "@/components/brand/PidehPillButton";
import { AppLink } from "@/components/ui/AppLink";
import { addProductToActiveCart } from "@/features/group-orders/application/add-to-active";
import { alertIfSpendLimitExceeded } from "@/features/group-orders/ui/alert-spend-limit-exceeded";
import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";
import {
  PRODUCT_CARD_SPRING,
  PRODUCT_CARD_TAP,
} from "@/features/home/ui/product-card-motion";
import { ProductCardPhoto } from "@/features/home/ui/ProductCardPhoto";
import { WishlistButton } from "@/features/wishlist/ui/WishlistButton";
import type { Locale } from "@/lib/i18n/config";

function stopCardPress(event: PointerEvent<HTMLElement>): void {
  event.stopPropagation();
}

type HomeProductCardProps = {
  href: string;
  title: string;
  description?: string | null;
  priceFormatted: string;
  compareAtFormatted?: string | null;
  imageUrl: string | null;
  inStock: boolean;
  priority?: boolean;
  locale: Locale;
  productId: string;
  inWishlist: boolean;
  isSignedIn: boolean;
  wishlistLabel: string;
  orderLabel: string;
  outOfStockLabel?: string;
  ratingLabel?: string;
  prepTimeLabel?: string;
  className?: string;
};

export function HomeProductCard({
  href,
  title,
  description,
  priceFormatted,
  compareAtFormatted = null,
  imageUrl,
  inStock,
  priority = false,
  locale,
  productId,
  inWishlist,
  isSignedIn,
  wishlistLabel,
  orderLabel,
  outOfStockLabel,
  ratingLabel,
  prepTimeLabel,
  className = "",
}: HomeProductCardProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [pending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);

  function handleOrder(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();
    if (!inStock || pending) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await addProductToActiveCart(productId, 1);
        if (!result.ok) {
          alertIfSpendLimitExceeded(locale, result);
          setJustAdded(false);
          return;
        }
        setJustAdded(true);
        router.refresh();
        window.setTimeout(() => setJustAdded(false), 1500);
      } catch {
        setJustAdded(false);
      }
    });
  }

  return (
    <motion.div
      className={`group relative z-0 w-full max-w-full overflow-visible hover:z-50 ${className}`}
      style={{ transformOrigin: "50% 100%" }}
      transition={PRODUCT_CARD_SPRING}
      whileTap={reduceMotion ? undefined : PRODUCT_CARD_TAP}
    >
      <article className="pideh-product-card relative flex h-full w-full flex-col items-start gap-[11px] overflow-visible rounded-[26px] bg-white px-4 pt-[27px] pb-4 shadow-[0px_12px_14px_rgba(31,20,8,0.11)]">
        <AppLink
          href={href}
          prefetchPolicy={priority ? "intent" : "auto"}
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 z-[1] rounded-[26px]"
        />
        <div className="relative z-30 w-full overflow-visible">
          <ProductCardPhoto
            href={href}
            title={title}
            imageUrl={imageUrl}
            priority={priority}
          />
          <span className="absolute top-0 right-0 z-40" onPointerDown={stopCardPress}>
            <WishlistButton
              locale={locale}
              productId={productId}
              initialInWishlist={inWishlist}
              isSignedIn={isSignedIn}
              label={wishlistLabel}
              size="sm"
              emptyIconSrc={PIDEH_ASSETS.shopHeart}
              emptyIconWidth={34}
              emptyIconHeight={34}
              className="h-[34px] w-[34px] bg-transparent text-[#ff6b00] shadow-none transition duration-200 hover:scale-110 hover:bg-transparent"
            />
          </span>
        </div>

        {ratingLabel ? (
          <p className="h-[22px] text-[13px] leading-[1.25] font-bold whitespace-nowrap text-[#ff6b00]">
            {ratingLabel}
          </p>
        ) : null}

        <h3 className="relative z-[2] line-clamp-2 min-h-[31px] w-full text-[20px] leading-[1.25] font-extrabold text-[#1e1e1e]">
          <AppLink href={href} prefetchPolicy="auto">
            {title}
          </AppLink>
        </h3>

        {description ? (
          <p className="line-clamp-2 w-[213px] max-w-full text-sm leading-[1.25] text-[#6b6b6b]">
            {description}
          </p>
        ) : null}

        {prepTimeLabel ? (
          <p className="w-full text-[13px] leading-[1.25] font-medium text-[#6b6b6b]">
            {prepTimeLabel}
          </p>
        ) : null}

        <div className="flex w-full flex-wrap items-baseline gap-2">
          <p className="text-[21px] leading-[1.25] font-extrabold text-[#1e1e1e]">
            {priceFormatted}
          </p>
          {compareAtFormatted ? (
            <p className="text-sm text-[#6b6b6b] line-through">
              {compareAtFormatted}
            </p>
          ) : null}
        </div>

        {!inStock && outOfStockLabel ? (
          <p className="text-sm font-semibold text-red-600">{outOfStockLabel}</p>
        ) : null}

        <div className="relative z-10 mt-auto w-full" onPointerDown={stopCardPress}>
          <PidehPillButton
            label={justAdded ? "✓" : orderLabel}
            onClick={handleOrder}
            disabled={!inStock || pending}
            className="w-full"
          />
        </div>
      </article>
    </motion.div>
  );
}
