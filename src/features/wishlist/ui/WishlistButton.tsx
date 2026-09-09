'use client';

import type { MouseEvent } from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { toggleWishlistAction } from '@/features/wishlist/actions';
import { setWishlistBadgeCount } from '@/features/wishlist/ui/wishlist-badge-count';
import { WishlistHeartBurst } from '@/features/wishlist/ui/WishlistHeartBurst';
import type { Locale } from '@/lib/i18n/config';

type WishlistButtonProps = {
  locale: Locale;
  productId: string;
  initialInWishlist: boolean;
  isSignedIn: boolean;
  label: string;
  className?: string;
  size?: 'sm' | 'md';
  emptyIconSrc?: string;
  emptyIconWidth?: number;
  emptyIconHeight?: number;
};

function wishlistHeartClass(
  inWishlist: boolean,
  usesFigmaIcon: boolean,
  iconClass: string,
): string {
  const sizeClass = usesFigmaIcon ? '' : iconClass;
  if (!inWishlist) {
    return `${sizeClass} fill-transparent text-current`.trim();
  }
  if (usesFigmaIcon) {
    return `${sizeClass} fill-[#ff6b00] text-[#ff6b00]`.trim();
  }
  return `${sizeClass} fill-red-500 text-red-500`;
}

export function WishlistButton({
  locale,
  productId,
  initialInWishlist,
  isSignedIn,
  label,
  className = '',
  size = 'md',
  emptyIconSrc,
  emptyIconWidth = 34,
  emptyIconHeight = 34,
}: WishlistButtonProps) {
  const router = useRouter();
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [burstKey, setBurstKey] = useState(0);
  const [bursting, setBursting] = useState(false);
  const busyRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const iconClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  function redirectToLogin(): void {
    const target =
      typeof window === 'undefined'
        ? `/${locale}`
        : `${window.location.pathname}${window.location.search}`;
    router.push(`/${locale}/login?next=${encodeURIComponent(target)}`);
  }

  /** Optimistic so the heart fills on click; the server call only corrects it. */
  async function toggle(): Promise<void> {
    const previous = inWishlist;
    setInWishlist(!previous);
    if (!previous && !reduceMotion) {
      setBurstKey((current) => current + 1);
      setBursting(true);
    }

    const result = await toggleWishlistAction(productId);
    if (!result.ok) {
      setInWishlist(previous);
      setBursting(false);
      if (result.error.code === 'UNAUTHENTICATED') {
        redirectToLogin();
      }
      return;
    }

    setInWishlist(result.value.inWishlist);
    setWishlistBadgeCount(result.value.count);
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();

    if (!isSignedIn) {
      redirectToLogin();
      return;
    }
    if (busyRef.current) {
      return;
    }

    busyRef.current = true;
    void toggle().finally(() => {
      busyRef.current = false;
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      aria-pressed={inWishlist}
      className={`inline-flex items-center justify-center rounded-full transition ${className}`}
    >
      {/* Own positioning context: the button keeps whatever position the caller sets. */}
      <span className="relative inline-flex items-center justify-center">
        <motion.span
          key={burstKey}
          className="inline-flex"
          animate={burstKey > 0 ? { scale: [1, 1.35, 1] } : undefined}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          {emptyIconSrc && !inWishlist ? (
            <Image
              src={emptyIconSrc}
              alt=""
              width={emptyIconWidth}
              height={emptyIconHeight}
              aria-hidden
            />
          ) : (
            <Heart
              className={wishlistHeartClass(inWishlist, Boolean(emptyIconSrc), iconClass)}
              style={emptyIconSrc ? { width: emptyIconWidth, height: emptyIconHeight } : undefined}
              aria-hidden
            />
          )}
        </motion.span>

        {bursting ? (
          <WishlistHeartBurst burstKey={burstKey} onDone={() => setBursting(false)} />
        ) : null}
      </span>
    </button>
  );
}
