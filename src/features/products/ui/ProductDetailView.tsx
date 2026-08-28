import { ProductDetailBreadcrumb } from "@/features/products/ui/ProductDetailBreadcrumb";
import { ProductDetailConfigurator } from "@/features/products/ui/ProductDetailConfigurator";
import type { ProductDetail } from "@/features/products/types";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { Currency } from "@/lib/money/currency";

type ProductDetailViewProps = {
  locale: Locale;
  currency: Currency;
  fxRate: string;
  product: ProductDetail;
  isSignedIn: boolean;
  inWishlist: boolean;
  dictionary: Dictionary;
  jsonLd: Record<string, unknown>;
  relatedSlot: React.ReactNode;
};

export function ProductDetailView({
  locale,
  currency,
  fxRate,
  product,
  isSignedIn,
  inWishlist,
  dictionary,
  jsonLd,
  relatedSlot,
}: ProductDetailViewProps) {
  const labels = dictionary.product;

  return (
    <article className="flex flex-col">
      <div className="px-3 pt-6 pb-20 sm:px-6 md:pt-8 md:pb-28 lg:px-10">
        <div className="mx-auto w-full max-w-[1311px]">
        <ProductDetailBreadcrumb
          catalogHref={`/${locale}/products`}
          backLabel={dictionary.catalog.back}
          catalogLabel={dictionary.catalog.title}
          productTitle={product.translation.title}
        />

        <ProductDetailConfigurator
          locale={locale}
          currency={currency}
          fxRate={fxRate}
          productId={product.id}
          title={product.translation.title}
          description={product.translation.description}
          images={product.images}
          discountPercent={product.discountPercent}
          stockOnHand={product.stockOnHand}
          basePriceAmount={product.priceAmount}
          compareAtAmount={product.compareAtAmount}
          additions={product.additions ?? []}
          exceptions={product.exceptions ?? []}
          inWishlist={inWishlist}
          isSignedIn={isSignedIn}
          wishlistLabel={dictionary.nav.wishlist}
          labels={{
            ingredients: labels.ingredients,
            additions: labels.additions,
            exceptions: labels.exceptions,
            extraPriceHint: labels.extraPriceHint,
            quantity: labels.quantity,
            decreaseQuantity: dictionary.cartDrawer.decreaseQuantity,
            increaseQuantity: dictionary.cartDrawer.increaseQuantity,
            addToCart: labels.addToCart,
            adding: labels.adding,
            outOfStock: labels.outOfStock,
            added: labels.added,
            error: labels.addError,
            resetSelection: labels.resetSelection,
            orderSummary: labels.orderSummary,
            basePrice: labels.basePrice,
            total: labels.total,
            size: labels.size,
            sizeSmall: labels.sizeSmall,
            sizeMedium: labels.sizeMedium,
            sizeLarge: labels.sizeLarge,
            dough: labels.dough,
            doughThin: labels.doughThin,
            doughThick: labels.doughThick,
            specialRequests: labels.specialRequests,
            specialRequestsPlaceholder: labels.specialRequestsPlaceholder,
          }}
        />

        {relatedSlot}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}
