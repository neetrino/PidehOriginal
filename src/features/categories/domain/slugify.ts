/** Latin URL slug shared by every language. Other letters are dropped. */
export function slugifyEnglish(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

/** Uses a typed slug when the field was edited, otherwise the English title. */
export function resolveSharedSlug(
  englishTitle: string,
  slug: string,
  slugTouched: boolean,
): string {
  return slugifyEnglish(slugTouched ? slug : englishTitle);
}

/** First candidate that still contains Latin letters after slugifying. */
export function firstLatinSlug(candidates: Array<string | undefined>): string {
  for (const candidate of candidates) {
    const slug = slugifyEnglish(candidate ?? '');
    if (slug) return slug;
  }
  return '';
}

/** Builds a URL-safe slug from a category title. */
export function slugifyCategoryTitle(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);

  return slug || 'category';
}
