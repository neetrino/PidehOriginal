import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  productModifierLinks,
  productModifiers,
} from "@/db/schema";
import type {
  ProductModifierKind,
  ProductModifierOption,
  ProductModifierRow,
} from "@/features/products/types/modifiers";
import { createId } from "@/lib/id";

export type {
  ProductModifierKind,
  ProductModifierOption,
  ProductModifierRow,
} from "@/features/products/types/modifiers";

/** Lists the global modifier library (active first, then name). */
export async function listProductModifierLibrary(): Promise<ProductModifierRow[]> {
  const rows = await getDb()
    .select({
      id: productModifiers.id,
      kind: productModifiers.kind,
      name: productModifiers.name,
      priceAmount: productModifiers.priceAmount,
      isActive: productModifiers.isActive,
    })
    .from(productModifiers)
    .orderBy(asc(productModifiers.kind), asc(productModifiers.name));

  return rows;
}

/** Library rows plus which are linked to the product. */
export async function listModifiersForProductAdmin(
  productId: string | null,
): Promise<ProductModifierOption[]> {
  const library = await listProductModifierLibrary();
  if (!productId || library.length === 0) {
    return library.map((row) => ({ ...row, linked: false, sortOrder: 0 }));
  }

  const links = await getDb()
    .select({
      modifierId: productModifierLinks.modifierId,
      sortOrder: productModifierLinks.sortOrder,
    })
    .from(productModifierLinks)
    .where(eq(productModifierLinks.productId, productId));

  const linkMap = new Map(
    links.map((link) => [link.modifierId, link.sortOrder] as const),
  );

  return library.map((row) => ({
    ...row,
    linked: linkMap.has(row.id),
    sortOrder: linkMap.get(row.id) ?? 0,
  }));
}

/** Active modifiers linked to a product for storefront PDP. */
export async function listLinkedModifiersForProduct(
  productId: string,
): Promise<ProductModifierRow[]> {
  const rows = await getDb()
    .select({
      id: productModifiers.id,
      kind: productModifiers.kind,
      name: productModifiers.name,
      priceAmount: productModifiers.priceAmount,
      isActive: productModifiers.isActive,
    })
    .from(productModifierLinks)
    .innerJoin(
      productModifiers,
      eq(productModifierLinks.modifierId, productModifiers.id),
    )
    .where(
      and(
        eq(productModifierLinks.productId, productId),
        eq(productModifiers.isActive, true),
      ),
    )
    .orderBy(asc(productModifierLinks.sortOrder), asc(productModifiers.name));

  return rows;
}

/** Creates a library modifier; returns existing row when kind+name already exists. */
export async function ensureProductModifier(input: {
  kind: ProductModifierKind;
  name: string;
  priceAmount: number;
}): Promise<ProductModifierRow> {
  const name = input.name.trim();
  const priceAmount =
    input.kind === "EXCEPTION" ? 0 : Math.max(0, Math.floor(input.priceAmount));

  const [existing] = await getDb()
    .select({
      id: productModifiers.id,
      kind: productModifiers.kind,
      name: productModifiers.name,
      priceAmount: productModifiers.priceAmount,
      isActive: productModifiers.isActive,
    })
    .from(productModifiers)
    .where(
      and(
        eq(productModifiers.kind, input.kind),
        eq(productModifiers.name, name),
      ),
    )
    .limit(1);

  if (existing) {
    if (
      !existing.isActive ||
      (input.kind === "ADDITION" && existing.priceAmount !== priceAmount)
    ) {
      const [updated] = await getDb()
        .update(productModifiers)
        .set({
          isActive: true,
          priceAmount,
          updatedAt: new Date(),
        })
        .where(eq(productModifiers.id, existing.id))
        .returning({
          id: productModifiers.id,
          kind: productModifiers.kind,
          name: productModifiers.name,
          priceAmount: productModifiers.priceAmount,
          isActive: productModifiers.isActive,
        });
      if (updated) return updated;
    }
    return existing;
  }

  const [created] = await getDb()
    .insert(productModifiers)
    .values({
      id: createId(),
      kind: input.kind,
      name,
      priceAmount,
      isActive: true,
    })
    .returning({
      id: productModifiers.id,
      kind: productModifiers.kind,
      name: productModifiers.name,
      priceAmount: productModifiers.priceAmount,
      isActive: productModifiers.isActive,
    });

  if (!created) {
    throw new Error("Unable to create product modifier.");
  }
  return created;
}

/** Replaces product↔modifier links with the given active selection. */
export async function syncProductModifierLinks(
  productId: string,
  modifierIds: ReadonlyArray<string>,
): Promise<string | null> {
  const uniqueIds = [...new Set(modifierIds)];
  if (uniqueIds.length > 0) {
    const found = await getDb()
      .select({ id: productModifiers.id, isActive: productModifiers.isActive })
      .from(productModifiers)
      .where(inArray(productModifiers.id, uniqueIds));

    if (found.length !== uniqueIds.length) {
      return "One or more modifiers were not found.";
    }
    if (found.some((row) => !row.isActive)) {
      return "One or more modifiers are inactive.";
    }
  }

  await getDb()
    .delete(productModifierLinks)
    .where(eq(productModifierLinks.productId, productId));

  if (uniqueIds.length === 0) return null;

  await getDb().insert(productModifierLinks).values(
    uniqueIds.map((modifierId, index) => ({
      id: createId(),
      productId,
      modifierId,
      sortOrder: index,
    })),
  );

  return null;
}

/** Soft-deletes a library modifier (keeps historical order snapshots). */
export async function deactivateProductModifier(
  modifierId: string,
): Promise<void> {
  await getDb()
    .update(productModifiers)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(productModifiers.id, modifierId));

  await getDb()
    .delete(productModifierLinks)
    .where(eq(productModifierLinks.modifierId, modifierId));
}

/** Validates selected modifier IDs are linked+active for the product. */
export async function resolveSelectedModifiersForProduct(
  productId: string,
  modifierIds: ReadonlyArray<string>,
): Promise<
  | { ok: true; modifiers: ProductModifierRow[] }
  | { ok: false; error: string }
> {
  const uniqueIds = [...new Set(modifierIds)];
  if (uniqueIds.length === 0) {
    return { ok: true, modifiers: [] };
  }

  const linked = await listLinkedModifiersForProduct(productId);
  const byId = new Map(linked.map((row) => [row.id, row] as const));
  const resolved: ProductModifierRow[] = [];

  for (const id of uniqueIds) {
    const row = byId.get(id);
    if (!row) {
      return { ok: false, error: "Invalid product modifier selection." };
    }
    resolved.push(row);
  }

  return { ok: true, modifiers: resolved };
}
