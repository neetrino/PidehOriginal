import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { cardShelf } from "@/components/motion/presets";
import { AppLink } from "@/components/ui/AppLink";
import { HomeProductCard } from "@/features/home/ui/HomeProductCard";
import type { CatalogProduct } from "@/features/products/types";
import type { Locale } from "@/lib/i18n/config";

type PricedProduct = {
  product: CatalogProduct;
  priceFormatted: string;
  compareAtFormatted: string | null;
};

type ShopProductGridProps = {
  locale: Locale;
  products: readonly PricedProduct[];
  wishlistIds: ReadonlySet<string>;
  isSignedIn: boolean;
  emptyTitle: string;
  emptyDescription: string;
  wishlistLabel: string;
  orderLabel: string;
  outOfStockLabel: string;
  ratingLabel: string;
  prepTimeLabel: string;
  paginationLabel: string;
  previousPage: string;
  nextPage: string;
  pageStatus: string;
  page: number;
  totalPages: number;
  pageHref: (page: number) => string;
};

export function ShopProductGrid({
  locale,
  products,
  wishlistIds,
  isSignedIn,
  emptyTitle,
  emptyDescription,
  wishlistLabel,
  orderLabel,
  outOfStockLabel,
  ratingLabel,
  prepTimeLabel,
  paginationLabel,
  previousPage,
  nextPage,
  pageStatus,
  page,
  totalPages,
  pageHref,
}: ShopProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-[26px] bg-white px-6 py-16 text-center shadow-[0px_12px_14px_rgba(31,20,8,0.11)]">
        <h2 className="text-lg font-semibold text-[#1e1e1e]">{emptyTitle}</h2>
        <p className="mt-2 text-sm text-[#6b6b6b]">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <>
      <StaggerGroup
        className="grid grid-cols-1 justify-items-stretch gap-[13px] overflow-visible sm:grid-cols-2 lg:grid-cols-4"
        stagger={0.08}
        delayChildren={0.04}
      >
        {products.map((item, index) => (
          <StaggerItem
            key={item.product.id}
            variants={cardShelf}
            className="relative z-0 w-full min-w-0 overflow-visible hover:z-50"
          >
            <HomeProductCard
              href={`/${locale}/products/${item.product.translation.slug}`}
              title={item.product.translation.title}
              description={item.product.translation.description ?? null}
              priceFormatted={item.priceFormatted}
              compareAtFormatted={item.compareAtFormatted}
              imageUrl={item.product.imageUrl}
              inStock={item.product.stockOnHand > 0}
              priority={index < 4}
              locale={locale}
              productId={item.product.id}
              inWishlist={wishlistIds.has(item.product.id)}
              isSignedIn={isSignedIn}
              wishlistLabel={wishlistLabel}
              orderLabel={orderLabel}
              outOfStockLabel={outOfStockLabel}
              ratingLabel={ratingLabel}
              prepTimeLabel={prepTimeLabel}
              className="max-w-none"
            />
          </StaggerItem>
        ))}
      </StaggerGroup>
      {totalPages > 1 ? (
        <ShopPagination
          paginationLabel={paginationLabel}
          previousPage={previousPage}
          nextPage={nextPage}
          pageStatus={pageStatus}
          page={page}
          totalPages={totalPages}
          pageHref={pageHref}
        />
      ) : null}
    </>
  );
}

type ShopPaginationProps = {
  paginationLabel: string;
  previousPage: string;
  nextPage: string;
  pageStatus: string;
  page: number;
  totalPages: number;
  pageHref: (page: number) => string;
};

function ShopPagination({
  paginationLabel,
  previousPage,
  nextPage,
  pageStatus,
  page,
  totalPages,
  pageHref,
}: ShopPaginationProps) {
  const status = pageStatus
    .replace("{page}", String(page))
    .replace("{total}", String(totalPages));

  return (
    <nav
      aria-label={paginationLabel}
      className="mt-10 flex items-center justify-center gap-4"
    >
      {page > 1 ? (
        <AppLink
          href={pageHref(page - 1)}
          prefetchPolicy="intent"
          scroll={false}
          className="rounded-[30px] bg-white px-4 py-2 text-sm font-bold text-[#ff6b00] shadow-[0px_8px_14px_rgba(31,20,8,0.08)] transition duration-200 hover:scale-[1.04] hover:brightness-105"
        >
          {previousPage}
        </AppLink>
      ) : (
        <span className="rounded-[30px] px-4 py-2 text-sm text-[#ff6b00]/40">
          {previousPage}
        </span>
      )}
      <span className="text-sm font-medium text-[#1e1e1e]">{status}</span>
      {page < totalPages ? (
        <AppLink
          href={pageHref(page + 1)}
          prefetchPolicy="intent"
          scroll={false}
          className="rounded-[30px] bg-[#ff6b00] px-4 py-2 text-sm font-bold text-white transition duration-200 hover:scale-[1.04] hover:brightness-105"
        >
          {nextPage}
        </AppLink>
      ) : (
        <span className="rounded-[30px] px-4 py-2 text-sm text-[#ff6b00]/40">
          {nextPage}
        </span>
      )}
    </nav>
  );
}
