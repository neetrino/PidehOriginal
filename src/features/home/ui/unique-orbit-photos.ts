/**
 * Unique photo URLs for the desktop category ring — never repeats a file.
 */
export function uniqueOrbitPhotos(urls: readonly (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const url of urls) {
    if (!url || seen.has(url)) {
      continue;
    }
    seen.add(url);
    unique.push(url);
  }

  return unique;
}
