"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import {
  NAV_DOCK_HEIGHT_PX,
  NavEllipse3469,
} from "@/components/layout/NavEllipse3469";
import { AppLink } from "@/components/ui/AppLink";
import { CartDrawer } from "@/features/cart/ui/CartDrawer";
import { MOBILE_HOME_ASSETS } from "@/features/home/ui/mobile/mobile-assets";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { Currency } from "@/lib/money/currency";

type MobileBottomNavProps = {
  locale: Locale;
  currency: Currency;
  dictionary: Dictionary;
  cartItemCount: number;
  wishlistCount: number;
  isSignedIn: boolean;
};

/** Figma Frame 1000002396 / 2395 icon sizes (268:538, 268:537). */
const ICON_CHEF = 46;
const ICON_CART = 44;
const ICON_HEART = 43;
const ICON_USER = 43;
const ICON_HOME = 75;
/** Gaps from Figma frames. */
const GAP_LEFT_PAIR = 28;
const GAP_RIGHT_PAIR = 27;

function isHomePath(pathname: string, locale: Locale): boolean {
  return pathname === `/${locale}` || pathname === `/${locale}/`;
}

function startsWithPath(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

function NavBadge({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className="absolute -top-1 -right-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#101828] px-1 text-[9px] font-semibold text-[#ffd54a]">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function NavGlyph({ src, size }: { src: string; size: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="block size-full object-contain"
      draggable={false}
    />
  );
}

type IconButtonProps = {
  size: number;
  children: ReactNode;
  className?: string;
  nodeId?: string;
};

function IconHit({ size, children, className = "", nodeId }: IconButtonProps) {
  return (
    <div
      data-node-id={nodeId}
      className={`relative flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}

/**
 * Figma Nav Bar (268:525) + Frame 1000002396 (268:538) icon pair.
 * Left pair chef+cart (gap 28), right pair heart+user (gap 27), home in center dip.
 *
 * @see https://www.figma.com/design/zyLVZFDhohLYxwuohIrPDN/Pideh-Dev?node-id=268-538
 */
export function MobileBottomNav({
  locale,
  currency,
  dictionary,
  cartItemCount,
  wishlistCount,
  isSignedIn,
}: MobileBottomNavProps) {
  const pathname = usePathname() ?? `/${locale}`;
  const profileHref = isSignedIn
    ? `/${locale}/profile`
    : `/${locale}/login`;
  const homeActive = isHomePath(pathname, locale);
  const shopActive = startsWithPath(pathname, `/${locale}/products`);
  const wishlistActive = startsWithPath(pathname, `/${locale}/wishlist`);
  const profileActive =
    startsWithPath(pathname, `/${locale}/profile`) ||
    startsWithPath(pathname, `/${locale}/login`);

  return (
    <nav
      aria-label={dictionary.nav.navigation}
      data-node-id="268:525"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center overflow-visible md:hidden"
    >
      <div
        className="pointer-events-auto relative w-full max-w-[440px] overflow-visible pb-[max(0.2rem,env(safe-area-inset-bottom))]"
        style={{ height: NAV_DOCK_HEIGHT_PX }}
      >
        <NavEllipse3469 />

        {/*
          Icon row sits in the orange band (below the curve lip).
          Home is raised into the center dip; side pairs share one baseline.
        */}
        <div
          data-node-id="268:539"
          className="absolute inset-x-0 z-10 flex items-end justify-between px-5"
          style={{ top: "24%", bottom: "26%" }}
        >
          {/* Frame 1000002396 — chef + cart */}
          <div
            data-node-id="268:538"
            className="flex items-center"
            style={{ gap: GAP_LEFT_PAIR }}
          >
            <IconHit size={ICON_CHEF} nodeId="268:529">
              <AppLink
                href={`/${locale}/products`}
                prefetchPolicy="intent"
                aria-label={dictionary.nav.shop}
                aria-current={shopActive ? "page" : undefined}
                className="flex size-full items-center justify-center"
              >
                <NavGlyph
                  src={MOBILE_HOME_ASSETS.navChef}
                  size={ICON_CHEF}
                />
              </AppLink>
            </IconHit>

            <IconHit size={ICON_CART} nodeId="268:531">
              <CartDrawer
                locale={locale}
                currency={currency}
                dictionary={dictionary}
                itemCount={cartItemCount}
                renderTrigger={({
                  open,
                  badgeCount,
                  label,
                  openDrawer,
                  prefetchDrawerView,
                }) => (
                  <button
                    type="button"
                    onClick={openDrawer}
                    onPointerEnter={prefetchDrawerView}
                    onFocus={prefetchDrawerView}
                    aria-label={label}
                    aria-expanded={open}
                    className="relative flex size-full items-center justify-center"
                  >
                    <NavGlyph
                      src={MOBILE_HOME_ASSETS.navCart}
                      size={ICON_CART}
                    />
                    <NavBadge count={badgeCount} />
                  </button>
                )}
              />
            </IconHit>
          </div>

          {/* Home — center dip (268:527) */}
          <IconHit size={ICON_HOME} className="-mb-1 -translate-y-3" nodeId="268:527">
            <AppLink
              href={`/${locale}`}
              prefetchPolicy="intent"
              aria-label={dictionary.nav.home}
              aria-current={homeActive ? "page" : undefined}
              className="flex size-full items-center justify-center"
            >
              <NavGlyph src={MOBILE_HOME_ASSETS.navHome} size={ICON_HOME} />
            </AppLink>
          </IconHit>

          {/* Frame 1000002395 — heart + user */}
          <div
            data-node-id="268:537"
            className="flex items-center"
            style={{ gap: GAP_RIGHT_PAIR }}
          >
            <IconHit size={ICON_HEART} nodeId="268:533">
              <AppLink
                href={`/${locale}/wishlist`}
                prefetchPolicy="intent"
                aria-label={dictionary.nav.wishlist}
                aria-current={wishlistActive ? "page" : undefined}
                className="relative flex size-full items-center justify-center"
              >
                <NavGlyph
                  src={MOBILE_HOME_ASSETS.navHeart}
                  size={ICON_HEART}
                />
                <NavBadge count={wishlistCount} />
              </AppLink>
            </IconHit>

            <IconHit size={ICON_USER} nodeId="268:535">
              <AppLink
                href={profileHref}
                prefetchPolicy="intent"
                aria-label={dictionary.header.profile}
                aria-current={profileActive ? "page" : undefined}
                className="flex size-full items-center justify-center"
              >
                <NavGlyph
                  src={MOBILE_HOME_ASSETS.navUser}
                  size={ICON_USER}
                />
              </AppLink>
            </IconHit>
          </div>
        </div>
      </div>
    </nav>
  );
}
