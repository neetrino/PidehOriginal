/** Builds a dialable `tel:` URL from a human-formatted phone number. */
export function toTelHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
