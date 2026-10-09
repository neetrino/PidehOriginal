'use client';

import { AdminLocaleTabs } from '@/features/admin/ui/AdminLocaleTabs';
import { ADMIN_INPUT, ADMIN_LABEL, ADMIN_TEXTAREA } from '@/features/admin/ui/admin-form-classes';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

export type ProductLocaleDraft = {
  title: string;
  description: string;
};

export type ProductTranslationInput = Partial<
  Record<Locale, { title: string; slug: string; description?: string }>
>;

type ProductDrawerLocaleFieldsProps = {
  active: Locale;
  drafts: Record<Locale, ProductLocaleDraft>;
  disabled: boolean;
  onActiveChange: (locale: Locale) => void;
  onDraftChange: (locale: Locale, patch: Partial<ProductLocaleDraft>) => void;
};

export function emptyProductDrafts(): Record<Locale, ProductLocaleDraft> {
  return {
    hy: { title: '', description: '' },
    en: { title: '', description: '' },
    ru: { title: '', description: '' },
  };
}

export function productDraftsFrom(
  translations: ProductTranslationInput | undefined,
): Record<Locale, ProductLocaleDraft> {
  const drafts = emptyProductDrafts();
  for (const loc of locales) {
    const copy = translations?.[loc];
    if (!copy?.title) continue;
    drafts[loc] = {
      title: copy.title,
      description: copy.description ?? '',
    };
  }
  return drafts;
}

/** Keeps locales that have a title and stores the same English slug on each. */
export function collectProductTranslations(
  drafts: Record<Locale, ProductLocaleDraft>,
  slug: string,
): ProductTranslationInput | null {
  const sharedSlug = slug.trim();
  if (!sharedSlug) return null;
  const translations: ProductTranslationInput = {};
  for (const loc of locales) {
    const title = drafts[loc].title.trim();
    if (!title) continue;
    const description = drafts[loc].description.trim();
    translations[loc] = {
      title,
      slug: sharedSlug,
      ...(description ? { description } : {}),
    };
  }
  return Object.keys(translations).length > 0 ? translations : null;
}

export function ProductDrawerLocaleFields({
  active,
  drafts,
  disabled,
  onActiveChange,
  onDraftChange,
}: ProductDrawerLocaleFieldsProps) {
  const draft = drafts[active];
  const copy = getDictionary(active).admin;
  const fields = copy.products.drawer;

  return (
    <>
      <AdminLocaleTabs label={copy.common.languages} active={active} onChange={onActiveChange} />
      <label className="block">
        <span className={ADMIN_LABEL}>
          {fields.title} <span className="text-red-600">{copy.common.requiredMark}</span>
        </span>
        <input
          value={draft.title}
          onChange={(event) => onDraftChange(active, { title: event.target.value })}
          placeholder={fields.titlePlaceholder}
          className={ADMIN_INPUT}
          disabled={disabled}
        />
      </label>
      <label className="block">
        <span className={ADMIN_LABEL}>{fields.description}</span>
        <textarea
          value={draft.description}
          onChange={(event) => onDraftChange(active, { description: event.target.value })}
          placeholder={fields.descriptionPlaceholder}
          className={ADMIN_TEXTAREA}
          disabled={disabled}
        />
      </label>
    </>
  );
}
