/** Tailwind `md` — desktop home hero is hidden below this. */
export const HERO_DESKTOP_MEDIA = '(min-width: 768px)';

/**
 * Start fetching the hero loop only where it actually plays: desktop, and
 * only when motion is allowed.
 */
export const HERO_VIDEO_PRELOAD_MEDIA = `${HERO_DESKTOP_MEDIA} and (prefers-reduced-motion: no-preference)`;

export const HERO_VIDEO_WIDTH = 2096;
export const HERO_VIDEO_HEIGHT = 988;
