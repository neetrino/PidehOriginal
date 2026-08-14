import { PidehPillButton } from "@/components/brand/PidehPillButton";
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
    <section className="relative -mt-[100px] overflow-x-clip bg-[#ff6b00] md:-mt-[160px]">
      {/* Figma Rectangle 4 (1:82) — orange wave; yellow categories band shows in drip */}
      <div className="absolute inset-x-0 top-0 z-0 w-[115%] max-w-none -translate-x-[6%]">
        <HomeOrangeWave />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 pt-36 pb-16 md:px-10 md:pt-48 md:pb-20 lg:px-14">
        <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <h2
            className="font-display max-w-[14ch] text-white"
            style={{ fontSize: "clamp(2.75rem, 7vw, 7rem)" }}
          >
            {title}
          </h2>
          <PidehPillButton
            href={viewAllHref}
            label={viewAllLabel}
            tone="yellow"
            className="self-start md:self-auto"
          />
        </div>

        {products.length === 0 ? (
          <p className="text-white/90">{emptyLabel}</p>
        ) : (
          <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((product, index) => (
              <HomeProductCard
                key={product.id}
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
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
