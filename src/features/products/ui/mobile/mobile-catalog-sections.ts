import { catalogHref } from "@/features/products/application/catalog-search-params";
import type { CatalogSection } from "@/features/products/application/list-catalog-sections";
import type { CatalogFilters } from "@/features/products/schemas/catalog-list";
import type { CatalogProduct } from "@/features/products/types";
import type { MobileGridProduct } from "@/features/home/ui/mobile/MobileProductGrid";
import type { MobileCatalogSectionData } from "@/features/products/ui/mobile/MobileCatalog";

type BuildMobileCatalogSectionsArgs = {
  locale: string;
  filters: CatalogFilters;
  sections: readonly CatalogSection[];
  wishlistIds: ReadonlySet<string>;
  formatPrice: (amount: number) => string;
  /** `catalog.seeAllCategory`, containing a `{category}` placeholder. */
  seeAllTemplate: string;
  /**
   * False when the shopper already drilled into a single category, so the
   * block is not a preview and needs no "see all" link.
   */
  withSeeAll: boolean;
};

/** Maps catalog blocks to the props the mobile menu grid expects. */
export function buildMobileCatalogSections({
  locale,
  filters,
  sections,
  wishlistIds,
  formatPrice,
  seeAllTemplate,
  withSeeAll,
}: BuildMobileCatalogSectionsArgs): MobileCatalogSectionData[] {
  function toCard(product: CatalogProduct): MobileGridProduct {
    return {
      id: product.id,
      href: `/${locale}/products/${product.translation.slug}`,
      title: product.translation.title,
      description: product.translation.description ?? null,
      priceFormatted: formatPrice(product.priceAmount),
      imageUrl: product.imageUrl,
      inStock: product.stockOnHand > 0,
      inWishlist: wishlistIds.has(product.id),
    };
  }

  return sections.map((section) => ({
    key: section.slug,
    title: section.title,
    seeAllHref: withSeeAll
      ? catalogHref(locale, filters, { category: section.slug, page: 1 })
      : null,
    seeAllLabel: seeAllTemplate.replace("{category}", section.title),
    products: section.products.map(toCard),
  }));
}
