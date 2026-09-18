/** Formats a scheduled slot as `14:00-15:00, 20.09.2026`. */
export function formatScheduledDeliveryCaption(
  date: string | undefined,
  start: string | undefined,
  end: string | undefined,
): string | null {
  const trimmedDate = date?.trim();
  const trimmedStart = start?.trim();
  const trimmedEnd = end?.trim();
  if (!trimmedDate || !trimmedStart || !trimmedEnd) {
    return null;
  }

  const [year, month, day] = trimmedDate.split('-');
  const dotted = year && month && day ? `${day}.${month}.${year}` : trimmedDate;
  return `${trimmedStart}-${trimmedEnd}, ${dotted}`;
}
