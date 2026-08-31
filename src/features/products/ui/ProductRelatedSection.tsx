import { PidehPillButton } from "@/components/brand/PidehPillButton";
import { HomeProductCard } from "@/features/home/ui/HomeProductCard";
import { getRelatedProducts } from "@/features/products/queries";
import { getWishlistProductIds } from "@/features/wishlist/queries";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { createDisplayPriceFormatter } from "@/lib/money/display-price";
import type { Currency } from "@/lib/money/currency";

type ProductRelatedSectionProps = {
  locale: Locale;
  productId: string;
  currency: Currency;
  isSignedIn: boolean;
  dictionary: Dictionary;
};

/** Streams below the PDP fold — does not block gallery/purchase chrome. */
export async function ProductRelatedSection({
  locale,
  productId,
  currency,
  isSignedIn,
  dictionary,
}: ProductRelatedSectionProps) {
  const related = await getRelatedProducts(locale, productId);
  const menuButton = (
    <PidehPillButton
      href={`/${locale}/products`}
      label={dictionary.home.viewAll}
      tone="yellow"
    />
  );

  if (related.length === 0) {
    return (
      <section className="mt-16 flex justify-center md:mt-20">{menuButton}</section>
    );
  }

  const [wishlistIds, formatPrice] = await Promise.all([
    getWishlistProductIds(related.map((item) => item.id)),
    createDisplayPriceFormatter(locale, currency),
  ]);

  const labels = dictionary.product;

  return (
    <section className="mt-16 flex flex-col gap-8 md:mt-20">
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
        <h2 className="min-w-0 font-display text-[clamp(2.5rem,8vw,5rem)] leading-[0.95] text-white">
          {labels.related}
        </h2>
        <div className="shrink-0">{menuButton}</div>
      </div>
      <div className="grid w-full grid-cols-1 justify-items-stretch gap-[13px] overflow-visible sm:grid-cols-2 lg:grid-cols-4">
        {related.map((item) => {
          const price = formatPrice(item.priceAmount);
          const compareAt =
            item.compareAtAmount != null
              ? formatPrice(item.compareAtAmount)
              : null;

          return (
            <HomeProductCard
              key={item.id}
              href={`/${locale}/products/${item.translation.slug}`}
              title={item.translation.title}
              description={item.translation.description ?? null}
              priceFormatted={price.formatted}
              compareAtFormatted={compareAt?.formatted ?? null}
              imageUrl={item.imageUrl}
              inStock={item.stockOnHand > 0}
              locale={locale}
              productId={item.id}
              inWishlist={wishlistIds.has(item.id)}
              isSignedIn={isSignedIn}
              wishlistLabel={dictionary.nav.wishlist}
              orderLabel={dictionary.home.orderCta}
              outOfStockLabel={labels.outOfStock}
              ratingLabel={labels.cardRating}
              prepTimeLabel={labels.prepTime}
              className="max-w-none"
            />
          );
        })}
      </div>
    </section>
  );
}
