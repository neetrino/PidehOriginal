const ORBIT_SWIPE_THRESHOLD_PX = 40;

export type OrbitSwipeStep = -1 | 1;

/**
 * Horizontal finger/mouse travel → one orbit step.
 * Vertical-dominant movement is ignored so the page can still scroll.
 */
export function resolveOrbitSwipeDelta(dx: number, dy: number): OrbitSwipeStep | 0 {
  if (Math.abs(dx) < ORBIT_SWIPE_THRESHOLD_PX) {
    return 0;
  }
  if (Math.abs(dx) <= Math.abs(dy)) {
    return 0;
  }
  return dx < 0 ? 1 : -1;
}
