"use client";

import { useState, useTransition } from "react";
import { ShoppingCart } from "lucide-react";

import { SideSheet } from "@/components/ui/SideSheet";
import { removeItem, updateQuantity } from "@/features/cart/cart";
import type { CartDrawerView } from "@/features/cart/get-cart-drawer-view";
import { loadCartDrawerViewAction } from "@/features/cart/load-cart-drawer-view-action";
import { CartDrawerEmpty } from "@/features/cart/ui/CartDrawerEmpty";
import { CartDrawerItems } from "@/features/cart/ui/CartDrawerItems";
import { CartDrawerTotals } from "@/features/cart/ui/CartDrawerTotals";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { Currency } from "@/lib/money/currency";

type CartDrawerTriggerArgs = {
  open: boolean;
  badgeCount: number;
  label: string;
  openDrawer: () => void;
  prefetchDrawerView: () => void;
};

type CartDrawerProps = {
  locale: Locale;
  currency: Currency;
  dictionary: Dictionary;
  itemCount: number;
  renderTrigger?: (args: CartDrawerTriggerArgs) => React.ReactNode;
};

function formatItemCount(
  count: number,
  labels: Dictionary["cartDrawer"],
): string {
  if (count === 1) {
    return labels.itemsOne;
  }
  return labels.itemsMany.replace("{count}", String(count));
}

export function CartDrawer({
  locale,
  currency,
  dictionary,
  itemCount,
  renderTrigger,
}: CartDrawerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<CartDrawerView | null>(null);
  const [loadingView, setLoadingView] = useState(false);
  const [pending, startTransition] = useTransition();
  const labels = dictionary.cartDrawer;
  const badgeCount = view?.itemCount ?? itemCount;
  const hasItems = Boolean(view && view.items.length > 0);
  const displayCurrency = view?.currency ?? currency;

  function prefetchDrawerView(): void {
    if (view || loadingView || open) {
      return;
    }
    setLoadingView(true);
    startTransition(async () => {
      const next = await loadCartDrawerViewAction(locale, currency);
      setView(next);
      setLoadingView(false);
    });
  }

  function openDrawer(): void {
    setOpen(true);
    if (!view) {
      setLoadingView(true);
      startTransition(async () => {
        const next = await loadCartDrawerViewAction(locale, currency);
        setView(next);
        setLoadingView(false);
      });
    }
  }

  function closeDrawer(): void {
    setOpen(false);
  }

  function changeQuantity(itemId: string, quantity: number): void {
    startTransition(async () => {
      await updateQuantity(itemId, quantity);
      setView(await loadCartDrawerViewAction(locale, currency));
    });
  }

  function removeCartItem(itemId: string): void {
    startTransition(async () => {
      await removeItem(itemId);
      setView(await loadCartDrawerViewAction(locale, currency));
    });
  }

  return (
    <>
      <SideSheet
        open={open}
        onClose={closeDrawer}
        ariaLabel={labels.title}
        panelClassName="w-[87%] max-w-[420px]"
        panelInnerClassName="rounded-l-[28px] bg-[#fff8e7]"
        closeClassName="bg-[#ff6b00] hover:bg-[#e85f00]"
        zIndexClassName="z-[200]"
        backdropBlur
      >
        <div className="border-b border-[#ff6b00]/15 px-6 py-5">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#ff6b00] uppercase">
            {labels.ticketEyebrow}
          </p>
          <h2 className="font-display mt-1 text-3xl leading-[0.9] text-[#1e1e1e] uppercase">
            {labels.title}
          </h2>
          {hasItems ? (
            <p className="mt-2 text-sm text-[#1e1e1e]/55">
              {formatItemCount(badgeCount, labels)}
            </p>
          ) : null}
        </div>

        <div
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 ${
            pending || loadingView ? "opacity-70" : ""
          }`}
        >
          {loadingView && !view ? (
            <div className="space-y-3">
              <div className="h-24 animate-pulse rounded-[22px] bg-white/80" />
              <div className="h-24 animate-pulse rounded-[22px] bg-white/80" />
            </div>
          ) : !view || view.items.length === 0 ? (
            <CartDrawerEmpty
              locale={locale}
              empty={labels.empty}
              emptyDescription={labels.emptyDescription}
              emptyCta={labels.emptyCta}
              onContinue={closeDrawer}
            />
          ) : (
            <CartDrawerItems
              items={view.items}
              removeLabel={labels.removeItem}
              decreaseLabel={labels.decreaseQuantity}
              increaseLabel={labels.increaseQuantity}
              pending={pending}
              onQuantity={changeQuantity}
              onRemove={removeCartItem}
            />
          )}
        </div>

        <CartDrawerTotals
          locale={locale}
          currency={displayCurrency}
          subtotalLabel={labels.subtotal}
          shippingLabel={labels.shipping}
          totalLabel={labels.total}
          checkoutLabel={labels.checkout}
          subtotalAmount={view?.subtotalAmount ?? 0}
          shippingAmount={view?.shippingAmount ?? 0}
          totalAmount={view?.totalAmount ?? 0}
          hasItems={hasItems}
          onCheckout={closeDrawer}
        />
      </SideSheet>

      {renderTrigger ? (
        renderTrigger({
          open,
          badgeCount,
          label: dictionary.nav.cart,
          openDrawer,
          prefetchDrawerView,
        })
      ) : (
        <button
          type="button"
          onClick={openDrawer}
          onPointerEnter={prefetchDrawerView}
          onFocus={prefetchDrawerView}
          className="inline-flex h-11 items-center gap-1 rounded-lg px-1 text-gray-700 transition-colors hover:text-gray-900"
          aria-label={dictionary.nav.cart}
          aria-expanded={open}
        >
          <span className="relative inline-flex h-11 w-11 items-center justify-center">
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {badgeCount > 0 ? (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff6b00] px-1 text-[10px] font-semibold text-white">
                {badgeCount > 99 ? "99+" : badgeCount}
              </span>
            ) : null}
          </span>
        </button>
      )}
    </>
  );
}
