/**
 * Shared storefront layout tokens.
 *
 * Desktop Figma (1:76) is a 1440 frame; the header pill (1:110) is 1311 wide.
 *
 * CSS bands (no JS width detection):
 * - Phone, and iPad portrait (e.g. 1032×1376): Figma-440 mobile tree + dock.
 * - iPad landscape + desktop: 1440 compositions. Landscape density lives in
 *   `storefront-ipad-adaptive.css` / landscape rules in `globals.css`.
 */

/** Desktop chrome: landscape tablets and wide screens. Portrait iPad stays mobile. */
export const STOREFRONT_DESKTOP_MEDIA =
  '(min-width: 768px) and (min-height: 600px) and (orientation: landscape), (min-width: 1200px)';

/** Horizontal gutter that scales between phone and the 1440 column. */
export const PAGE_GUTTER = 'px-[clamp(1rem,3.2vw,2.5rem)]';

/**
 * Content column + gutter in one element.
 *
 * `max-w` is the column plus both gutters (1311 + 2 × 40), so above 1391px the
 * column stays 1311 wide and below it the padding takes over as a minimum
 * gutter. On the 1440 Figma frame content starts at 64.5px, matching the header.
 */
export const PAGE_CONTAINER = `mx-auto w-full max-w-[1391px] min-w-0 ${PAGE_GUTTER}`;

/** Cancels `PAGE_CONTAINER` padding so a child can bleed to the container edge. */
export const PAGE_BLEED = '-mx-[clamp(1rem,3.2vw,2.5rem)]';

/**
 * Full-bleed phone / iPad-portrait marketing shell. Hidden on landscape
 * tablets and desktop, where the 1440 tree takes over.
 */
export const MOBILE_STOREFRONT_SHELL =
  'storefront-mobile-tree relative w-full min-w-0 md:hidden';

/**
 * Full-width column for Figma-440 layouts. `MobileFrame440` scales the 440
 * artboard to this width, so phones fill the viewport.
 */
export const MOBILE_STOREFRONT_COLUMN = 'w-full min-w-0';

/** Desktop dual-tree / footer / header visibility. Portrait iPad is forced
 * back to mobile in `globals.css`. */
export const STOREFRONT_DESKTOP_ONLY = 'storefront-desktop-tree hidden md:block';
export const STOREFRONT_DESKTOP_FLEX = 'storefront-desktop-tree hidden md:flex';
export const STOREFRONT_MOBILE_ONLY = 'md:hidden';

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
