/**
 * Appended to store addresses because the localized copy only carries the
 * street, which Google would otherwise resolve against the visitor's location.
 */
const STORE_REGION = 'Yerevan, Armenia';

/** Builds a Google Maps search URL for a human-readable store address. */
export function toMapsHref(address: string): string {
  const query = `${address}, ${STORE_REGION}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
