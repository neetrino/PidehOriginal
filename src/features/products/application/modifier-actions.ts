"use server";

import { z } from "zod";

import {
  deactivateProductModifier,
  ensureProductModifier,
} from "@/features/products/application/product-modifiers";
import type { ProductModifierRow } from "@/features/products/types/modifiers";
import { requireAdmin } from "@/lib/auth/policies";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { err, ok, type Result } from "@/lib/result";

const createSchema = z.object({
  kind: z.enum(["ADDITION", "EXCEPTION"]),
  name: z.string().trim().min(1).max(120),
  priceAmount: z.number().int().nonnegative(),
});

/** Creates or reactivates a global product modifier (admin). */
export async function createProductModifierAction(
  locale: string,
  raw: unknown,
): Promise<Result<ProductModifierRow>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }
  await requireAdmin(locale as Locale);

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Invalid modifier payload.");
  }

  if (parsed.data.kind === "EXCEPTION" && parsed.data.priceAmount !== 0) {
    return err("VALIDATION_ERROR", "Exceptions cannot have a price.");
  }

  try {
    const row = await ensureProductModifier(parsed.data);
    return ok(row);
  } catch {
    return err("INTERNAL", "Unable to create modifier.");
  }
}

/** Soft-deletes a global modifier and unlinks it from all products. */
export async function deactivateProductModifierAction(
  locale: string,
  modifierId: string,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }
  await requireAdmin(locale as Locale);

  const id = z.string().uuid().safeParse(modifierId);
  if (!id.success) {
    return err("VALIDATION_ERROR", "Invalid modifier id.");
  }

  await deactivateProductModifier(id.data);
  return ok({ id: id.data });
}
