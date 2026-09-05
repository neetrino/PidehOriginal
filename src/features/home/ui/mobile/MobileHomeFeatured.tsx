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

/**
 * Figma product row on 440 frame:
 * — wall → white card ≈ 14px orange
 * — between white cards ≈ 11px orange
 * Fixed 427px rows were clipped by overflow-x and ate the wall space;
 * fluid 2-col grid keeps Figma proportions on every width.
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
    <section className="relative z-20 box-border px-[14px] pb-8">
      <div className="mx-auto grid w-full max-w-[412px] grid-cols-2 gap-x-[11px] gap-y-3">
        {products.slice(0, 4).map((product, index) => (
          <MobileProductCard
            key={product.id}
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
        ))}
      </div>
    </section>
  );
}
