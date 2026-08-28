import { notFound } from "next/navigation";

import { RevealOnView } from "@/components/motion/RevealOnView";
import { fadeUp, titleSweep } from "@/components/motion/presets";
import { listStorefrontCategories } from "@/features/categories/application/list-storefront-categories";
import {
  catalogHref,
  parseCatalogSearchParams,
} from "@/features/products/application/catalog-search-params";
import { listCatalogProducts } from "@/features/products/application/list-catalog-products";
import { CatalogControls } from "@/features/products/ui/CatalogControls";
import { ShopBreadcrumb } from "@/features/products/ui/ShopBreadcrumb";
import { ShopProductGrid } from "@/features/products/ui/ShopProductGrid";
import { getWishlistProductIds } from "@/features/wishlist/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  createDisplayPriceFormatter,
  getSelectedCurrency,
} from "@/lib/money/display-price";

type ProductsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { locale: rawLocale } = await params;
  const raw = await searchParams;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  let filters = parseCatalogSearchParams(raw);
  const dictionary = getDictionary(rawLocale);
  const catalogCopy = dictionary.catalog;
  const currency = await getSelectedCurrency();
  const [user, categoryOptions, firstCatalog] = await Promise.all([
    getCurrentUser(),
    listStorefrontCategories(rawLocale),
    listCatalogProducts(rawLocale, filters, currency),
  ]);

  const categories = categoryOptions.map((category) => ({
    slug: category.slug,
    title: category.title,
  }));

  let catalog = firstCatalog;
  const totalPages = Math.max(1, Math.ceil(catalog.total / catalog.pageSize));

  if (filters.page > totalPages) {
    filters = { ...filters, page: totalPages };
    catalog = await listCatalogProducts(rawLocale, filters, currency);
  }

  const [wishlistIds, formatPrice] = await Promise.all([
    getWishlistProductIds(catalog.products.map((product) => product.id)),
    createDisplayPriceFormatter(rawLocale, currency),
  ]);

  const priced = catalog.products.map((product) => {
    const price = formatPrice(product.priceAmount);
    const compareAt =
      product.compareAtAmount != null
        ? formatPrice(product.compareAtAmount)
        : null;

    return {
      product,
      priceFormatted: price.formatted,
      compareAtFormatted: compareAt?.formatted ?? null,
    };
  });

  return (
    <div className="pideh-shop">
      <div className="mx-auto w-full max-w-[1440px] px-4 pt-6 pb-28 sm:px-6 md:px-[66px] md:pt-8 md:pb-32">
        <RevealOnView variants={fadeUp}>
          <ShopBreadcrumb
            backHref={`/${rawLocale}`}
            backLabel={catalogCopy.back}
            currentLabel={catalogCopy.title}
          />
        </RevealOnView>
        <RevealOnView variants={titleSweep} delay={0.06}>
          <h1 className="font-display mt-5 text-[clamp(3.5rem,8vw,4.875rem)] leading-[0.95] text-[#ff6b00]">
            {catalogCopy.title}
          </h1>
        </RevealOnView>
        <div className="mt-8">
          <CatalogControls
            locale={rawLocale}
            filters={filters}
            categories={categories}
            total={catalog.total}
            labels={{
              allChip: catalogCopy.allChip,
              sortAction: catalogCopy.sortAction,
              sortNewest: catalogCopy.sortNewest,
              sortPriceAsc: catalogCopy.sortPriceAsc,
              sortPriceDesc: catalogCopy.sortPriceDesc,
              sortPopular: catalogCopy.sortPopular,
              removeFilter: catalogCopy.removeFilter,
              chipSearch: catalogCopy.chipSearch,
              chipCategory: catalogCopy.chipCategory,
              chipPrice: catalogCopy.chipPrice,
              chipPriceMin: catalogCopy.chipPriceMin,
              chipPriceMax: catalogCopy.chipPriceMax,
              chipInStock: catalogCopy.chipInStock,
              chipOnSale: catalogCopy.chipOnSale,
              resultsCount: catalogCopy.resultsCount,
              resultsCountOne: catalogCopy.resultsCountOne,
            }}
          >
            <ShopProductGrid
              locale={rawLocale}
              products={priced}
              wishlistIds={wishlistIds}
              isSignedIn={Boolean(user)}
              emptyTitle={catalogCopy.emptyTitle}
              emptyDescription={catalogCopy.emptyDescription}
              wishlistLabel={dictionary.nav.wishlist}
              orderLabel={dictionary.home.orderCta}
              outOfStockLabel={dictionary.product.outOfStock}
              ratingLabel={dictionary.product.cardRating}
              prepTimeLabel={dictionary.product.prepTime}
              paginationLabel={catalogCopy.paginationLabel}
              previousPage={catalogCopy.previousPage}
              nextPage={catalogCopy.nextPage}
              pageStatus={catalogCopy.pageStatus}
              page={filters.page}
              totalPages={totalPages}
              pageHref={(targetPage) =>
                catalogHref(rawLocale, filters, { page: targetPage })
              }
            />
          </CatalogControls>
        </div>
      </div>
    </div>
  );
}
