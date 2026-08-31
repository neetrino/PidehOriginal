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
  orderSummary: string;
  basePrice: string;
  total: string;
};

type ProductPurchaseControlsProps = {
  quantity: number;
  maxQty: number;
  disabled: boolean;
  pending: boolean;
  unitPriceFormatted: string;
  totalFormatted: string;
  compareAtTotalFormatted: string | null;
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
  unitPriceFormatted,
  totalFormatted,
  compareAtTotalFormatted,
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
    <div className="flex w-full flex-col gap-[22px] border-t border-[rgba(255,107,0,0.46)] pt-5">
      <div className="flex w-full flex-wrap items-end justify-between gap-4">
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
          className="inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-[66px] bg-[#ff6900] py-4 pr-2 pl-[18px] text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 sm:w-[347px] sm:shrink-0"
        >
          <Image
            src={PIDEH_ASSETS.pdpCart}
            alt=""
            width={26}
            height={26}
            className="size-[26px] shrink-0"
          />
          <span className="text-sm leading-5 font-semibold">{addLabel}</span>
          <span className="text-base leading-5 font-black whitespace-nowrap">
            {totalFormatted}
          </span>
        </button>
      </div>

      <OrderSummary
        labels={labels}
        unitPriceFormatted={unitPriceFormatted}
        totalFormatted={totalFormatted}
        compareAtTotalFormatted={compareAtTotalFormatted}
      />

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
    <div className="flex items-end gap-2">
      <button
        type="button"
        aria-label={labels.resetSelection}
        disabled={disabled}
        onClick={onReset}
        className="mb-0.5 inline-flex size-11 items-center justify-center rounded-full bg-[rgba(255,107,0,0.19)] transition hover:brightness-95 disabled:opacity-40"
      >
        <Image
          src={PIDEH_ASSETS.pdpTrash}
          alt=""
          width={28}
          height={28}
          className="size-7"
        />
      </button>
      <div
        className="inline-flex items-center gap-3 rounded-full bg-[#ff6900] px-2 py-1.5"
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
    </div>
  );
}

function OrderSummary({
  labels,
  unitPriceFormatted,
  totalFormatted,
  compareAtTotalFormatted,
}: {
  labels: ProductPurchaseLabels;
  unitPriceFormatted: string;
  totalFormatted: string;
  compareAtTotalFormatted: string | null;
}) {
  return (
    <div className="flex w-full flex-col">
      <p className="text-xs leading-4 font-semibold tracking-[0.6px] text-[#6b7280] uppercase">
        {labels.orderSummary}
      </p>
      <div className="flex flex-col gap-4 pt-3">
        <div className="flex items-start justify-between text-sm leading-5 text-[#6b7280]">
          <span>{labels.basePrice}</span>
          <span className="font-medium">{unitPriceFormatted}</span>
        </div>
        <div className="py-1">
          <div className="h-px w-full rounded-[70px] bg-[rgba(255,107,0,0.23)]" />
        </div>
        <div className="flex items-start justify-between gap-3">
          <span className="text-base leading-6 font-bold text-[#1e1e1e]">
            {labels.total}
          </span>
          <div className="flex flex-col items-end justify-center">
            <span className="text-[30px] leading-9 font-black text-[#ff6900]">
              {totalFormatted}
            </span>
            {compareAtTotalFormatted ? (
              <span className="text-base leading-6 text-[#99a1af] line-through">
                {compareAtTotalFormatted}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
