'use client';

import Image from 'next/image';

import { PIDEH_ASSETS } from '@/features/home/ui/brand-assets';
import { ProductQtyStepper } from '@/features/products/ui/ProductQtyStepper';

export type ProductPurchaseLabels = {
  quantity: string;
  decreaseQuantity: string;
  increaseQuantity: string;
  addToCart: string;
  outOfStock: string;
  error: string;
  resetSelection: string;
};

type ProductPurchaseControlsProps = {
  quantity: number;
  maxQty: number;
  disabled: boolean;
  onQuantityChange: (next: number) => void;
  onReset: () => void;
  onAdd: () => void;
  labels: ProductPurchaseLabels;
  error: string | null;
};

export function ProductPurchaseControls({
  quantity,
  maxQty,
  disabled,
  onQuantityChange,
  onReset,
  onAdd,
  labels,
  error,
}: ProductPurchaseControlsProps) {
  const addLabel = disabled ? labels.outOfStock : labels.addToCart;

  return (
    <div className="flex w-full flex-col gap-4 border-t border-[rgba(255,107,0,0.46)] pt-5">
      <div className="flex flex-wrap items-center gap-4 sm:gap-[27px]">
        <ProductQtyStepper
          quantity={quantity}
          maxQty={maxQty}
          disabled={disabled}
          labels={labels}
          onQuantityChange={onQuantityChange}
          onReset={onReset}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={onAdd}
          className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-3 rounded-[66px] bg-[#ff6900] pr-2 pl-[18px] text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 sm:w-[283px]"
        >
          <Image
            src={PIDEH_ASSETS.pdpCart}
            alt=""
            width={26}
            height={26}
            className="size-[26px] shrink-0"
          />
          <span className="text-sm leading-5 font-semibold">{addLabel}</span>
        </button>
      </div>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
