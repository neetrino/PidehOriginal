import { z } from 'zod';

const localeCopySchema = z.object({
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().max(240).optional(),
  buttonLabel: z.string().trim().max(80).optional(),
  buttonUrl: z.string().trim().max(500).optional(),
});

const heroLocaleInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().max(240).optional(),
});

/** Modal create/edit payload — per-locale copy, image handled separately. */
export const upsertHeroSlideSchema = z.object({
  translations: z
    .object({
      hy: heroLocaleInputSchema.optional(),
      en: heroLocaleInputSchema.optional(),
      ru: heroLocaleInputSchema.optional(),
    })
    .refine((value) => value.hy != null || value.en != null || value.ru != null),
});

export type UpsertHeroSlideInput = z.infer<typeof upsertHeroSlideSchema>;

export const toggleHeroSlideSchema = z.object({
  slideId: z.string().uuid(),
  isActive: z.boolean(),
});

export type ToggleHeroSlideInput = z.infer<typeof toggleHeroSlideSchema>;

export const reorderHeroSlideSchema = z.object({
  slideId: z.string().uuid(),
  direction: z.enum(['up', 'down']),
});

export type ReorderHeroSlideInput = z.infer<typeof reorderHeroSlideSchema>;

export const deleteHeroSlideSchema = z.object({
  slideId: z.string().uuid(),
});

export type DeleteHeroSlideInput = z.infer<typeof deleteHeroSlideSchema>;

export { localeCopySchema };
