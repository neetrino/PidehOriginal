"use server";

import { and, eq, inArray, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDb } from "@/db/client";
import {
  categories,
  productCategories,
  products,
  stockMovements,
  type TranslationsJson,
} from "@/db/schema";
import { persistProductMedia } from "@/features/products/application/persist-product-media";
import { syncProductModifierLinks } from "@/features/products/application/product-modifiers";
import { syncProductDiscount } from "@/features/products/application/sync-product-discount";
import { requireAdmin } from "@/lib/auth/policies";
import { invalidateProductsCache } from "@/lib/cache/invalidate-public";
import { createId } from "@/lib/id";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { err, ok, type Result } from "@/lib/result";

const productUpsertSchema = z.object({
  sku: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional(),
  priceAmount: z.number().int().nonnegative(),
  stockOnHand: z.number().int().nonnegative(),
  categoryIds: z.array(z.string().uuid()),
  modifierIds: z.array(z.string().uuid()),
  discount: z
    .object({
      type: z.enum(["PERCENTAGE", "FIXED"]),
      value: z.number().int().positive(),
      startsAt: z.string().nullable(),
      endsAt: z.string().nullable(),
    })
    .nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  primaryExistingId: z.string().uuid().nullable(),
  primaryNewIndex: z.number().int().nullable(),
  removeImageIds: z.array(z.string().uuid()),
});

export type ProductUpsertInput = z.infer<typeof productUpsertSchema>;

function buildTranslations(data: ProductUpsertInput): TranslationsJson {
  const entry = {
    title: data.title,
    slug: data.slug,
    description: data.description || undefined,
  };
  return { hy: entry, en: entry, ru: entry };
}

function revalidateProducts(
  locale: string,
  product: { id: string; slug: string; previousSlug?: string },
): void {
  revalidatePath(`/${locale}/admin/products`);
  revalidatePath(`/${locale}/products`);
  for (const loc of locales) {
    revalidatePath(`/${loc}`);
  }
  invalidateProductsCache({
    productId: product.id,
    slug: product.slug,
  });
  if (product.previousSlug && product.previousSlug !== product.slug) {
    invalidateProductsCache({ slug: product.previousSlug });
  }
}

function parsePayload(formData: FormData): ProductUpsertInput | null {
  const raw = formData.get("data");
  if (typeof raw !== "string") return null;
  try {
    return productUpsertSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

function collectImageFiles(formData: FormData): File[] {
  return formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

async function syncProductCategories(
  productId: string,
  categoryIds: string[],
): Promise<string | null> {
  const uniqueIds = [...new Set(categoryIds)];
  if (uniqueIds.length > 0) {
    const found = await getDb()
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          inArray(categories.id, uniqueIds),
          isNull(categories.deletedAt),
        ),
      );
    if (found.length !== uniqueIds.length) {
      return "One or more categories were not found.";
    }
  }

  await getDb()
    .delete(productCategories)
    .where(eq(productCategories.productId, productId));

  if (uniqueIds.length === 0) return null;

  await getDb().insert(productCategories).values(
    uniqueIds.map((categoryId, index) => ({
      id: createId(),
      productId,
      categoryId,
      isPrimary: index === 0,
      sortOrder: index,
    })),
  );

  return null;
}

/** Creates a product from the admin drawer (fields + optional images). */
export async function createProductFromDrawerAction(
  locale: string,
  formData: FormData,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const data = parsePayload(formData);
  if (!data) {
    return err("VALIDATION_ERROR", "Invalid product payload.");
  }

  if (
    data.discount?.type === "PERCENTAGE" &&
    (data.discount.value < 1 || data.discount.value > 100)
  ) {
    return err(
      "VALIDATION_ERROR",
      "Percentage discount must be between 1 and 100.",
    );
  }

  const actor = await requireAdmin(locale as Locale);
  const id = createId();
  const files = collectImageFiles(formData);

  await getDb().insert(products).values({
    id,
    sku: data.sku,
    priceAmount: data.priceAmount,
    compareAtAmount: null,
    stockOnHand: data.stockOnHand,
    status: data.status,
    translations: buildTranslations(data),
  });

  const categoryError = await syncProductCategories(id, data.categoryIds);
  if (categoryError) {
    return err("VALIDATION_ERROR", categoryError);
  }

  const modifierError = await syncProductModifierLinks(id, data.modifierIds);
  if (modifierError) {
    return err("VALIDATION_ERROR", modifierError);
  }

  const discountError = await syncProductDiscount(id, data.discount);
  if (discountError) {
    return err("VALIDATION_ERROR", discountError);
  }

  if (data.stockOnHand > 0) {
    await getDb().insert(stockMovements).values({
      id: createId(),
      productId: id,
      delta: data.stockOnHand,
      reason: "ADMIN_ADJUSTMENT",
      actorUserId: actor.id,
      resultingBalance: data.stockOnHand,
    });
  }

  const mediaResult = await persistProductMedia({
    productId: id,
    files,
    primaryNewIndex: data.primaryNewIndex ?? (files.length > 0 ? 0 : null),
    primaryExistingId: null,
    removeImageIds: [],
  });
  if (mediaResult.error) {
    return err("VALIDATION_ERROR", mediaResult.error);
  }

  revalidateProducts(locale, { id, slug: data.slug });
  return ok({ id });
}

/** Updates a product from the admin drawer (fields + optional images). */
export async function updateProductFromDrawerAction(
  locale: string,
  productId: string,
  formData: FormData,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const data = parsePayload(formData);
  if (!data) {
    return err("VALIDATION_ERROR", "Invalid product payload.");
  }

  if (
    data.discount?.type === "PERCENTAGE" &&
    (data.discount.value < 1 || data.discount.value > 100)
  ) {
    return err(
      "VALIDATION_ERROR",
      "Percentage discount must be between 1 and 100.",
    );
  }

  const actor = await requireAdmin(locale as Locale);
  const files = collectImageFiles(formData);

  const [existing] = await getDb()
    .select({
      id: products.id,
      stockOnHand: products.stockOnHand,
      status: products.status,
      translations: products.translations,
    })
    .from(products)
    .where(and(eq(products.id, productId), isNull(products.deletedAt)))
    .limit(1);

  if (!existing) {
    return err("NOT_FOUND", "Product not found.");
  }

  await getDb()
    .update(products)
    .set({
      sku: data.sku,
      priceAmount: data.priceAmount,
      stockOnHand: data.stockOnHand,
      status: data.status || existing.status,
      translations: buildTranslations(data),
      updatedAt: new Date(),
    })
    .where(eq(products.id, existing.id));

  const categoryError = await syncProductCategories(
    existing.id,
    data.categoryIds,
  );
  if (categoryError) {
    return err("VALIDATION_ERROR", categoryError);
  }

  const modifierError = await syncProductModifierLinks(
    existing.id,
    data.modifierIds,
  );
  if (modifierError) {
    return err("VALIDATION_ERROR", modifierError);
  }

  const discountError = await syncProductDiscount(existing.id, data.discount);
  if (discountError) {
    return err("VALIDATION_ERROR", discountError);
  }

  const delta = data.stockOnHand - existing.stockOnHand;
  if (delta !== 0) {
    await getDb().insert(stockMovements).values({
      id: createId(),
      productId: existing.id,
      delta,
      reason: "ADMIN_ADJUSTMENT",
      actorUserId: actor.id,
      resultingBalance: data.stockOnHand,
    });
  }

  const mediaResult = await persistProductMedia({
    productId: existing.id,
    files,
    primaryNewIndex: data.primaryNewIndex ?? null,
    primaryExistingId: data.primaryExistingId ?? null,
    removeImageIds: data.removeImageIds,
  });
  if (mediaResult.error) {
    return err("VALIDATION_ERROR", mediaResult.error);
  }

  const previousSlug =
    existing.translations.hy?.slug ??
    existing.translations.en?.slug ??
    existing.translations.ru?.slug;

  revalidateProducts(locale, {
    id: existing.id,
    slug: data.slug,
    previousSlug,
  });
  return ok({ id: existing.id });
}
