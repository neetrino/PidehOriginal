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
 * Figma Product 260:512 — fixed 200×340 design space (scaled via MobileFrame440).
 * Button 8 stays inside the white rounded rect (never spills into the orange page).
 *
 * @see https://www.figma.com/design/zyLVZFDhohLYxwuohIrPDN/Pideh-Dev?node-id=260-512
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
      className="relative box-border flex h-[340px] w-[200px] flex-col gap-2 overflow-visible rounded-[26px] bg-white pt-[27px] pr-4 pb-4 pl-3.5 shadow-[0px_12px_14px_rgba(31,20,8,0.11)]"
    >
      <div
        data-node-id="260:513"
        className="relative mx-auto h-[123px] w-[193px] shrink-0"
      >
        <AppLink
          href={href}
          prefetchPolicy={priority ? "intent" : "auto"}
          className="absolute inset-0 block"
        >
          {imageUrl ? (
            <span className="pointer-events-none absolute top-[-20px] left-1/2 h-[170px] w-[213px] -translate-x-1/2">
              <Image
                src={imageUrl}
                alt={title}
                width={214}
                height={170}
                sizes="200px"
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
          className="absolute -top-3 right-5 z-20 size-[34px] bg-transparent text-[#ff6b00] shadow-none"
        />
      </div>

      <div
        data-node-id="260:517"
        className="flex h-[13px] w-full shrink-0 items-start overflow-hidden"
      >
        {ratingLabel ? (
          <b
            data-node-id="260:518"
            className="font-montserrat-arm text-[13px] leading-[1.25] font-bold whitespace-nowrap text-[#ff6b00]"
          >
            {ratingLabel}
          </b>
        ) : null}
      </div>

      <div
        data-node-id="260:519"
        className="font-montserrat-arm h-[19px] w-full shrink-0 overflow-hidden text-base leading-[1.25] font-extrabold text-[#1e1e1e]"
      >
        <AppLink
          href={href}
          prefetchPolicy="auto"
          className="block truncate hover:underline"
        >
          {title}
        </AppLink>
      </div>

      <p
        data-node-id="260:520"
        className="font-montserrat-arm line-clamp-3 min-h-[48px] w-full shrink-0 overflow-hidden text-sm leading-[1.14] text-[#6b6b6b]"
      >
        {description ?? "\u00A0"}
      </p>

      <p
        data-node-id="260:521"
        className="font-montserrat-arm h-4 w-full shrink-0 text-[13px] leading-[1.25] font-medium text-[#6b6b6b]"
      >
        {prepTimeLabel ?? "\u00A0"}
      </p>

      <div
        data-node-id="260:875"
        className="mt-auto flex h-[56px] w-full shrink-0 items-center gap-7"
      >
        <p
          data-node-id="260:522"
          className="font-montserrat-arm min-w-0 flex-1 truncate text-[21px] leading-[1.25] font-extrabold text-[#1e1e1e]"
        >
          {priceFormatted}
        </p>
        <button
          type="button"
          data-node-id="260:934"
          aria-label={addLabel}
          disabled={!inStock || pending}
          onClick={handleAdd}
          className="box-border flex h-[56px] w-[59px] shrink-0 -translate-y-3 items-center justify-center overflow-hidden rounded-[42px] border-0 bg-[#ff6b00] p-0 transition enabled:hover:brightness-105 enabled:active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        >
          {justAdded ? (
            <span className="text-lg font-bold text-white" aria-hidden>
              ✓
            </span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={MOBILE_HOME_ASSETS.plus}
              alt=""
              width={24}
              height={24}
              className="pointer-events-none size-6 max-w-none"
              draggable={false}
            />
          )}
        </button>
      </div>
    </article>
  );
}
