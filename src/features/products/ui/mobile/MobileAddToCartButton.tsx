import Image from 'next/image';

import { PIDEH_ASSETS } from '@/features/home/ui/brand-assets';

type MobileAddToCartButtonProps = {
  label: string;
  disabled: boolean;
  error: string | null;
  onAdd: () => void;
};

/** Sits above the mobile nav dock while the sheet scrolls (sticky bottom). */
const STICKY_BOTTOM = 'calc(5.5rem + env(safe-area-inset-bottom))';

/**
 * Figma 366:424 — add-to-cart. Stays in document flow at the top of the sheet,
 * then tracks the viewport 1:1 as the page scrolls down and back up.
 */
export function MobileAddToCartButton({
  label,
  disabled,
  error,
  onAdd,
}: MobileAddToCartButtonProps) {
  return (
    <div
      className="sticky z-30 -mx-[22px] bg-white px-[22px] pt-3 pb-2"
      style={{ bottom: STICKY_BOTTOM }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onAdd}
        className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-[66px] bg-[#ff6900] pr-2 pl-[18px] text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Image
          src={PIDEH_ASSETS.pdpCart}
          alt=""
          width={26}
          height={26}
          className="size-[26px] shrink-0"
        />
        <span className="text-sm leading-5 font-semibold">{label}</span>
      </button>
      {error ? (
        <p className="pt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
