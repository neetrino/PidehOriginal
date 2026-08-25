import { z } from "zod";

const LINK_URL_PATTERN = /^(?:\/[A-Za-z0-9/_-]*)|(?:https?:\/\/.+)$/;

/** Create/edit payload — image handled separately via FormData. */
export const upsertPopupSchema = z.object({
  title: z.string().trim().min(1).max(120),
  linkUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .refine(
      (value) => value == null || value === "" || LINK_URL_PATTERN.test(value),
      "Link URL must be a site path or http(s) URL.",
    ),
});

export type UpsertPopupInput = z.infer<typeof upsertPopupSchema>;

export const togglePopupSchema = z.object({
  popupId: z.string().uuid(),
  isActive: z.boolean(),
});

export type TogglePopupInput = z.infer<typeof togglePopupSchema>;

export const deletePopupSchema = z.object({
  popupId: z.string().uuid(),
});

export type DeletePopupInput = z.infer<typeof deletePopupSchema>;
