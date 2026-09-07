"use client";

import Image from "next/image";

import { MobileNavDrawer } from "@/components/layout/MobileNavDrawer";
import { AppLink } from "@/components/ui/AppLink";
import { MOBILE_HOME_ASSETS } from "@/features/home/ui/mobile/mobile-assets";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

type MobileHomeHeaderProps = {
  locale: Locale;
  dictionary: Dictionary;
  phoneHref: string;
  phoneLabel: string;
};

/**
 * Figma 260:488 — logo + menu/phone, centered row at y=49.
 */
export function MobileHomeHeader({
  locale,
  dictionary,
  phoneHref,
  phoneLabel,
}: MobileHomeHeaderProps) {
  const navItems = [
    { href: `/${locale}`, label: dictionary.nav.home },
    { href: `/${locale}/products`, label: dictionary.nav.menu },
    { href: `/${locale}/about`, label: dictionary.nav.about },
    { href: `/${locale}/contact`, label: dictionary.nav.contact },
    { href: `/${locale}/blog`, label: dictionary.nav.blog },
  ] as const;

  return (
    <div className="absolute top-[49px] left-1/2 z-40 flex -translate-x-1/2 items-end justify-center gap-[179px]">
      <AppLink
        href={`/${locale}`}
        prefetchPolicy="intent"
        className="relative h-[75px] w-[92px] shrink-0"
        aria-label={dictionary.brand}
      >
        <Image
          src={MOBILE_HOME_ASSETS.logo}
          alt={dictionary.brand}
          fill
          sizes="92px"
          className="object-contain object-left mix-blend-multiply"
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
          navItems={navItems}
          triggerClassName="absolute inset-y-0 left-0 z-10 w-[52%] touch-manipulation bg-transparent"
          triggerContent={
            <span className="sr-only">{dictionary.nav.openMenu}</span>
          }
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
