"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition, type MouseEvent } from "react";

import { PidehPillButton } from "@/components/brand/PidehPillButton";
import { AppLink } from "@/components/ui/AppLink";
import { addProductToActiveCart } from "@/features/group-orders/application/add-to-active";
import { alertIfSpendLimitExceeded } from "@/features/group-orders/ui/alert-spend-limit-exceeded";
import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";
import { WishlistButton } from "@/features/wishlist/ui/WishlistButton";
import type { Locale } from "@/lib/i18n/config";

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

type ProductCardPhotoProps = {
  href: string;
  title: string;
  imageUrl: string | null;
  priority: boolean;
};

/** Catalog photos sit uncropped; hover tilt/scale is applied on `.pideh-product-photo-pose`. */
function ProductCardPhoto({
  href,
  title,
  imageUrl,
  priority,
}: ProductCardPhotoProps) {
  return (
    <div className="pideh-product-photo-frame relative z-20 h-[180px] w-full shrink-0 overflow-visible">
      <AppLink
        href={href}
        prefetchPolicy={priority ? "intent" : "auto"}
        className="absolute inset-0 z-20 block overflow-visible"
      >
        {imageUrl ? (
          <span className="pideh-product-photo-pose pointer-events-none absolute inset-1">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
              priority={priority}
              className="object-contain drop-shadow-[0_10px_14px_rgba(31,20,8,0.12)]"
            />
          </span>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-50 text-sm text-gray-400">
            —
          </div>
        )}
      </AppLink>
    </div>
  );
}

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
    <div
      className={`group relative z-0 w-full max-w-full overflow-visible hover:z-50 ${className}`}
    >
      <article className="flex h-full w-full flex-col items-start gap-[11px] overflow-visible rounded-[26px] bg-white px-4 pt-[27px] pb-4 shadow-[0px_12px_14px_rgba(31,20,8,0.11)]">
        <div className="relative z-30 w-full overflow-visible">
          <ProductCardPhoto
            href={href}
            title={title}
            imageUrl={imageUrl}
            priority={priority}
          />
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
            className="absolute top-0 right-0 z-40 h-[34px] w-[34px] bg-transparent text-[#ff6b00] shadow-none transition duration-200 hover:scale-110 hover:bg-transparent"
          />
        </div>

        {ratingLabel ? (
          <p className="h-[22px] text-[13px] leading-[1.25] font-bold whitespace-nowrap text-[#ff6b00]">
            {ratingLabel}
          </p>
        ) : null}

        <h3 className="line-clamp-2 min-h-[31px] w-full text-[20px] leading-[1.25] font-extrabold text-[#1e1e1e]">
          <AppLink href={href} prefetchPolicy="auto" className="hover:underline">
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

        <div className="mt-auto w-full">
          <PidehPillButton
            label={justAdded ? "✓" : orderLabel}
            onClick={handleOrder}
            disabled={!inStock || pending}
            className="w-full"
          />
        </div>
      </article>
    </div>
  );
}
