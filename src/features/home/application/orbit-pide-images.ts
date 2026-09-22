/** Distinct cutout per orbit slot (pose order: main → top → top-right → bottom-right → bottom). */
export const ORBIT_PIDE_SLUG_BY_SLOT = {
  main: 'pepperoni-pide',
  topCenter: 'shpinat',
  topRight: 'pide-s-bekonom',
  bottomRight: '2-myasa-pide',
  bottomCenter: 'gribnoe-pide',
} as const;

export const ORBIT_PIDE_SLUGS = [
  ORBIT_PIDE_SLUG_BY_SLOT.main,
  ORBIT_PIDE_SLUG_BY_SLOT.topCenter,
  ORBIT_PIDE_SLUG_BY_SLOT.topRight,
  ORBIT_PIDE_SLUG_BY_SLOT.bottomRight,
  ORBIT_PIDE_SLUG_BY_SLOT.bottomCenter,
] as const;

export type OrbitPideImageRow = {
  slug: string;
  url: string;
};

/**
 * Prefers the named pide varieties, then appends every other unique pide
 * photo so the ring can cycle the full catalog.
 */
export function resolveOrbitPideImageUrls(rows: readonly OrbitPideImageRow[]): string[] {
  const bySlug = new Map<string, string>();
  for (const row of rows) {
    if (!bySlug.has(row.slug)) {
      bySlug.set(row.slug, row.url);
    }
  }

  const used = new Set<string>();
  const urls: string[] = [];

  for (const slug of ORBIT_PIDE_SLUGS) {
    const url = bySlug.get(slug);
    if (!url || used.has(url)) {
      continue;
    }
    urls.push(url);
    used.add(url);
  }

  for (const row of rows) {
    if (used.has(row.url)) {
      continue;
    }
    urls.push(row.url);
    used.add(row.url);
  }

  return urls;
}
