import { STOREFRONT_DESKTOP_MEDIA } from '@/components/layout/page-container';

/** Matches storefront desktop chrome (landscape tablet + wide desktop). */
export const HERO_DESKTOP_MEDIA = STOREFRONT_DESKTOP_MEDIA;

/**
 * Start fetching the hero loop only where it actually plays: desktop, and
 * only when motion is allowed.
 */
export const HERO_VIDEO_PRELOAD_MEDIA = `${HERO_DESKTOP_MEDIA} and (prefers-reduced-motion: no-preference)`;

export const HERO_VIDEO_WIDTH = 2096;
export const HERO_VIDEO_HEIGHT = 988;
