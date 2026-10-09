'use client';

import { AdminLocaleTabs } from '@/features/admin/ui/AdminLocaleTabs';
import { ADMIN_INPUT, ADMIN_LABEL, ADMIN_TEXTAREA } from '@/features/admin/ui/admin-form-classes';
import { slugifyCategoryTitle } from '@/features/categories/domain/slugify';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

export type ProductLocaleDraft = {
  title: string;
  slug: string;
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
    hy: { title: '', slug: '', description: '' },
    en: { title: '', slug: '', description: '' },
    ru: { title: '', slug: '', description: '' },
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
      slug: copy.slug,
      description: copy.description ?? '',
    };
  }
  return drafts;
}

/** Keeps locales that have a title. An empty slug is built from that title. */
export function collectProductTranslations(
  drafts: Record<Locale, ProductLocaleDraft>,
): ProductTranslationInput | null {
  const translations: ProductTranslationInput = {};
  for (const loc of locales) {
    const title = drafts[loc].title.trim();
    if (!title) continue;
    const description = drafts[loc].description.trim();
    translations[loc] = {
      title,
      slug: drafts[loc].slug.trim() || slugifyCategoryTitle(title),
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
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
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
        <label>
          <span className={ADMIN_LABEL}>
            {fields.slug} <span className="text-red-600">{copy.common.requiredMark}</span>
          </span>
          <input
            value={draft.slug}
            onChange={(event) => onDraftChange(active, { slug: event.target.value })}
            placeholder={fields.slugPlaceholder}
            className={ADMIN_INPUT}
            disabled={disabled}
          />
        </label>
      </div>
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
