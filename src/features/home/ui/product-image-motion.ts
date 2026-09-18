/** Fine pointers only — touch must not run the magnetic lift. */
export const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

export const HOVER_LIFT_Y = -12;
export const HOVER_SCALE = 1.24;
export const HOVER_ROTATE_Z = -0.7;
export const MAGNET_X_PX = 5;
export const MAGNET_Y_PX = 3;
export const MAGNET_ROTATE_Z_DEG = 1.5;
export const MAGNET_TILT_DEG = 2;
export const TOUCH_PRESS_SCALE = 0.98;

/** Overshoots slightly, then settles — not a linear zoom. */
export const ENTER_SPRING = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 22,
  mass: 0.52,
};

export const MAGNET_SPRING = {
  stiffness: 240,
  damping: 28,
  mass: 0.42,
} as const;

export const EXIT_SPRING = {
  type: 'spring' as const,
  stiffness: 320,
  damping: 30,
  mass: 0.65,
};

export type ProductImageMagnet = {
  x: number;
  y: number;
  rotateZ: number;
  rotateX: number;
  rotateY: number;
};

/** Clamp a value to the -1…1 pointer range. */
export function clampUnit(value: number): number {
  if (value < -1) return -1;
  if (value > 1) return 1;
  return value;
}

/** Maps a normalized pointer (-1…1) to the magnetic transform caps. */
export function magnetFromPointer(nx: number, ny: number): ProductImageMagnet {
  const x = clampUnit(nx);
  const y = clampUnit(ny);
  return {
    x: x * MAGNET_X_PX,
    y: y * MAGNET_Y_PX,
    rotateZ: x * MAGNET_ROTATE_Z_DEG,
    rotateY: x * MAGNET_TILT_DEG,
    rotateX: -(y * MAGNET_TILT_DEG) + 0,
  };
}
