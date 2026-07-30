"use client";

import { Minus, Plus } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { addToCart } from "@/features/cart/cart";
import type { ProductModifierChoice } from "@/features/products/types";
import { WishlistButton } from "@/features/wishlist/ui/WishlistButton";
import type { Locale } from "@/lib/i18n/config";

type ProductPurchaseControlsProps = {
  locale: Locale;
  productId: string;
  stockOnHand: number;
  basePriceAmount: number;
  additions: ProductModifierChoice[];
  exceptions: ProductModifierChoice[];
  inWishlist: boolean;
  isSignedIn: boolean;
  wishlistLabel: string;
  labels: {
    quantity: string;
    decreaseQuantity: string;
    increaseQuantity: string;
    addToCart: string;
    adding: string;
    outOfStock: string;
    added: string;
    error: string;
    additions: string;
    exceptions: string;
    additionsEmpty: string;
    exceptionsEmpty: string;
  };
};

export function ProductPurchaseControls({
  locale,
  productId,
  stockOnHand,
  basePriceAmount,
  additions = [],
  exceptions = [],
  inWishlist,
  isSignedIn,
  wishlistLabel,
  labels,
}: ProductPurchaseControlsProps) {
  const maxQty = Math.max(stockOnHand, 0);
  const [quantity, setQuantity] = useState(maxQty > 0 ? 1 : 0);
  const [additionIds, setAdditionIds] = useState<string[]>([]);
  const [exceptionIds, setExceptionIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const disabled = maxQty < 1;

  const additionExtras = useMemo(() => {
    const byId = new Map(additions.map((row) => [row.id, row.priceAmount]));
    return additionIds.reduce((sum, id) => sum + (byId.get(id) ?? 0), 0);
  }, [additionIds, additions]);

  const unitPreview = basePriceAmount + additionExtras;

  function changeQuantity(next: number): void {
    if (disabled) return;
    setQuantity(Math.min(Math.max(1, next), maxQty));
    setMessage(null);
    setError(null);
  }

  function handleAdd(): void {
    if (disabled || quantity < 1) return;
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        await addToCart(productId, quantity, {
          modifierIds: [...additionIds, ...exceptionIds],
        });
        setMessage(labels.added);
      } catch {
        setError(labels.error);
      }
    });
  }

  return (
    <div className="mt-auto flex flex-col gap-3 pt-2">
      {additions.length > 0 ? (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-gray-700">
            {labels.additions}
          </span>
          <MultiSelectDropdown
            ariaLabel={labels.additions}
            emptyLabel={labels.additionsEmpty}
            values={additionIds}
            disabled={disabled || pending}
            onValuesChange={setAdditionIds}
            options={additions.map((row) => ({
              value: row.id,
              label: row.name,
              hint: `+${row.priceAmount} AMD`,
            }))}
          />
        </label>
      ) : null}

      {exceptions.length > 0 ? (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-gray-700">
            {labels.exceptions}
          </span>
          <MultiSelectDropdown
            ariaLabel={labels.exceptions}
            emptyLabel={labels.exceptionsEmpty}
            values={exceptionIds}
            disabled={disabled || pending}
            onValuesChange={setExceptionIds}
            options={exceptions.map((row) => ({
              value: row.id,
              label: row.name,
            }))}
          />
        </label>
      ) : null}

      {additionExtras > 0 ? (
        <p className="text-sm text-gray-600">
          {unitPreview} AMD × {Math.max(quantity, 1)}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white">
          <button
            type="button"
            aria-label={labels.decreaseQuantity}
            disabled={disabled || quantity <= 1 || pending}
            onClick={() => changeQuantity(quantity - 1)}
            className="flex h-11 w-11 items-center justify-center text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" aria-hidden />
          </button>
          <span
            className="min-w-10 text-center text-base font-semibold text-gray-900"
            aria-live="polite"
          >
            {quantity}
          </span>
          <button
            type="button"
            aria-label={labels.increaseQuantity}
            disabled={disabled || quantity >= maxQty || pending}
            onClick={() => changeQuantity(quantity + 1)}
            className="flex h-11 w-11 items-center justify-center text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <button
          type="button"
          disabled={disabled || pending}
          onClick={handleAdd}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-gray-900 px-6 text-base font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:min-w-[12rem]"
        >
          {disabled
            ? labels.outOfStock
            : pending
              ? labels.adding
              : labels.addToCart}
        </button>

        <WishlistButton
          locale={locale}
          productId={productId}
          initialInWishlist={inWishlist}
          isSignedIn={isSignedIn}
          label={wishlistLabel}
          className="h-11 w-11 border border-gray-200 bg-white hover:bg-gray-50"
        />
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
