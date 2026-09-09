'use client';

import type { MouseEvent } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useState, useTransition } from 'react';

import { beginCartBadgeAdd } from '@/features/cart/ui/cart-badge-count';
import { addProductToActiveCart } from '@/features/group-orders/application/add-to-active';
import { alertIfSpendLimitExceeded } from '@/features/group-orders/ui/alert-spend-limit-exceeded';
import type { Locale } from '@/lib/i18n/config';

type AddToCartButtonProps = {
  productId: string;
  label: string;
  locale: Locale;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
};

export function AddToCartButton({
  productId,
  label,
  locale,
  disabled = false,
  className = '',
  size = 'md',
}: AddToCartButtonProps) {
  const [pending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);
  const iconClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  function handleClick(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();
    if (disabled || pending) return;

    setJustAdded(true);
    const settleBadge = beginCartBadgeAdd();
    startTransition(async () => {
      try {
        const result = await addProductToActiveCart(productId, 1);
        if (!result.ok) {
          settleBadge(null);
          alertIfSpendLimitExceeded(locale, result);
          setJustAdded(false);
          return;
        }
        settleBadge(result.itemCount);
        window.setTimeout(() => setJustAdded(false), 1500);
      } catch {
        settleBadge(null);
        setJustAdded(false);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || pending}
      aria-label={label}
      className={`inline-flex items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      <ShoppingCart
        className={`${iconClass} ${justAdded ? 'fill-gray-900 text-gray-900' : 'text-gray-700'}`}
        aria-hidden
      />
    </button>
  );
}
