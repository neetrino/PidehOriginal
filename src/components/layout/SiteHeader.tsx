import { Suspense } from "react";

import { SiteHeaderMainNav } from "@/components/layout/SiteHeaderMainNav";
import { getStorefrontCartItemCount } from "@/features/cart/get-cart-drawer-view";
import { getWishlistCount } from "@/features/wishlist/queries";
import { getCurrentUser } from "@/lib/auth/session";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { Currency } from "@/lib/money/currency";

type SiteHeaderProps = {
  locale: Locale;
  currency: Currency;
  dictionary: Dictionary;
};

function HeaderControlsFallback() {
  return (
    <div
      className="h-11 w-28 animate-pulse rounded-lg bg-gray-100"
      aria-hidden="true"
    />
  );
}

async function SiteHeaderMainNavAsync({
  locale,
  currency,
  dictionary,
}: SiteHeaderProps) {
  const navItems = [
    { href: `/${locale}`, label: dictionary.nav.home },
    { href: `/${locale}/products`, label: dictionary.nav.menu },
    { href: `/${locale}/about`, label: dictionary.nav.about },
    { href: `/${locale}/contact`, label: dictionary.nav.contact },
    { href: `/${locale}/blog`, label: dictionary.nav.blog },
  ] as const;

  const [user, cartItemCount, wishlistCount] = await Promise.all([
    getCurrentUser(),
    getStorefrontCartItemCount(),
    getWishlistCount(),
  ]);

  return (
    <SiteHeaderMainNav
      locale={locale}
      currency={currency}
      dictionary={dictionary}
      user={user}
      navItems={navItems}
      cartItemCount={cartItemCount}
      wishlistCount={wishlistCount}
    />
  );
}

/**
 * Storefront chrome: account/cart/wishlist load in a Suspense island
 * so page content is not blocked.
 */
export function SiteHeader({ locale, currency, dictionary }: SiteHeaderProps) {
  return (
    <div
      className="site-header sticky top-0 z-[80] shrink-0"
      data-site-header
    >
      <Suspense
        fallback={
          <header className="relative z-10 px-3 pt-3 md:px-6 md:pt-3.5 lg:px-10">
            <div className="mx-auto flex h-16 max-w-[1311px] items-center justify-between rounded-[90px] bg-white px-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:h-20">
              <span className="text-lg font-semibold tracking-tight text-gray-900">
                {dictionary.brand}
              </span>
              <HeaderControlsFallback />
            </div>
          </header>
        }
      >
        <SiteHeaderMainNavAsync
          locale={locale}
          currency={currency}
          dictionary={dictionary}
        />
      </Suspense>
    </div>
  );
}
