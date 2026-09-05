"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition, type MouseEvent } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { addProductToActiveCart } from "@/features/group-orders/application/add-to-active";
import { MOBILE_HOME_ASSETS } from "@/features/home/ui/mobile/mobile-assets";
import { WishlistButton } from "@/features/wishlist/ui/WishlistButton";
import type { Locale } from "@/lib/i18n/config";

type MobileProductCardProps = {
  href: string;
  title: string;
  description?: string | null;
  priceFormatted: string;
  imageUrl: string | null;
  inStock: boolean;
  locale: Locale;
  productId: string;
  inWishlist: boolean;
  isSignedIn: boolean;
  wishlistLabel: string;
  addLabel: string;
  ratingLabel?: string;
  prepTimeLabel?: string;
  priority?: boolean;
};

/**
 * Figma Product (260:592 / 260:512).
 * Internal spacing from Dev Mode; width is fluid so side “walls” stay visible.
 *
 * @see https://www.figma.com/design/zyLVZFDhohLYxwuohIrPDN/Pideh-Dev?node-id=260-592
 */
export function MobileProductCard({
  href,
  title,
  description,
  priceFormatted,
  imageUrl,
  inStock,
  locale,
  productId,
  inWishlist,
  isSignedIn,
  wishlistLabel,
  addLabel,
  ratingLabel,
  prepTimeLabel,
  priority = false,
}: MobileProductCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();
    if (!inStock || pending) return;

    startTransition(async () => {
      try {
        const result = await addProductToActiveCart(productId, 1);
        if (!result.ok) {
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
    <article
      data-node-id="260:512"
      className="box-border flex min-h-[340px] w-full flex-col items-stretch gap-2 rounded-[26px] bg-white pt-[27px] pr-4 pb-4 pl-3.5 shadow-[0px_12px_28px_rgba(31,20,8,0.11)]"
    >
      <div
        data-node-id="260:513"
        className="relative mx-auto h-[123px] w-full max-w-[193px] shrink-0 overflow-visible"
      >
        <AppLink
          href={href}
          prefetchPolicy={priority ? "intent" : "auto"}
          className="absolute inset-0 block overflow-visible"
        >
          {imageUrl ? (
            <span className="pointer-events-none absolute top-[-20px] left-1/2 h-[170px] w-[min(213px,115%)] -translate-x-1/2">
              <Image
                src={imageUrl}
                alt={title}
                width={214}
                height={170}
                sizes="(max-width: 440px) 45vw, 214px"
                priority={priority}
                className="size-full object-contain"
              />
            </span>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-50 text-sm text-gray-400">
              —
            </div>
          )}
        </AppLink>
        <WishlistButton
          locale={locale}
          productId={productId}
          initialInWishlist={inWishlist}
          isSignedIn={isSignedIn}
          label={wishlistLabel}
          size="sm"
          emptyIconSrc={MOBILE_HOME_ASSETS.heartOutline}
          emptyIconWidth={34}
          emptyIconHeight={34}
          className="absolute top-0 right-0 z-20 size-[34px] bg-transparent text-[#ff6b00] shadow-none"
        />
      </div>

      <div className="flex h-[13px] w-full shrink-0 items-start overflow-hidden">
        {ratingLabel ? (
          <b className="text-[13px] leading-[1.25] font-bold whitespace-nowrap text-[#ff6b00]">
            {ratingLabel}
          </b>
        ) : null}
      </div>

      <div className="h-[19px] w-full shrink-0 overflow-hidden text-base leading-[1.25] font-extrabold text-[#1e1e1e]">
        <AppLink
          href={href}
          prefetchPolicy="auto"
          className="block truncate hover:underline"
        >
          {title}
        </AppLink>
      </div>

      <p className="line-clamp-2 min-h-[32px] w-full shrink-0 text-sm leading-[1.14] text-[#6b6b6b]">
        {description ?? "\u00A0"}
      </p>

      <p className="h-[16px] w-full shrink-0 text-[13px] leading-[1.25] font-medium text-[#6b6b6b]">
        {prepTimeLabel ?? "\u00A0"}
      </p>

      <div className="mt-auto flex w-full shrink-0 items-center gap-7">
        <div className="min-w-0 flex-1 truncate text-[21px] leading-[1.25] font-extrabold text-[#1e1e1e]">
          {priceFormatted}
        </div>
        <button
          type="button"
          aria-label={addLabel}
          disabled={!inStock || pending}
          onClick={handleAdd}
          className="box-border flex w-[59px] shrink-0 items-center justify-center overflow-hidden rounded-[42px] bg-[#ff6b00] px-6 py-4 transition enabled:hover:brightness-105 disabled:opacity-50"
        >
          {justAdded ? (
            <span className="text-lg font-bold text-white">✓</span>
          ) : (
            <Image
              src={MOBILE_HOME_ASSETS.plus}
              alt=""
              width={24}
              height={24}
              className="size-6 shrink-0"
            />
          )}
        </button>
      </div>
    </article>
  );
}
