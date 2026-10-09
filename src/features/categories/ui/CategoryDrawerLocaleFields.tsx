'use client';

import { AdminLocaleTabs } from '@/features/admin/ui/AdminLocaleTabs';
import { ADMIN_INPUT, ADMIN_LABEL } from '@/features/admin/ui/admin-form-classes';
import { slugifyCategoryTitle } from '@/features/categories/domain/slugify';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

export type CategoryLocaleDraft = {
  title: string;
  slug: string;
  slugTouched: boolean;
};

export type CategoryTranslationInput = Partial<
  Record<Locale, { title: string; slug: string }>
>;

type CategoryDrawerLocaleFieldsProps = {
  active: Locale;
  drafts: Record<Locale, CategoryLocaleDraft>;
  disabled: boolean;
  onActiveChange: (locale: Locale) => void;
  onDraftChange: (locale: Locale, patch: Partial<CategoryLocaleDraft>) => void;
};

export function emptyCategoryDrafts(): Record<Locale, CategoryLocaleDraft> {
  return {
    hy: { title: '', slug: '', slugTouched: false },
    en: { title: '', slug: '', slugTouched: false },
    ru: { title: '', slug: '', slugTouched: false },
  };
}

export function categoryDraftsFrom(
  translations: CategoryTranslationInput | undefined,
): Record<Locale, CategoryLocaleDraft> {
  const drafts = emptyCategoryDrafts();
  for (const loc of locales) {
    const copy = translations?.[loc];
    if (!copy?.title) continue;
    drafts[loc] = { title: copy.title, slug: copy.slug, slugTouched: true };
  }
  return drafts;
}

export function categoryHasTitle(drafts: Record<Locale, CategoryLocaleDraft>): boolean {
  return locales.some((loc) => drafts[loc].title.trim().length > 0);
}

/** Keeps only locales that have a title, with a slug derived from that title when untouched. */
export function collectCategoryTranslations(
  drafts: Record<Locale, CategoryLocaleDraft>,
): CategoryTranslationInput | null {
  const translations: CategoryTranslationInput = {};
  for (const loc of locales) {
    const title = drafts[loc].title.trim();
    if (!title) continue;
    const typedSlug = drafts[loc].slugTouched ? drafts[loc].slug.trim() : '';
    translations[loc] = {
      title,
      slug: slugifyCategoryTitle(typedSlug || title),
    };
  }
  return Object.keys(translations).length > 0 ? translations : null;
}

export function CategoryDrawerLocaleFields({
  active,
  drafts,
  disabled,
  onActiveChange,
  onDraftChange,
}: CategoryDrawerLocaleFieldsProps) {
  const draft = drafts[active];
  const displaySlug = draft.slugTouched ? draft.slug : slugifyCategoryTitle(draft.title);
  const copy = getDictionary(active).admin;
  const fields = copy.categories.drawer;

  return (
    <>
      <AdminLocaleTabs label={copy.common.languages} active={active} onChange={onActiveChange} />
      <label className="block">
        <span className={ADMIN_LABEL}>
          {fields.categoryTitle} <span className="text-red-600">{copy.common.requiredMark}</span>
        </span>
        <input
          value={draft.title}
          onChange={(event) => onDraftChange(active, { title: event.target.value })}
          placeholder={fields.categoryTitlePlaceholder}
          className={ADMIN_INPUT}
          disabled={disabled}
        />
      </label>
      <label className="block">
        <span className={ADMIN_LABEL}>{fields.slug}</span>
        <input
          value={displaySlug === 'category' && !draft.title.trim() ? '' : displaySlug}
          onChange={(event) =>
            onDraftChange(active, { slug: event.target.value, slugTouched: true })
          }
          placeholder={fields.slugPlaceholder}
          className={ADMIN_INPUT}
          disabled={disabled}
        />
        <span className="mt-1 block text-xs text-gray-500">{fields.slugHint}</span>
      </label>
    </>
  );
}
