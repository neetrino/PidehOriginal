import { NAV_DOCK_HEIGHT_PX } from "@/components/layout/NavEllipse3469";
import { MobileEllipse3469 } from "@/features/home/ui/mobile/MobileEllipse3469";
import { MobileFrame440 } from "@/features/home/ui/mobile/MobileFrame440";
import { MobileHomeBranches } from "@/features/home/ui/mobile/MobileHomeBranches";
import { MobileHomeFeatured } from "@/features/home/ui/mobile/MobileHomeFeatured";
import {
  MOBILE_FEATURE_LAYOUT,
  MobileHomeFeatures,
} from "@/features/home/ui/mobile/MobileHomeFeatures";
import { MobileHomeHeader } from "@/features/home/ui/mobile/MobileHomeHeader";
import { MobileHomeHero } from "@/features/home/ui/mobile/MobileHomeHero";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

/**
 * Figma top band through product grid start (y=588).
 * Includes drip, chrome, arc, arrows, featured title + view-all CTA.
 */
const MOBILE_TOP_BAND_HEIGHT = 588;

/** Gap between copyright and fixed nav — dock height minus a bit of empty orange. */
const COPYRIGHT_NAV_CLEARANCE_PX = NAV_DOCK_HEIGHT_PX - 48;

type FeaturedItem = {
  id: string;
  href: string;
  title: string;
  description?: string | null;
  priceFormatted: string;
  imageUrl: string | null;
  inStock: boolean;
  inWishlist?: boolean;
};

type CategoryItem = {
  id: string;
  title: string;
  href: string;
  imageUrl: string | null;
};

type MobileHomeProps = {
  locale: Locale;
  dictionary: Dictionary;
  categories: readonly CategoryItem[];
  products: readonly FeaturedItem[];
  isSignedIn: boolean;
  ratingLabel: string;
  prepTimeLabel: string;
};

function splitFeaturedTitle(title: string): { line1: string; line2: string } {
  const parts = title.trim().split(/\s+/);
  if (parts.length <= 1) {
    return { line1: title, line2: "" };
  }
  return {
    line1: parts[0] ?? title,
    line2: parts.slice(1).join(" "),
  };
}

function toTelHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/**
 * Full mobile home composition from Figma node 259:369 (440×2973).
 */
export function MobileHome({
  locale,
  dictionary,
  categories,
  products,
  isSignedIn,
  ratingLabel,
  prepTimeLabel,
}: MobileHomeProps) {
  const home = dictionary.home;
  const contact = dictionary.contact;
  const featuredTitle = splitFeaturedTitle(home.featuredTitle);
  const phoneHref = toTelHref(contact.storePhone);
  const year = new Date().getFullYear();
  const copyright = dictionary.footer.copyright.replace("{year}", String(year));
  const [copyrightLead, copyrightBrand] = copyright.split("Neetrino IT Company");

  const featureTitles = {
    delivery: home.features.deliveryTitle,
    prep: home.features.prepTitle,
    quality: home.features.qualityTitle,
    support: home.features.supportTitle,
  } as const;

  const branches = [
    {
      id: "branch-1",
      address: contact.storeAddress,
      phoneHref,
      contactLabel: home.branchContact,
    },
    {
      id: "branch-2",
      address: contact.storeAddressSecondary,
      phoneHref,
      contactLabel: home.branchContact,
    },
  ];

  return (
    <div
      className="pideh-home-mobile relative mx-auto w-full max-w-[440px] overflow-x-clip bg-[#ff6b00] md:hidden [overflow-clip-margin:28px]"
      style={{
        paddingBottom: COPYRIGHT_NAV_CLEARANCE_PX,
      }}
    >
      <MobileFrame440 height={MOBILE_TOP_BAND_HEIGHT}>
        <MobileEllipse3469 />

        <MobileHomeHeader
          locale={locale}
          dictionary={dictionary}
          phoneHref={phoneHref}
          phoneLabel={contact.callTitle}
        />

        <MobileHomeHero
          locale={locale}
          searchLabel={home.searchPlaceholder}
          pideLabel={home.categoryPideLabel}
          arcTitles={home.categoryArcTitles}
          categories={categories}
          prevLabel={home.categoryPrev}
          nextLabel={home.categoryNext}
          titleLine1={featuredTitle.line1}
          titleLine2={featuredTitle.line2}
          viewAllHref={`/${locale}/products`}
          viewAllLabel={home.viewAllMenu}
        />
      </MobileFrame440>

      <MobileHomeFeatured
        locale={locale}
        emptyLabel={home.emptyFeatured}
        wishlistLabel={dictionary.nav.wishlist}
        addLabel={home.orderCta}
        ratingLabel={ratingLabel}
        prepTimeLabel={prepTimeLabel}
        isSignedIn={isSignedIn}
        products={products}
      />

      <MobileHomeFeatures
        titleLine1={home.whyUsTitleLine1}
        titleLine2={home.whyUsTitleLine2}
        items={MOBILE_FEATURE_LAYOUT.map((visual) => ({
          ...visual,
          title: featureTitles[visual.key],
        }))}
      />

      <MobileHomeBranches
        titleLine1={home.branchesTitleLine1}
        titleLine2={home.branchesTitleLine2}
        branches={branches}
      />

      <p className="mx-auto max-w-[340px] px-4 text-center text-base leading-[21px] tracking-[0.35px] text-[#1e1e1e]">
        <span>{copyrightLead}</span>
        <i className="not-italic font-bold text-[#ffd54a]">
          Neetrino IT Company
        </i>
        {copyrightBrand}
      </p>
    </div>
  );
}
