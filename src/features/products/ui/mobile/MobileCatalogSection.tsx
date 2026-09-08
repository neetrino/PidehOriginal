import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { MOBILE_HOME_ASSETS } from "@/features/home/ui/mobile/mobile-assets";
import {
  MobileProductGrid,
  type MobileGridProduct,
} from "@/features/home/ui/mobile/MobileProductGrid";
import type { Locale } from "@/lib/i18n/config";

type MobileCatalogSectionProps = {
  locale: Locale;
  title: string;
  /** Omitted when the section already shows the full category. */
  seeAllHref: string | null;
  seeAllLabel: string;
  products: readonly MobileGridProduct[];
  isSignedIn: boolean;
  wishlistLabel: string;
  addLabel: string;
  ratingLabel: string;
  prepTimeLabel: string;
  priorityCount?: number;
};

/** Figma 366:822 — display heading with a yellow "see all" pill, then the 2×N grid. */
export function MobileCatalogSection({
  locale,
  title,
  seeAllHref,
  seeAllLabel,
  products,
  isSignedIn,
  wishlistLabel,
  addLabel,
  ratingLabel,
  prepTimeLabel,
  priorityCount = 0,
}: MobileCatalogSectionProps) {
  return (
    <section className="pt-10">
      <div className="flex items-end justify-between gap-4 px-6">
        <h2 className="font-display min-w-0 text-[clamp(2.25rem,11vw,3.125rem)] leading-[0.84] break-words text-white">
          {title}
        </h2>
        {seeAllHref ? (
          <AppLink
            href={seeAllHref}
            prefetchPolicy="intent"
            aria-label={seeAllLabel}
            className="flex h-[52px] shrink-0 items-center rounded-[42px] bg-[#ffd54a] px-6 transition active:scale-95"
          >
            <Image
              src={MOBILE_HOME_ASSETS.viewAllArrow}
              alt=""
              width={20}
              height={20}
              className="size-5"
            />
          </AppLink>
        ) : null}
      </div>

      <div className="mt-3">
        <MobileProductGrid
          locale={locale}
          products={products}
          isSignedIn={isSignedIn}
          wishlistLabel={wishlistLabel}
          addLabel={addLabel}
          ratingLabel={ratingLabel}
          prepTimeLabel={prepTimeLabel}
          priorityCount={priorityCount}
        />
      </div>
    </section>
  );
}
