'use client';

import Image from 'next/image';

import { MobileNavDrawer } from '@/components/layout/MobileNavDrawer';
import { AppLink } from '@/components/ui/AppLink';
import { MOBILE_HOME_ASSETS } from '@/features/home/ui/mobile/mobile-assets';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import type { Currency } from '@/lib/money/currency';

type MobileBrandBarProps = {
  locale: Locale;
  dictionary: Dictionary;
  phoneHref: string;
  phoneLabel: string;
  /** Enables the language/currency switcher inside the nav drawer. */
  currency?: Currency;
  /** Positioning classes — the row itself only owns its inner layout. */
  className?: string;
};

/**
 * Figma 366:576 / 260:488 — logo on the left, burger + call pill on the right.
 * The pill artwork is a single SVG with two invisible hit areas over it.
 */
export function MobileBrandBar({
  locale,
  dictionary,
  phoneHref,
  phoneLabel,
  currency,
  className = '',
}: MobileBrandBarProps) {
  const navItems = [
    { href: `/${locale}`, label: dictionary.nav.home },
    { href: `/${locale}/products`, label: dictionary.nav.menu },
    { href: `/${locale}/about`, label: dictionary.nav.about },
    { href: `/${locale}/contact`, label: dictionary.nav.contact },
    { href: `/${locale}/blog`, label: dictionary.nav.blog },
  ] as const;

  return (
    <div data-site-header className={className}>
      {/* Figma 366:577 — the export carries transparent padding the frame crops. */}
      <AppLink
        href={`/${locale}`}
        prefetchPolicy="intent"
        className="relative h-[75px] w-[92px] shrink-0 overflow-hidden"
        aria-label={dictionary.brand}
      >
        <Image
          src={MOBILE_HOME_ASSETS.logo}
          alt={dictionary.brand}
          fill
          sizes="92px"
          className="object-cover object-top"
          priority
        />
      </AppLink>

      <div className="relative h-14 w-[113px] shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={MOBILE_HOME_ASSETS.menuUser}
          alt=""
          width={113}
          height={56}
          className="pointer-events-none absolute inset-0 size-full"
          aria-hidden="true"
        />
        <MobileNavDrawer
          locale={locale}
          dictionary={dictionary}
          currency={currency}
          navItems={navItems}
          triggerClassName="absolute inset-y-0 left-0 z-10 w-[52%] touch-manipulation bg-transparent"
          triggerContent={<span className="sr-only">{dictionary.nav.openMenu}</span>}
        />
        <a
          href={phoneHref}
          className="absolute inset-y-0 right-0 z-10 w-[48%] touch-manipulation"
          aria-label={phoneLabel}
        />
      </div>
    </div>
  );
}
