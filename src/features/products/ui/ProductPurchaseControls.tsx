"use client";

import Image from "next/image";

import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";

export type ProductPurchaseLabels = {
  quantity: string;
  decreaseQuantity: string;
  increaseQuantity: string;
  addToCart: string;
  adding: string;
  outOfStock: string;
  added: string;
  error: string;
  resetSelection: string;
};

type ProductPurchaseControlsProps = {
  quantity: number;
  maxQty: number;
  disabled: boolean;
  pending: boolean;
  onQuantityChange: (next: number) => void;
  onReset: () => void;
  onAdd: () => void;
  labels: ProductPurchaseLabels;
  message: string | null;
  error: string | null;
};

export function ProductPurchaseControls({
  quantity,
  maxQty,
  disabled,
  pending,
  onQuantityChange,
  onReset,
  onAdd,
  labels,
  message,
  error,
}: ProductPurchaseControlsProps) {
  const addLabel = disabled
    ? labels.outOfStock
    : pending
      ? labels.adding
      : labels.addToCart;

  return (
    <div className="flex w-full flex-col gap-4 border-t border-[rgba(255,107,0,0.46)] pt-5">
      <div className="flex flex-wrap items-center gap-4 sm:gap-[27px]">
        <QtyRow
          quantity={quantity}
          maxQty={maxQty}
          disabled={disabled || pending}
          labels={labels}
          onQuantityChange={onQuantityChange}
          onReset={onReset}
        />
        <button
          type="button"
          disabled={disabled || pending}
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

      {message ? (
        <p className="text-sm text-green-700" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function QtyRow({
  quantity,
  maxQty,
  disabled,
  labels,
  onQuantityChange,
  onReset,
}: {
  quantity: number;
  maxQty: number;
  disabled: boolean;
  labels: ProductPurchaseLabels;
  onQuantityChange: (next: number) => void;
  onReset: () => void;
}) {
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
        <Image
          src={PIDEH_ASSETS.pdpTrash}
          alt=""
          width={28}
          height={28}
          className="size-7"
        />
      </button>
    </div>
  );
}
