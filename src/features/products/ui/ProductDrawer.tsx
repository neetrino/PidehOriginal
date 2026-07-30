"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SideSheet } from "@/components/ui/SideSheet";
import {
  ADMIN_INPUT,
  ADMIN_LABEL,
  ADMIN_TEXTAREA,
} from "@/features/admin/ui/admin-form-classes";
import type {
  AdminCategoryOption,
  AdminProductListItem,
} from "@/features/products/application/list-admin-products";
import type { ProductModifierOption } from "@/features/products/types/modifiers";
import type { ProductDiscountDraft } from "@/features/products/types/product-discount";
import {
  createProductFromDrawerAction,
  updateProductFromDrawerAction,
} from "@/features/products/application/upsert-product";
import { ProductDrawerCategories } from "@/features/products/ui/ProductDrawerCategories";
import { ProductDrawerDiscount } from "@/features/products/ui/ProductDrawerDiscount";
import {
  ProductDrawerImages,
  type ProductDraftImage,
} from "@/features/products/ui/ProductDrawerImages";
import { ProductDrawerModifiers } from "@/features/products/ui/ProductDrawerModifiers";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ProductDrawerProduct = Pick<
  AdminProductListItem,
  | "id"
  | "sku"
  | "title"
  | "slug"
  | "description"
  | "priceAmount"
  | "stockOnHand"
  | "status"
  | "categoryIds"
  | "modifierIds"
  | "discount"
  | "images"
>;

type DrawerCopy = {
  drawer: Dictionary["admin"]["products"]["drawer"];
  categories: Dictionary["admin"]["products"]["categories"];
  images: Dictionary["admin"]["products"]["images"];
  discount: Dictionary["admin"]["products"]["discount"];
  modifiers: Dictionary["admin"]["products"]["modifiers"];
  common: Dictionary["admin"]["common"];
};

type ProductDrawerProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  product?: ProductDrawerProduct | null;
  categories: AdminCategoryOption[];
  modifierLibrary: ProductModifierOption[];
  copy: DrawerCopy;
};

function imagesFromProduct(
  product: ProductDrawerProduct | null,
): ProductDraftImage[] {
  if (!product) return [];
  return product.images.map((image) => ({
    key: image.id,
    previewUrl: image.url,
    isPrimary: image.isPrimary,
    existingId: image.id,
  }));
}

export function ProductDrawer({
  locale,
  open,
  onClose,
  product = null,
  categories: initialCategories,
  modifierLibrary: initialModifierLibrary,
  copy,
}: ProductDrawerProps) {
  const router = useRouter();
  const isEdit = product != null;
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ProductDraftImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [categories, setCategories] =
    useState<AdminCategoryOption[]>(initialCategories);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [modifierLibrary, setModifierLibrary] = useState<ProductModifierOption[]>(
    initialModifierLibrary,
  );
  const [modifierIds, setModifierIds] = useState<string[]>([]);
  const [discount, setDiscount] = useState<ProductDiscountDraft | null>(null);
  const [priceAmount, setPriceAmount] = useState("");
  const [sku, setSku] = useState("");
  const [stockOnHand, setStockOnHand] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;

    setCategories(initialCategories);
    setModifierLibrary(initialModifierLibrary);
    if (product) {
      setTitle(product.title);
      setSlug(product.slug);
      setDescription(product.description);
      setImages(imagesFromProduct(product));
      setRemovedImageIds([]);
      setCategoryIds(product.categoryIds);
      setModifierIds(product.modifierIds);
      setDiscount(
        product.discount
          ? {
              type: product.discount.type,
              value: product.discount.value,
              startsAt: product.discount.startsAt
                ? new Date(product.discount.startsAt).toISOString()
                : null,
              endsAt: product.discount.endsAt
                ? new Date(product.discount.endsAt).toISOString()
                : null,
            }
          : null,
      );
      setPriceAmount(String(product.priceAmount));
      setSku(product.sku);
      setStockOnHand(String(product.stockOnHand));
      setError(null);
    } else {
      setTitle("");
      setSlug("");
      setDescription("");
      setImages([]);
      setRemovedImageIds([]);
      setCategoryIds([]);
      setModifierIds([]);
      setDiscount(null);
      setPriceAmount("");
      setSku("");
      setStockOnHand("");
      setError(null);
    }
  }, [open, product, initialCategories, initialModifierLibrary]);

  function handleImagesChange(next: ProductDraftImage[]): void {
    const nextKeys = new Set(next.map((image) => image.key));
    const removedExisting = images
      .filter(
        (image) =>
          image.existingId &&
          !nextKeys.has(image.key) &&
          !removedImageIds.includes(image.existingId),
      )
      .map((image) => image.existingId as string);
    if (removedExisting.length > 0) {
      setRemovedImageIds((prev) => [...prev, ...removedExisting]);
    }
    setImages(next);
  }

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      ariaLabel={isEdit ? copy.drawer.editAria : copy.drawer.addAria}
      panelClassName="w-[min(100%,42rem)] sm:w-[40%]"
    >
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? copy.drawer.editTitle : copy.drawer.addTitle}
          </h2>
        </div>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            const newImages = images.filter((image) => image.file);
            const primaryImage = images.find((image) => image.isPrimary);
            const primaryNewIndex = primaryImage?.file
              ? newImages.findIndex((image) => image.key === primaryImage.key)
              : null;

            const payload = {
              sku: sku.trim(),
              title: title.trim(),
              slug: slug.trim(),
              description: description.trim() || undefined,
              priceAmount: Number(priceAmount),
              stockOnHand: Number(stockOnHand),
              categoryIds,
              modifierIds,
              discount,
              status: (product?.status === "ACTIVE" ||
              product?.status === "ARCHIVED"
                ? product.status
                : "DRAFT") as "DRAFT" | "ACTIVE" | "ARCHIVED",
              primaryExistingId: primaryImage?.existingId ?? null,
              primaryNewIndex:
                primaryNewIndex != null && primaryNewIndex >= 0
                  ? primaryNewIndex
                  : null,
              removeImageIds: removedImageIds,
            };

            const formData = new FormData();
            formData.set("data", JSON.stringify(payload));
            for (const image of newImages) {
              if (image.file) formData.append("images", image.file);
            }

            startTransition(async () => {
              setError(null);
              try {
                const result =
                  isEdit && product
                    ? await updateProductFromDrawerAction(
                        locale,
                        product.id,
                        formData,
                      )
                    : await createProductFromDrawerAction(locale, formData);

                if (!result.ok) {
                  setError(result.error.message);
                  return;
                }

                onClose();
                router.refresh();
              } catch (caught) {
                const message =
                  caught instanceof Error ? caught.message : copy.common.saveFailed;
                if (/body exceeded|413|too large/i.test(message)) {
                  setError(copy.drawer.imagesTooLarge);
                  return;
                }
                setError(message);
              }
            });
          }}
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className={ADMIN_LABEL}>
                  {copy.drawer.title}{" "}
                  <span className="text-red-600">{copy.common.requiredMark}</span>
                </span>
                <input
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={copy.drawer.titlePlaceholder}
                  className={ADMIN_INPUT}
                  disabled={isPending}
                />
              </label>
              <label>
                <span className={ADMIN_LABEL}>
                  {copy.drawer.slug}{" "}
                  <span className="text-red-600">{copy.common.requiredMark}</span>
                </span>
                <input
                  required
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder={copy.drawer.slugPlaceholder}
                  className={ADMIN_INPUT}
                  disabled={isPending}
                />
              </label>
            </div>

            <label className="block">
              <span className={ADMIN_LABEL}>{copy.drawer.description}</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={copy.drawer.descriptionPlaceholder}
                className={ADMIN_TEXTAREA}
                disabled={isPending}
              />
            </label>

            <ProductDrawerImages
              images={images}
              disabled={isPending}
              onChange={handleImagesChange}
              copy={copy.images}
            />

            <ProductDrawerCategories
              locale={locale}
              categories={categories}
              selectedIds={categoryIds}
              disabled={isPending}
              onCategoriesChange={setCategories}
              onSelectedChange={setCategoryIds}
              copy={copy.categories}
            />

            <ProductDrawerModifiers
              locale={locale}
              library={modifierLibrary}
              selectedIds={modifierIds}
              disabled={isPending}
              onLibraryChange={setModifierLibrary}
              onSelectedChange={setModifierIds}
              copy={copy.modifiers}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className={ADMIN_LABEL}>
                  {copy.drawer.price}{" "}
                  <span className="text-red-600">{copy.common.requiredMark}</span>
                </span>
                <input
                  required
                  min={0}
                  type="number"
                  value={priceAmount}
                  onChange={(event) => setPriceAmount(event.target.value)}
                  placeholder={copy.drawer.pricePlaceholder}
                  className={ADMIN_INPUT}
                  disabled={isPending}
                />
              </label>
              <ProductDrawerDiscount
                value={discount}
                disabled={isPending}
                onChange={setDiscount}
                copy={copy.discount}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className={ADMIN_LABEL}>
                  {copy.drawer.sku}{" "}
                  <span className="text-red-600">{copy.common.requiredMark}</span>
                </span>
                <input
                  required
                  value={sku}
                  onChange={(event) => setSku(event.target.value)}
                  placeholder={copy.drawer.skuPlaceholder}
                  className={ADMIN_INPUT}
                  disabled={isPending}
                />
              </label>
              <label>
                <span className={ADMIN_LABEL}>
                  {copy.drawer.quantity}{" "}
                  <span className="text-red-600">{copy.common.requiredMark}</span>
                </span>
                <input
                  required
                  min={0}
                  type="number"
                  value={stockOnHand}
                  onChange={(event) => setStockOnHand(event.target.value)}
                  placeholder={copy.drawer.quantityPlaceholder}
                  className={ADMIN_INPUT}
                  disabled={isPending}
                />
              </label>
            </div>

            {error ? <p className="text-sm text-red-700">{error}</p> : null}
          </div>

          <div className="sticky bottom-0 flex items-center gap-4 border-t border-gray-200 bg-white px-5 py-4">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEdit
                  ? copy.common.saving
                  : copy.common.creating
                : isEdit
                  ? copy.common.save
                  : copy.common.create}
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              {copy.common.cancel}
            </button>
          </div>
        </form>
    </SideSheet>
  );
}
