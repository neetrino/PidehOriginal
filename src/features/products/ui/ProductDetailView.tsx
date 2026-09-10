import { PAGE_CONTAINER } from '@/components/layout/page-container';
import { ProductDetailBreadcrumb } from '@/features/products/ui/ProductDetailBreadcrumb';
import { ProductDetailConfigurator } from '@/features/products/ui/ProductDetailConfigurator';
import type { ProductDetail } from '@/features/products/types';
import { MobileProductDetail } from '@/features/products/ui/mobile/MobileProductDetail';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/config';
import type { Currency } from '@/lib/money/currency';

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
  const configuratorLabels = {
    ingredients: labels.ingredients,
    additions: labels.additions,
    exceptions: labels.exceptions,
    extraPriceHint: labels.extraPriceHint,
    quantity: labels.quantity,
    decreaseQuantity: dictionary.cartDrawer.decreaseQuantity,
    increaseQuantity: dictionary.cartDrawer.increaseQuantity,
    addToCart: labels.addToCart,
    outOfStock: labels.outOfStock,
    error: labels.addError,
    resetSelection: labels.resetSelection,
    specialRequests: labels.specialRequests,
    specialRequestsPlaceholder: labels.specialRequestsPlaceholder,
  };
  const configurator = {
    locale,
    currency,
    fxRate,
    productId: product.id,
    title: product.translation.title,
    description: product.translation.description,
    images: product.images,
    discountPercent: product.discountPercent,
    stockOnHand: product.stockOnHand,
    basePriceAmount: product.priceAmount,
    compareAtAmount: product.compareAtAmount,
    additions: product.additions ?? [],
    exceptions: product.exceptions ?? [],
    inWishlist,
    isSignedIn,
    wishlistLabel: dictionary.nav.wishlist,
    labels: configuratorLabels,
  };

  return (
    <div>
      <MobileProductDetail {...configurator} backLabel={dictionary.catalog.back} />

      <article className="hidden flex-col md:flex">
        <div className="pt-6 pb-20 md:pt-8 md:pb-28">
          <div className={PAGE_CONTAINER}>
            <ProductDetailBreadcrumb
              catalogHref={`/${locale}/products`}
              backLabel={dictionary.catalog.back}
              catalogLabel={dictionary.catalog.title}
              productTitle={product.translation.title}
            />

            <ProductDetailConfigurator {...configurator} />

            {relatedSlot}
          </div>
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
