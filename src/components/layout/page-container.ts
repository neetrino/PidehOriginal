/**
 * Shared horizontal page gutter for every desktop storefront surface.
 *
 * Anchor: Figma Pideh desktop (1:76) is a 1440 frame and the header pill (1:110)
 * is 1311 wide inside it, so every section must line up on that same column.
 */

/**
 * Content column + gutter in one element.
 *
 * `max-w` is the column plus both gutters (1311 + 2 × 40), so above 1391px the
 * column stays 1311 wide and below it the padding takes over as a minimum
 * gutter. On the 1440 Figma frame content starts at 64.5px, matching the header.
 */
export const PAGE_CONTAINER = 'mx-auto w-full max-w-[1391px] px-4 sm:px-6 lg:px-10';

/** Cancels `PAGE_CONTAINER` padding so a child can bleed to the container edge. */
export const PAGE_BLEED = '-mx-4 sm:-mx-6 lg:-mx-10';

/**
 * Vertical slice of a Figma frame, for sections that position art with absolute
 * frame percentages. Text layers use `absolute inset-x-0` + this row for their
 * vertical placement and `PAGE_CONTAINER` inside for the horizontal gutter, so
 * copy tracks the shared column while the art keeps its frame.
 */
export function pageColumnRow(
  top: number,
  height: number,
  frameHeight: number,
): { top: string; height: string } {
  return {
    top: `${(top / frameHeight) * 100}%`,
    height: `${(height / frameHeight) * 100}%`,
  };
}
