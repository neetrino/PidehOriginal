import Image from 'next/image';

import { PidehPillButton } from '@/components/brand/PidehPillButton';
import { PIDEH_ASSETS } from '@/features/home/ui/brand-assets';

type WishlistEmptyStateProps = {
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
};

/** Cream placeholder card shared by the guest and empty wishlist states. */
export function WishlistEmptyState({
  title,
  description,
  ctaHref,
  ctaLabel,
}: WishlistEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[30px] bg-[#fff8f0] px-6 py-14 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-white shadow-[0px_12px_14px_rgba(31,20,8,0.11)]">
        <Image src={PIDEH_ASSETS.pdpHeart} alt="" width={28} height={28} aria-hidden />
      </span>
      <h2 className="font-display text-[clamp(1.5rem,4vw,2rem)] leading-tight text-[#1e1e1e]">
        {title}
      </h2>
      <p className="font-noto-armenian max-w-md text-sm leading-6 text-[#6b6b6b]">{description}</p>
      <PidehPillButton href={ctaHref} label={ctaLabel} className="mt-2" />
    </div>
  );
}
