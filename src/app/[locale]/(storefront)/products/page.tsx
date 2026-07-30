import { notFound } from "next/navigation";

import { AppLink } from "@/components/ui/AppLink";
import { listStorefrontCategories } from "@/features/categories/application/list-storefront-categories";
import { getCatalogPriceBounds } from "@/features/products/application/catalog-price-bounds";
import {
  catalogHref,
  parseCatalogSearchParams,
} from "@/features/products/application/catalog-search-params";
import { listCatalogProducts } from "@/features/products/application/list-catalog-products";
import { CatalogControls } from "@/features/products/ui/CatalogControls";
import { ProductCard } from "@/features/products/ui/ProductCard";
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
  const [user, categoryOptions, priceBounds] = await Promise.all([
    getCurrentUser(),
    listStorefrontCategories(rawLocale),
    getCatalogPriceBounds(currency),
  ]);

  const categories = categoryOptions.map((category) => ({
    slug: category.slug,
    title: category.title,
  }));

  let catalog = await listCatalogProducts(rawLocale, filters, currency);
  const totalPages = Math.max(1, Math.ceil(catalog.total / catalog.pageSize));

  if (filters.page > totalPages) {
    filters = { ...filters, page: totalPages };
    catalog = await listCatalogProducts(rawLocale, filters, currency);
  }

  const { products } = catalog;
  const [wishlistIds, formatPrice] = await Promise.all([
    getWishlistProductIds(products.map((product) => product.id)),
    createDisplayPriceFormatter(rawLocale, currency),
  ]);

  const priced = products.map((product) => {
    const price = formatPrice(product.priceAmount);
    const compareAt =
      product.compareAtAmount != null
        ? formatPrice(product.compareAtAmount)
        : null;

    return {
      product,
      price,
      compareAtFormatted: compareAt?.formatted ?? null,
    };
  });

  const pageHref = (targetPage: number) =>
    catalogHref(rawLocale, filters, { page: targetPage });

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
        {catalogCopy.title}
      </h1>

      <CatalogControls
        locale={rawLocale}
        currency={currency}
        filters={filters}
        categories={categories}
        priceBounds={priceBounds}
        total={catalog.total}
        labels={{
          filters: catalogCopy.filters,
          openFilters: catalogCopy.openFilters,
          clearFilters: catalogCopy.clearFilters,
          searchLabel: catalogCopy.searchLabel,
          searchPlaceholder: catalogCopy.searchPlaceholder,
          categoryLabel: catalogCopy.categoryLabel,
          allCategories: catalogCopy.allCategories,
          priceLabel: catalogCopy.priceLabel,
          availabilityLabel: catalogCopy.availabilityLabel,
          inStockOnly: catalogCopy.inStockOnly,
          onSaleOnly: catalogCopy.onSaleOnly,
          sortLabel: catalogCopy.sortLabel,
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
        {priced.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {catalogCopy.emptyTitle}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {catalogCopy.emptyDescription}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {priced.map(({ product, price, compareAtFormatted }, index) => (
              <ProductCard
                key={product.id}
                href={`/${rawLocale}/products/${product.translation.slug}`}
                title={product.translation.title}
                priceFormatted={price.formatted}
                compareAtFormatted={compareAtFormatted}
                discountPercent={product.discountPercent}
                imageUrl={product.imageUrl}
                inStock={product.stockOnHand > 0}
                priority={index < 4}
                locale={rawLocale}
                productId={product.id}
                inWishlist={wishlistIds.has(product.id)}
                isSignedIn={Boolean(user)}
                wishlistLabel={dictionary.nav.wishlist}
                addToCartLabel={dictionary.product.addToCart}
              />
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <nav
            aria-label={catalogCopy.paginationLabel}
            className="mt-8 flex items-center justify-center gap-4"
          >
            {filters.page > 1 ? (
              <AppLink
                href={pageHref(filters.page - 1)}
                prefetchPolicy="intent"
                scroll={false}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {catalogCopy.previousPage}
              </AppLink>
            ) : (
              <span className="rounded-lg border border-transparent px-4 py-2 text-sm text-gray-300">
                {catalogCopy.previousPage}
              </span>
            )}
            <span className="text-sm text-gray-600">
              {catalogCopy.pageStatus
                .replace("{page}", String(filters.page))
                .replace("{total}", String(totalPages))}
            </span>
            {filters.page < totalPages ? (
              <AppLink
                href={pageHref(filters.page + 1)}
                prefetchPolicy="intent"
                scroll={false}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {catalogCopy.nextPage}
              </AppLink>
            ) : (
              <span className="rounded-lg border border-transparent px-4 py-2 text-sm text-gray-300">
                {catalogCopy.nextPage}
              </span>
            )}
          </nav>
        ) : null}
      </CatalogControls>
    </section>
  );
}
