import { notFound } from "next/navigation";

import { listStorefrontCategories } from "@/features/categories/application/list-storefront-categories";
import { listActiveHeroSlides } from "@/features/hero/application/queries";
import { HomeCategories } from "@/features/home/ui/HomeCategories";
import { HomeCtaBanner } from "@/features/home/ui/HomeCtaBanner";
import { HomeFeaturedProducts } from "@/features/home/ui/HomeFeaturedProducts";
import {
  HOME_FEATURE_VISUALS,
  HomeFeatures,
} from "@/features/home/ui/HomeFeatures";
import { HomeHero } from "@/features/home/ui/HomeHero";
import { HomeReviews } from "@/features/home/ui/HomeReviews";
import {
  getFeaturedProducts,
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
      description: product.translation.description ?? null,
      priceFormatted: price.formatted,
      compareAtFormatted: compareAt?.formatted ?? null,
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
  const [heroSlides, categories, featuredProducts, currency, user] =
    await Promise.all([
      listActiveHeroSlides(locale),
      listStorefrontCategories(locale),
      getFeaturedProducts(locale),
      getSelectedCurrency(),
      getCurrentUser(),
    ]);

  const productIds = featuredProducts.map((product) => product.id);
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

  const featureTitles = {
    delivery: dictionary.home.features.deliveryTitle,
    prep: dictionary.home.features.prepTitle,
    quality: dictionary.home.features.qualityTitle,
    support: dictionary.home.features.supportTitle,
  } as const;

  return (
    <div className="pideh-home">
      <HomeHero
        slides={heroSlides}
        fallbackTitle={dictionary.home.heroTitleLine1}
        fallbackTitleAccent={dictionary.home.heroTitleLine2}
        fallbackSubtitle={dictionary.home.subtitle}
        fallbackCtaLabel={dictionary.home.viewAllMenu}
        fallbackCtaHref={`/${locale}/products`}
      />

      <HomeCategories
        title={dictionary.home.categoriesTitle}
        viewAllLabel={dictionary.home.viewAllMenu}
        viewAllHref={`/${locale}/products`}
        typesLabel={dictionary.home.categoryTypes}
        demoCategoryTitle={dictionary.home.categoryDemoTitle}
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
        viewAllLabel={dictionary.home.viewAllMenu}
        viewAllHref={`/${locale}/products`}
        emptyLabel={dictionary.home.emptyFeatured}
        wishlistLabel={dictionary.nav.wishlist}
        orderLabel={dictionary.home.orderCta}
        isSignedIn={Boolean(user)}
        products={featuredCards}
      />

      <HomeFeatures
        titleLine1={dictionary.home.whyUsTitleLine1}
        titleLine2={dictionary.home.whyUsTitleLine2}
        viewAllLabel={dictionary.home.viewAllMenu}
        viewAllHref={`/${locale}/products`}
        items={HOME_FEATURE_VISUALS.map((visual) => ({
          title: featureTitles[visual.key],
          imageSrc: visual.imageSrc,
          imageClassName: visual.imageClassName,
          labelClassName: visual.labelClassName,
        }))}
      />

      <HomeReviews
        title={dictionary.home.reviewsTitle}
        viewAllLabel={dictionary.home.viewAllMenu}
        viewAllHref={`/${locale}/products`}
        reviews={dictionary.home.reviews}
      />

      <HomeCtaBanner
        titleLine1={dictionary.home.ctaTitleLine1}
        titleLine2={dictionary.home.ctaTitleLine2}
        description={dictionary.home.ctaDescription}
        ctaLabel={dictionary.home.orderCta}
        ctaHref={`/${locale}/products`}
      />
    </div>
  );
}
