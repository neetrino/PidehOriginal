import { MobileBrandBar } from '@/components/layout/MobileBrandBar';
import { MobileHeaderSearch } from '@/components/layout/MobileHeaderSearch';
import {
  MOBILE_STOREFRONT_COLUMN,
  MOBILE_STOREFRONT_SHELL,
} from '@/components/layout/page-container';
import { toTelHref } from '@/lib/contact/tel-href';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import type { Currency } from '@/lib/money/currency';

type MobileStorefrontHeaderProps = {
  locale: Locale;
  currency: Currency;
  dictionary: Dictionary;
};

/**
 * Shared mobile chrome for every storefront page (Figma 366:464 header band):
 * brand row plus the back / search row. Hidden on landscape tablets and
 * desktop, where {@link import("./SiteHeader").SiteHeader} takes over.
 */
export function MobileStorefrontHeader({
  locale,
  currency,
  dictionary,
}: MobileStorefrontHeaderProps) {
  const contact = dictionary.contact;

  return (
    <div className={`${MOBILE_STOREFRONT_SHELL} mobile-storefront-header`}>
      <div className={`${MOBILE_STOREFRONT_COLUMN} px-6 pt-6`}>
        <MobileBrandBar
          locale={locale}
          dictionary={dictionary}
          currency={currency}
          phoneHref={toTelHref(contact.storePhone)}
          phoneLabel={contact.callTitle}
          className="flex items-end justify-between gap-4"
        />
        <div className="pt-4">
          <MobileHeaderSearch
            locale={locale}
            backLabel={dictionary.catalog.back}
            searchLabel={dictionary.catalog.searchLabel}
            searchPlaceholder={dictionary.home.searchPlaceholder}
          />
        </div>
      </div>
    </div>
  );
}
