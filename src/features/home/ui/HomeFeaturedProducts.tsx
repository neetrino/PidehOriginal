import { PidehPillButton } from "@/components/brand/PidehPillButton";
import { RevealOnView } from "@/components/motion/RevealOnView";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { cardShelf, pillPop, titleSweep } from "@/components/motion/presets";
import { HomeOrangeWave } from "@/features/home/ui/HomeOrangeWave";
import { HomeProductCard } from "@/features/home/ui/HomeProductCard";
import type { Locale } from "@/lib/i18n/config";

type FeaturedItem = {
  id: string;
  href: string;
  title: string;
  description?: string | null;
  priceFormatted: string;
  compareAtFormatted?: string | null;
  imageUrl: string | null;
  inStock: boolean;
  inWishlist?: boolean;
};

type HomeFeaturedProductsProps = {
  locale: Locale;
  title: string;
  viewAllLabel: string;
  viewAllHref: string;
  emptyLabel: string;
  wishlistLabel: string;
  orderLabel: string;
  isSignedIn: boolean;
  products: readonly FeaturedItem[];
};

/**
 * Figma Featured (1:389) on Rectangle 4 (1:82) orange drip over categories yellow.
 */
export function HomeFeaturedProducts({
  locale,
  title,
  viewAllLabel,
  viewAllHref,
  emptyLabel,
  wishlistLabel,
  orderLabel,
  isSignedIn,
  products,
}: HomeFeaturedProductsProps) {
  return (
    <section className="relative z-10 overflow-x-clip overflow-y-visible bg-[#ffcf48]">
      {/* Wavy orange starts at this section — does not overlap categories */}
      <HomeOrangeWave />

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 pt-28 pb-16 md:px-[51px] md:pt-[280px] md:pb-20">
        <div className="mb-10 flex flex-col gap-6 md:mb-[113px] md:flex-row md:items-end md:justify-between">
          <RevealOnView variants={titleSweep}>
            <h2
              className="font-display max-w-[891px] text-white"
              style={{
                fontSize: "clamp(2.75rem, 9.72vw, 8.75rem)",
                lineHeight: 0.78,
              }}
            >
              {title}
            </h2>
          </RevealOnView>
          <RevealOnView variants={pillPop} delay={0.12}>
            <PidehPillButton
              href={viewAllHref}
              label={viewAllLabel}
              tone="yellow"
              className="self-start md:self-auto md:mb-2"
            />
          </RevealOnView>
        </div>

        {products.length === 0 ? (
          <p className="text-white/90">{emptyLabel}</p>
        ) : (
          <StaggerGroup
            className="flex flex-wrap justify-center gap-[13px]"
            stagger={0.14}
          >
            {products.slice(0, 4).map((product, index) => (
              <StaggerItem key={product.id} variants={cardShelf}>
                <HomeProductCard
                  href={product.href}
                  title={product.title}
                  description={product.description}
                  priceFormatted={product.priceFormatted}
                  compareAtFormatted={product.compareAtFormatted}
                  imageUrl={product.imageUrl}
                  inStock={product.inStock}
                  priority={index < 4}
                  locale={locale}
                  productId={product.id}
                  inWishlist={product.inWishlist ?? false}
                  isSignedIn={isSignedIn}
                  wishlistLabel={wishlistLabel}
                  orderLabel={orderLabel}
                />
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </section>
  );
}
