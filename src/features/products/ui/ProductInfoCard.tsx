"use client";

import { useState } from "react";

import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";
import { ProductPurchaseControls } from "@/features/products/ui/ProductPurchaseControls";
import { ProductSectionHeading } from "@/features/products/ui/ProductSectionHeading";
import type { useProductConfigurator } from "@/features/products/ui/use-product-configurator";
import { WishlistButton } from "@/features/wishlist/ui/WishlistButton";
import type { Locale } from "@/lib/i18n/config";

export type ProductInfoCardLabels = {
  ingredients: string;
  specialRequests: string;
  specialRequestsPlaceholder: string;
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

type ProductInfoCardProps = {
  locale: Locale;
  productId: string;
  title: string;
  description?: string;
  inWishlist: boolean;
  isSignedIn: boolean;
  wishlistLabel: string;
  labels: ProductInfoCardLabels;
  state: ReturnType<typeof useProductConfigurator>;
};

export function ProductInfoCard({
  locale,
  productId,
  title,
  description,
  inWishlist,
  isSignedIn,
  wishlistLabel,
  labels,
  state,
}: ProductInfoCardProps) {
  const [note, setNote] = useState("");
  const disabled = state.disabled || state.pending;

  function handleReset(): void {
    setNote("");
    state.resetSelection();
  }

  return (
    <div className="flex w-full flex-col gap-2.5 rounded-[30px] bg-[#fff8f0] pt-[13px] pr-6 pb-6 pl-[30px]">
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-display text-[clamp(2.25rem,5vw,3.125rem)] leading-[1.25] text-[#1e1e1e]">
          {title}
        </h1>
        <WishlistButton
          locale={locale}
          productId={productId}
          initialInWishlist={inWishlist}
          isSignedIn={isSignedIn}
          label={wishlistLabel}
          emptyIconSrc={PIDEH_ASSETS.pdpHeart}
          emptyIconWidth={22}
          emptyIconHeight={22}
          className="size-11 shrink-0 border-2 border-[rgba(255,107,0,0.75)] bg-white text-[#ff6b00] hover:bg-white"
        />
      </div>

      {description ? (
        <div className="flex flex-col py-4 pr-4">
          <ProductSectionHeading
            iconSrc={PIDEH_ASSETS.pdpList}
            iconWidth={14}
            iconHeight={14}
            title={labels.ingredients}
            tone="onCream"
            titleSize="sm"
          />
          <p className="mt-2 text-sm leading-[22.75px] text-[#555]">
            {description}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-baseline gap-3">
        <p className="text-[36px] leading-9 font-extrabold text-[#ff6900]">
          {state.totalFormatted}
        </p>
        {state.compareAtTotalFormatted ? (
          <span className="text-base leading-6 text-[#99a1af] line-through">
            {state.compareAtTotalFormatted}
          </span>
        ) : null}
      </div>

      <ProductPurchaseControls
        quantity={state.quantity}
        maxQty={state.maxQty}
        disabled={state.disabled}
        pending={state.pending}
        onQuantityChange={state.changeQuantity}
        onReset={handleReset}
        onAdd={state.handleAdd}
        labels={labels}
        message={state.message}
        error={state.error}
      />

      <SpecialRequestsField
        label={labels.specialRequests}
        placeholder={labels.specialRequestsPlaceholder}
        value={note}
        disabled={disabled}
        onChange={setNote}
      />
    </div>
  );
}

function SpecialRequestsField({
  label,
  placeholder,
  value,
  disabled,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <ProductSectionHeading
        iconSrc={PIDEH_ASSETS.pdpEdit}
        iconWidth={14}
        iconHeight={14}
        title={label}
        tone="onInk"
        titleSize="md"
      />
      <textarea
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="min-h-[84px] w-full resize-none rounded-[16px] border-0 bg-[rgba(255,107,0,0.09)] px-4 py-3 text-sm leading-5 text-[#1e1e1e] placeholder:text-[rgba(204,86,0,0.48)] focus-visible:ring-2 focus-visible:ring-[#ff6b00]/40 focus-visible:outline-none disabled:opacity-50"
      />
    </div>
  );
}
