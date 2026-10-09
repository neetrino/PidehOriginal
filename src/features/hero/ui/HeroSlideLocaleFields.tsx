'use client';

import { AdminLocaleTabs } from '@/features/admin/ui/AdminLocaleTabs';
import { ADMIN_INPUT, ADMIN_LABEL } from '@/features/admin/ui/admin-form-classes';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

export type HeroLocaleDraft = {
  title: string;
  subtitle: string;
};

export type HeroTranslationInput = Partial<
  Record<Locale, { title: string; subtitle?: string }>
>;

type HeroSlideLocaleFieldsProps = {
  active: Locale;
  drafts: Record<Locale, HeroLocaleDraft>;
  disabled: boolean;
  onActiveChange: (locale: Locale) => void;
  onDraftChange: (locale: Locale, patch: Partial<HeroLocaleDraft>) => void;
};

export function emptyHeroDrafts(): Record<Locale, HeroLocaleDraft> {
  return {
    hy: { title: '', subtitle: '' },
    en: { title: '', subtitle: '' },
    ru: { title: '', subtitle: '' },
  };
}

export function heroDraftsFrom(
  translations: Partial<Record<Locale, { title: string; subtitle?: string }>> | undefined,
): Record<Locale, HeroLocaleDraft> {
  const drafts = emptyHeroDrafts();
  for (const loc of locales) {
    const copy = translations?.[loc];
    if (!copy?.title) continue;
    drafts[loc] = { title: copy.title, subtitle: copy.subtitle ?? '' };
  }
  return drafts;
}

/** Keeps locales that have a title. */
export function collectHeroTranslations(
  drafts: Record<Locale, HeroLocaleDraft>,
): HeroTranslationInput | null {
  const translations: HeroTranslationInput = {};
  for (const loc of locales) {
    const title = drafts[loc].title.trim();
    if (!title) continue;
    const subtitle = drafts[loc].subtitle.trim();
    translations[loc] = subtitle ? { title, subtitle } : { title };
  }
  return Object.keys(translations).length > 0 ? translations : null;
}

export function HeroSlideLocaleFields({
  active,
  drafts,
  disabled,
  onActiveChange,
  onDraftChange,
}: HeroSlideLocaleFieldsProps) {
  const draft = drafts[active];
  const copy = getDictionary(active).admin;

  return (
    <>
      <AdminLocaleTabs label={copy.common.languages} active={active} onChange={onActiveChange} />
      <label className="block">
        <span className={ADMIN_LABEL}>{copy.hero.drawer.title}</span>
        <input
          value={draft.title}
          onChange={(event) => onDraftChange(active, { title: event.target.value })}
          className={ADMIN_INPUT}
          disabled={disabled}
        />
      </label>
      <label className="block">
        <span className={ADMIN_LABEL}>{copy.hero.drawer.subtitle}</span>
        <input
          value={draft.subtitle}
          onChange={(event) => onDraftChange(active, { subtitle: event.target.value })}
          className={ADMIN_INPUT}
          disabled={disabled}
        />
      </label>
    </>
  );
}
