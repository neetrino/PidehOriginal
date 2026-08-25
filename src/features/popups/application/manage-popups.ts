"use server";

import { eq, ne } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";

import { auditLogs, mediaAssets, storePopups } from "@/db/schema";
import { withTransaction } from "@/db/transaction";
import {
  persistPopupImage,
  removePopupImage,
} from "@/features/popups/application/persist-popup-media";
import {
  popupRuleErrorMessage,
  validatePopupFields,
} from "@/features/popups/domain/popup-rules";
import {
  deletePopupSchema,
  togglePopupSchema,
  upsertPopupSchema,
  type DeletePopupInput,
  type TogglePopupInput,
  type UpsertPopupInput,
} from "@/features/popups/schemas";
import { requireAdmin } from "@/lib/auth/policies";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createId } from "@/lib/id";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { err, ok, type Result } from "@/lib/result";

function parseDrawerFormData(formData: FormData): UpsertPopupInput | null {
  const linkRaw = String(formData.get("linkUrl") ?? "").trim();
  const parsed = upsertPopupSchema.safeParse({
    title: formData.get("title"),
    linkUrl: linkRaw || undefined,
  });
  return parsed.success ? parsed.data : null;
}

function normalizeLinkUrl(linkUrl: string | undefined): string | null {
  const trimmed = linkUrl?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function revalidatePopups(locale: string): void {
  revalidatePath(`/${locale}/admin/popups`);
  for (const loc of ["hy", "en", "ru"] as const) {
    revalidatePath(`/${loc}`, "layout");
  }
  updateTag(CACHE_TAGS.popups);
}

/** Creates a storefront popup from the admin drawer. */
export async function createPopupAction(
  locale: string,
  formData: FormData,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const data = parseDrawerFormData(formData);
  if (!data) {
    return err("VALIDATION_ERROR", "Invalid popup payload.");
  }

  const ruleError = validatePopupFields(data);
  if (ruleError) {
    return err(ruleError, popupRuleErrorMessage(ruleError));
  }

  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return err("IMAGE_REQUIRED", "Popup image is required.");
  }

  const actor = await requireAdmin(locale as Locale);
  const id = createId();
  const linkUrl = normalizeLinkUrl(data.linkUrl);

  try {
    await withTransaction(async (tx) => {
      await tx.insert(storePopups).values({
        id,
        title: data.title.trim(),
        linkUrl,
        isActive: false,
      });

      await tx.insert(auditLogs).values({
        id: createId(),
        actorUserId: actor.id,
        action: "popup.create",
        targetType: "store_popup",
        targetId: id,
        afterDiff: {
          title: data.title.trim(),
          linkUrl,
          isActive: false,
        },
        correlationId: createId(),
      });
    });

    const mediaResult = await persistPopupImage(id, image);
    if (mediaResult.error) {
      return err("VALIDATION_ERROR", mediaResult.error);
    }

    revalidatePopups(locale);
    return ok({ id });
  } catch {
    return err("POPUP_CREATE_FAILED", "Unable to create popup.");
  }
}

/** Updates an existing popup from the admin drawer. */
export async function updatePopupAction(
  locale: string,
  popupId: string,
  formData: FormData,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const data = parseDrawerFormData(formData);
  if (!data) {
    return err("VALIDATION_ERROR", "Invalid popup payload.");
  }

  const ruleError = validatePopupFields(data);
  if (ruleError) {
    return err(ruleError, popupRuleErrorMessage(ruleError));
  }

  const actor = await requireAdmin(locale as Locale);
  const linkUrl = normalizeLinkUrl(data.linkUrl);
  const removeImage = formData.get("removeImage") === "1";
  const image = formData.get("image");
  const hasNewImage = image instanceof File && image.size > 0;

  if (removeImage && !hasNewImage) {
    return err("IMAGE_REQUIRED", "Popup image is required.");
  }

  try {
    await withTransaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(storePopups)
        .where(eq(storePopups.id, popupId))
        .for("update")
        .limit(1);

      if (!existing) {
        throw new Error("NOT_FOUND");
      }

      await tx
        .update(storePopups)
        .set({
          title: data.title.trim(),
          linkUrl,
          updatedAt: new Date(),
        })
        .where(eq(storePopups.id, popupId));

      await tx.insert(auditLogs).values({
        id: createId(),
        actorUserId: actor.id,
        action: "popup.update",
        targetType: "store_popup",
        targetId: popupId,
        beforeDiff: {
          title: existing.title,
          linkUrl: existing.linkUrl,
          isActive: existing.isActive,
        },
        afterDiff: {
          title: data.title.trim(),
          linkUrl,
          isActive: existing.isActive,
        },
        correlationId: createId(),
      });
    });

    if (removeImage) {
      await removePopupImage(popupId);
    }

    if (hasNewImage && image instanceof File) {
      const mediaResult = await persistPopupImage(popupId, image);
      if (mediaResult.error) {
        return err("VALIDATION_ERROR", mediaResult.error);
      }
    }

    revalidatePopups(locale);
    return ok({ id: popupId });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return err("NOT_FOUND", "Popup not found.");
    }
    return err("POPUP_UPDATE_FAILED", "Unable to update popup.");
  }
}

/** Activates or deactivates a popup (only one may be active). */
export async function togglePopupAction(
  locale: string,
  raw: TogglePopupInput,
): Promise<Result<{ id: string; isActive: boolean }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const parsed = togglePopupSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Invalid toggle payload.");
  }

  const actor = await requireAdmin(locale as Locale);

  try {
    const result = await withTransaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(storePopups)
        .where(eq(storePopups.id, parsed.data.popupId))
        .for("update")
        .limit(1);

      if (!existing) {
        throw new Error("NOT_FOUND");
      }

      if (parsed.data.isActive) {
        const [media] = await tx
          .select({ id: mediaAssets.id })
          .from(mediaAssets)
          .where(eq(mediaAssets.popupId, existing.id))
          .limit(1);

        if (!media) {
          throw new Error("IMAGE_REQUIRED");
        }

        await tx
          .update(storePopups)
          .set({ isActive: false, updatedAt: new Date() })
          .where(ne(storePopups.id, existing.id));
      }

      await tx
        .update(storePopups)
        .set({ isActive: parsed.data.isActive, updatedAt: new Date() })
        .where(eq(storePopups.id, existing.id));

      await tx.insert(auditLogs).values({
        id: createId(),
        actorUserId: actor.id,
        action: "popup.toggle",
        targetType: "store_popup",
        targetId: existing.id,
        beforeDiff: { isActive: existing.isActive },
        afterDiff: { isActive: parsed.data.isActive },
        correlationId: createId(),
      });

      return { id: existing.id, isActive: parsed.data.isActive };
    });

    revalidatePopups(locale);
    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return err("NOT_FOUND", "Popup not found.");
    }
    if (error instanceof Error && error.message === "IMAGE_REQUIRED") {
      return err("IMAGE_REQUIRED", "Popup image is required before activation.");
    }
    return err("POPUP_TOGGLE_FAILED", "Unable to toggle popup.");
  }
}

/** Deletes a popup and its media with audit. */
export async function deletePopupAction(
  locale: string,
  raw: DeletePopupInput,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const parsed = deletePopupSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Invalid delete payload.");
  }

  const actor = await requireAdmin(locale as Locale);

  try {
    await withTransaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(storePopups)
        .where(eq(storePopups.id, parsed.data.popupId))
        .for("update")
        .limit(1);

      if (!existing) {
        throw new Error("NOT_FOUND");
      }

      await tx
        .delete(mediaAssets)
        .where(eq(mediaAssets.popupId, existing.id));

      await tx.delete(storePopups).where(eq(storePopups.id, existing.id));

      await tx.insert(auditLogs).values({
        id: createId(),
        actorUserId: actor.id,
        action: "popup.delete",
        targetType: "store_popup",
        targetId: existing.id,
        beforeDiff: {
          title: existing.title,
          isActive: existing.isActive,
        },
        correlationId: createId(),
      });
    });

    revalidatePopups(locale);
    return ok({ id: parsed.data.popupId });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return err("NOT_FOUND", "Popup not found.");
    }
    return err("POPUP_DELETE_FAILED", "Unable to delete popup.");
  }
}
