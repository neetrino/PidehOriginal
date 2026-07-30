"use server";

import { getProviders } from "@/config/providers";
import { requireAdmin } from "@/lib/auth/policies";
import { createId } from "@/lib/id";
import { isLocale, type Locale } from "@/lib/i18n/config";
import {
  extensionForImageMime,
  validateImageFile,
} from "@/lib/media/image-file";
import { mediaPublicUrl } from "@/lib/media/public-url";
import { logger } from "@/lib/observability/logger";
import { err, ok, type Result } from "@/lib/result";

/** Uploads a banknote image for a cash-change denomination. */
export async function uploadCashChangeImageAction(
  locale: string,
  formData: FormData,
): Promise<Result<{ objectKey: string; url: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  await requireAdmin(locale as Locale);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return err("VALIDATION", "Image file is required.");
  }

  const validationError = validateImageFile(file);
  if (validationError) {
    return err("VALIDATION", validationError);
  }

  const objectKey = `uploads/delivery/cash-change/${createId()}.${extensionForImageMime(file.type)}`;

  try {
    await getProviders().storage.putObject({
      objectKey,
      body: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
    });
  } catch (error) {
    logger.error("delivery.cash_change_image_upload_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return err("UPLOAD_FAILED", "Image upload failed.");
  }

  return ok({ objectKey, url: mediaPublicUrl(objectKey) });
}
