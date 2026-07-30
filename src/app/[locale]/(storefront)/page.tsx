import { notFound } from "next/navigation";

import { listStorefrontCategories } from "@/features/categories/application/list-storefront-categories";
import { listActiveHeroSlides } from "@/features/hero/application/queries";
import { HomeAboutTeaser } from "@/features/home/ui/HomeAboutTeaser";
import { HomeCategories } from "@/features/home/ui/HomeCategories";
import { HomeFeaturedProducts } from "@/features/home/ui/HomeFeaturedProducts";
import {
  HOME_FEATURE_ICONS,
  HomeFeatures,
} from "@/features/home/ui/HomeFeatures";
import { HomeHero } from "@/features/home/ui/HomeHero";
import {
  getFeaturedProducts,
  getOfferProducts,
  type CatalogProduct,
} from "@/features/products/queries";
import { getWishlistProductIds } from "@/features/wishlist/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  createDisplayPriceFormatter,
  getSelectedCurrency,
} from "@/lib/money/display-price";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

type DisplayPriceFormatter = Awaited<
  ReturnType<typeof createDisplayPriceFormatter>
>;

function toProductCards(
  products: CatalogProduct[],
  locale: Locale,
  formatPrice: DisplayPriceFormatter,
  wishlistIds: Set<string>,
) {
  return products.map((product) => {
    const price = formatPrice(product.priceAmount);
    const compareAt =
      product.compareAtAmount != null
        ? formatPrice(product.compareAtAmount)
        : null;

    return {
      id: product.id,
      href: `/${locale}/products/${product.translation.slug}`,
      title: product.translation.title,
      priceFormatted: price.formatted,
      compareAtFormatted: compareAt?.formatted ?? null,
      discountPercent: product.discountPercent,
      imageUrl: product.imageUrl,
      inStock: product.stockOnHand > 0,
      inWishlist: wishlistIds.has(product.id),
    };
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const dictionary = getDictionary(locale);
  const [heroSlides, categories, featuredProducts, offerProducts, currency, user] =
    await Promise.all([
      listActiveHeroSlides(locale),
      listStorefrontCategories(locale),
      getFeaturedProducts(locale),
      getOfferProducts(locale),
      getSelectedCurrency(),
      getCurrentUser(),
    ]);

  const productIds = [
    ...new Set([
      ...featuredProducts.map((product) => product.id),
      ...offerProducts.map((product) => product.id),
    ]),
  ];

  const [wishlistIds, formatPrice] = await Promise.all([
    getWishlistProductIds(productIds),
    createDisplayPriceFormatter(locale, currency),
  ]);

  const featuredCards = toProductCards(
    featuredProducts,
    locale,
    formatPrice,
    wishlistIds,
  );
  const offerCards = toProductCards(
    offerProducts,
    locale,
    formatPrice,
    wishlistIds,
  );

  return (
    <div className="-mx-4 -my-10 sm:-mx-6 lg:-mx-8">
      <HomeHero
        slides={heroSlides}
        fallbackTitle={dictionary.home.title}
        fallbackSubtitle={dictionary.home.subtitle}
        fallbackCtaLabel={dictionary.home.cta}
        fallbackCtaHref={`/${locale}/products`}
      />

      <HomeCategories
        title={dictionary.home.categoriesTitle}
        emptyLabel={dictionary.home.emptyCategories}
        categories={categories.map((category) => ({
          id: category.id,
          title: category.title,
          href: `/${locale}/products?category=${encodeURIComponent(category.slug)}`,
          imageUrl: category.imageUrl,
        }))}
      />

      <HomeFeaturedProducts
        locale={locale}
        title={dictionary.home.featuredTitle}
        viewAllLabel={dictionary.home.viewAll}
        viewAllHref={`/${locale}/products`}
        emptyLabel={dictionary.home.emptyFeatured}
        wishlistLabel={dictionary.nav.wishlist}
        addToCartLabel={dictionary.product.addToCart}
        isSignedIn={Boolean(user)}
        products={featuredCards}
      />

      <HomeFeaturedProducts
        locale={locale}
        title={dictionary.home.offersTitle}
        viewAllLabel={dictionary.home.viewAll}
        viewAllHref={`/${locale}/products`}
        emptyLabel={dictionary.home.emptyOffers}
        wishlistLabel={dictionary.nav.wishlist}
        addToCartLabel={dictionary.product.addToCart}
        isSignedIn={Boolean(user)}
        products={offerCards}
      />

      <HomeFeatures
        title={dictionary.home.whyUsTitle}
        items={[
          {
            title: dictionary.home.features.deliveryTitle,
            description: dictionary.home.features.deliveryDescription,
            icon: HOME_FEATURE_ICONS.delivery,
          },
          {
            title: dictionary.home.features.qualityTitle,
            description: dictionary.home.features.qualityDescription,
            icon: HOME_FEATURE_ICONS.quality,
          },
          {
            title: dictionary.home.features.returnTitle,
            description: dictionary.home.features.returnDescription,
            icon: HOME_FEATURE_ICONS.return,
          },
          {
            title: dictionary.home.features.supportTitle,
            description: dictionary.home.features.supportDescription,
            icon: HOME_FEATURE_ICONS.support,
          },
        ]}
      />

      <HomeAboutTeaser
        eyebrow={dictionary.home.aboutEyebrow}
        title={dictionary.home.aboutTitle}
        description={dictionary.home.aboutDescription}
        ctaLabel={dictionary.home.aboutCta}
        ctaHref={`/${locale}/about`}
      />
    </div>
  );
}
