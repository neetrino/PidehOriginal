"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type MouseEvent } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { addToCart } from "@/features/cart/cart";
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
        await addToCart(productId, 1);
        setJustAdded(true);
        router.refresh();
        window.setTimeout(() => setJustAdded(false), 1500);
      } catch {
        setJustAdded(false);
      }
    });
  }

  return (
    <article className="flex w-full max-w-[325px] flex-col rounded-[26px] bg-white px-4 pt-[27px] pb-4 shadow-[0px_12px_14px_rgba(31,20,8,0.11)]">
      <div className="relative h-[180px] w-full overflow-visible rounded-[30px]">
        <AppLink
          href={href}
          prefetchPolicy={priority ? "intent" : "auto"}
          className="absolute inset-0 block overflow-hidden rounded-[30px]"
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="325px"
              priority={priority}
              className="object-contain object-center"
            />
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
          className="absolute top-0 right-0 z-10 h-[34px] w-[34px] bg-transparent text-[#ff6b00] shadow-none hover:bg-transparent"
        />
      </div>

      <h3 className="mt-[11px] line-clamp-2 text-[20px] leading-[1.25] font-extrabold text-[#1e1e1e]">
        <AppLink href={href} prefetchPolicy="auto" className="hover:underline">
          {title}
        </AppLink>
      </h3>

      {description ? (
        <p className="mt-1 line-clamp-2 text-sm leading-[1.25] text-[#6b6b6b]">
          {description}
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <p className="text-[21px] leading-[1.25] font-extrabold text-[#1e1e1e]">
          {priceFormatted}
        </p>
        {compareAtFormatted ? (
          <p className="text-sm text-[#6b6b6b] line-through">
            {compareAtFormatted}
          </p>
        ) : null}
      </div>

      {!inStock ? (
        <p className="mt-2 text-sm font-semibold text-red-600">Out of stock</p>
      ) : null}

      <button
        type="button"
        onClick={handleOrder}
        disabled={!inStock || pending}
        className="relative mt-3 inline-flex w-full items-center justify-center gap-1 overflow-hidden rounded-[42px] border border-[rgba(255,107,0,0.43)] bg-[#ff6b00] px-6 py-4 text-base leading-[1.25] font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>{justAdded ? "✓" : orderLabel}</span>
        <ArrowRight className="size-5 shrink-0" aria-hidden="true" strokeWidth={2.5} />
      </button>
    </article>
  );
}
