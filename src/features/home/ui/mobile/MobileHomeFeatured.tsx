import { MobileFrame440 } from "@/features/home/ui/mobile/MobileFrame440";
import { MobileProductCard } from "@/features/home/ui/mobile/MobileProductCard";
import type { Locale } from "@/lib/i18n/config";

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

type MobileHomeFeaturedProps = {
  locale: Locale;
  emptyLabel: string;
  wishlistLabel: string;
  addLabel: string;
  ratingLabel: string;
  prepTimeLabel: string;
  isSignedIn: boolean;
  products: readonly FeaturedItem[];
};

/** Two Figma product rows (260:547 + 260:959): 372 + (953-588-372) + 372 = 737. */
const FEATURED_FRAME_HEIGHT = 737;

/**
 * Figma product grid in the 440 design space (same scale as the hero band).
 * Keeps cards at exactly 200×340 so Button 8 never overflows into the orange page.
 */
export function MobileHomeFeatured({
  locale,
  emptyLabel,
  wishlistLabel,
  addLabel,
  ratingLabel,
  prepTimeLabel,
  isSignedIn,
  products,
}: MobileHomeFeaturedProps) {
  if (products.length === 0) {
    return (
      <section className="relative z-20 px-4 pb-8">
        <p className="text-white/90">{emptyLabel}</p>
      </section>
    );
  }

  return (
    <section className="relative z-20 pb-2">
      <MobileFrame440 height={FEATURED_FRAME_HEIGHT}>
        <div className="box-border px-[14px]">
          <div className="grid grid-cols-2 gap-x-[11px] gap-y-0">
            {products.slice(0, 4).map((product, index) => (
              <div
                key={product.id}
                className="relative flex h-[372px] justify-center pt-4"
              >
                <MobileProductCard
                  href={product.href}
                  title={product.title}
                  description={product.description}
                  priceFormatted={product.priceFormatted}
                  imageUrl={product.imageUrl}
                  inStock={product.inStock}
                  priority={index < 2}
                  locale={locale}
                  productId={product.id}
                  inWishlist={product.inWishlist ?? false}
                  isSignedIn={isSignedIn}
                  wishlistLabel={wishlistLabel}
                  addLabel={addLabel}
                  ratingLabel={ratingLabel}
                  prepTimeLabel={prepTimeLabel}
                />
              </div>
            ))}
          </div>
        </div>
      </MobileFrame440>
    </section>
  );
}
