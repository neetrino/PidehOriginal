import type { CatalogProduct } from '@/features/products/types';

/** One shop card, already priced for the shopper's currency. */
export type ShopGridItem = {
  product: CatalogProduct;
  priceFormatted: string;
  compareAtFormatted: string | null;
  inWishlist: boolean;
  cartQuantity: number;
};
