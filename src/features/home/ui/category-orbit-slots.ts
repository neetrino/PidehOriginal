/** Figma Categories frame (1:373) — 1448 × 850. */
export const CATEGORY_FRAME = { w: 1448, h: 850 } as const;

export const SLOT_COUNT = 5;

/** Figma Ellipse 3469 center (arc the pides ride on). */
export const ORBIT_CIRCLE = {
  cx: 1034.27 + 691.104 / 2,
  cy: 108.24 + 691.104 / 2,
} as const;

export function categoryFigmaBox(
  x: number,
  y: number,
  width: number,
  height: number,
) {
  return {
    left: `${(x / CATEGORY_FRAME.w) * 100}%`,
    top: `${(y / CATEGORY_FRAME.h) * 100}%`,
    width: `${(width / CATEGORY_FRAME.w) * 100}%`,
    height: `${(height / CATEGORY_FRAME.h) * 100}%`,
  };
}

function polarFromBox(
  x: number,
  y: number,
  width: number,
  height: number,
): { angleDeg: number; radius: number } {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  return {
    angleDeg:
      (Math.atan2(centerY - ORBIT_CIRCLE.cy, centerX - ORBIT_CIRCLE.cx) *
        180) /
      Math.PI,
    radius: Math.hypot(centerX - ORBIT_CIRCLE.cx, centerY - ORBIT_CIRCLE.cy),
  };
}

export type OrbitSlotPose = {
  box: ReturnType<typeof categoryFigmaBox>;
  x: number;
  y: number;
  w: number;
  h: number;
  /** atan2 degrees from ORBIT_CIRCLE (y-down). */
  angleDeg: number;
  radius: number;
  /**
   * Exact Figma leaf transform utilities (`-scale-y-100` / `rotate-*`).
   * Keep as Tailwind classes so transform order matches Dev Mode.
   */
  innerClassName: string;
  innerWidth: string;
  innerHeight: string;
  zIndex: number;
};

function createPose(
  x: number,
  y: number,
  w: number,
  h: number,
  innerClassName: string,
  innerWidth: string,
  innerHeight: string,
  zIndex: number,
): OrbitSlotPose {
  const polar = polarFromBox(x, y, w, h);
  return {
    box: categoryFigmaBox(x, y, w, h),
    x,
    y,
    w,
    h,
    angleDeg: polar.angleDeg,
    radius: polar.radius,
    innerClassName,
    innerWidth,
    innerHeight,
    zIndex,
  };
}

/**
 * Orbit AABBs from Figma Group 70675 (1:374). Slot 0 is the featured (largest).
 * Sizes unchanged — only tilts use Figma class transforms.
 */
export const ORBIT_SLOT_POSES: readonly OrbitSlotPose[] = [
  createPose(
    780,
    334.45,
    516.702,
    243.154,
    "-scale-y-100 rotate-90",
    "47.06%",
    "212.5%",
    8,
  ),
  createPose(
    1096.52,
    91.58,
    272.565,
    242.72,
    "-scale-y-100 rotate-[125.86deg]",
    "43.33%",
    "103.39%",
    5,
  ),
  createPose(
    1414.79,
    53,
    118.186,
    251.145,
    "-scale-y-100",
    "100%",
    "100%",
    3,
  ),
  createPose(
    1414.79,
    598.42,
    118.392,
    251.583,
    "",
    "100%",
    "100%",
    3,
  ),
  createPose(
    1097.4,
    586.96,
    263.173,
    258.582,
    "rotate-[-133.6deg]",
    "44.87%",
    "97.05%",
    5,
  ),
];

function shortestAngleDelta(fromDeg: number, toDeg: number): number {
  let delta = toDeg - fromDeg;
  while (delta > 180) {
    delta -= 360;
  }
  while (delta < -180) {
    delta += 360;
  }
  return delta;
}

/**
 * Angle delta along the ring from `fromPose` to `toPose` (one or more slots).
 * Uses neighbor short arcs so travel stays on the white ellipse path.
 */
export function orbitArcAngleDelta(fromPose: number, toPose: number): number {
  let steps = toPose - fromPose;
  while (steps > SLOT_COUNT / 2) {
    steps -= SLOT_COUNT;
  }
  while (steps < -SLOT_COUNT / 2) {
    steps += SLOT_COUNT;
  }

  let delta = 0;
  if (steps >= 0) {
    for (let i = 0; i < steps; i += 1) {
      const a = (fromPose + i + SLOT_COUNT) % SLOT_COUNT;
      const b = (fromPose + i + 1 + SLOT_COUNT) % SLOT_COUNT;
      const fromAngle = ORBIT_SLOT_POSES[a]?.angleDeg ?? 0;
      const toAngle = ORBIT_SLOT_POSES[b]?.angleDeg ?? 0;
      delta += shortestAngleDelta(fromAngle, toAngle);
    }
  } else {
    for (let i = 0; i < -steps; i += 1) {
      const a = (fromPose - i + SLOT_COUNT) % SLOT_COUNT;
      const b = (fromPose - i - 1 + SLOT_COUNT) % SLOT_COUNT;
      const fromAngle = ORBIT_SLOT_POSES[a]?.angleDeg ?? 0;
      const toAngle = ORBIT_SLOT_POSES[b]?.angleDeg ?? 0;
      delta += shortestAngleDelta(fromAngle, toAngle);
    }
  }
  return delta;
}
