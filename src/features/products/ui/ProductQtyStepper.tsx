'use client';

import Image from 'next/image';

import { PIDEH_ASSETS } from '@/features/home/ui/brand-assets';

type ProductQtyStepperLabels = {
  quantity: string;
  decreaseQuantity: string;
  increaseQuantity: string;
  resetSelection: string;
};

type ProductQtyStepperProps = {
  quantity: number;
  maxQty: number;
  disabled: boolean;
  labels: ProductQtyStepperLabels;
  onQuantityChange: (next: number) => void;
  onReset: () => void;
};

/** Figma 366:425 — orange qty pill plus trash reset. */
export function ProductQtyStepper({
  quantity,
  maxQty,
  disabled,
  labels,
  onQuantityChange,
  onReset,
}: ProductQtyStepperProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="inline-flex h-12 items-center gap-3 rounded-full bg-[#ff6900] px-2 py-1.5"
        aria-label={labels.quantity}
      >
        <button
          type="button"
          aria-label={labels.decreaseQuantity}
          disabled={disabled || quantity <= 1}
          onClick={() => onQuantityChange(quantity - 1)}
          className="flex size-8 items-center justify-center rounded-full bg-white/45 disabled:opacity-40"
        >
          <Image
            src={PIDEH_ASSETS.pdpQtyMinus}
            alt=""
            width={14}
            height={14}
            className="size-[14px]"
          />
        </button>
        <span
          className="w-6 text-center text-base leading-6 font-bold text-white"
          aria-live="polite"
        >
          {quantity}
        </span>
        <button
          type="button"
          aria-label={labels.increaseQuantity}
          disabled={disabled || quantity >= maxQty}
          onClick={() => onQuantityChange(quantity + 1)}
          className="flex size-8 items-center justify-center rounded-full bg-white disabled:opacity-40"
        >
          <Image
            src={PIDEH_ASSETS.pdpQtyPlus}
            alt=""
            width={14}
            height={14}
            className="size-[14px]"
          />
        </button>
      </div>
      <button
        type="button"
        aria-label={labels.resetSelection}
        disabled={disabled}
        onClick={onReset}
        className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-[rgba(255,107,0,0.19)] transition hover:brightness-95 disabled:opacity-40"
      >
        <Image src={PIDEH_ASSETS.pdpTrash} alt="" width={28} height={28} className="size-7" />
      </button>
    </div>
  );
}
