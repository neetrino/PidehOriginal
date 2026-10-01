const CUSTOMER_NOTE_MAX = 500;

/** Trims a product special request. Empty input becomes null. */
export function normalizeCustomerNote(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return null;
  return trimmed.slice(0, CUSTOMER_NOTE_MAX);
}

/** Keeps an existing line note and appends a new one when it is different. */
export function mergeCustomerNotes(
  current: string | null | undefined,
  next: string | null | undefined,
): string | null {
  const incoming = normalizeCustomerNote(next);
  const existing = normalizeCustomerNote(current);
  if (!incoming) return existing;
  if (!existing) return incoming;
  if (existing.split('\n').includes(incoming)) return existing;
  return normalizeCustomerNote(`${existing}\n${incoming}`);
}
