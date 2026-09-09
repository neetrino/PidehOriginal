import { MOBILE_HOME_ASSETS } from '@/features/home/ui/mobile/mobile-assets';

type ArcSlot = {
  nodeId: string;
  src: string;
  left: number;
  top: number;
  frameW: number;
  frameH: number;
  iconW: number;
  iconH: number;
  rotate: number;
};

/** Figma drip ellipse center (Group 70674: top −280, size 641 → cy 40.5). */
export const ORBIT_CX = 220;
export const ORBIT_CY = 40.5;

/**
 * Pixel decimals shared by SSR HTML and the first client render.
 * Prevents React hydration mismatches from float→CSS rounding.
 */
export const ORBIT_PIXEL_PRECISION = 4;

/**
 * Figma Layer_1 rest poses (440 frame) — exact Dev Mode boxes + tilts.
 * drink −6/189 · mid 64/259 · pide 180/285 · chips 307/248 · sauce 379/194
 */
export const MOBILE_ARC_SLOTS: readonly ArcSlot[] = [
  {
    nodeId: '260:464',
    src: MOBILE_HOME_ASSETS.catDrink,
    left: -6,
    top: 189,
    frameW: 66.06,
    frameH: 70.34,
    iconW: 35.56,
    iconH: 61.55,
    rotate: 38.3,
  },
  {
    nodeId: '260:451',
    src: MOBILE_HOME_ASSETS.catSandwich,
    left: 64,
    top: 259,
    frameW: 67.14,
    frameH: 65.56,
    iconW: 51.02,
    iconH: 47.29,
    rotate: 27.65,
  },
  {
    nodeId: '260:400',
    src: MOBILE_HOME_ASSETS.catPide,
    left: 192,
    top: 268,
    frameW: 56,
    frameH: 56,
    iconW: 56,
    iconH: 56,
    rotate: 0,
  },
  {
    nodeId: '260:441',
    src: MOBILE_HOME_ASSETS.catSnack,
    left: 307,
    top: 248,
    frameW: 70.47,
    frameH: 68.42,
    iconW: 54.1,
    iconH: 49.6,
    rotate: -26.28,
  },
  {
    nodeId: '260:996',
    src: MOBILE_HOME_ASSETS.catBurger,
    left: 379,
    top: 194,
    frameW: 65.99,
    frameH: 64.76,
    iconW: 51.42,
    iconH: 41.39,
    rotate: -40.01,
  },
] as const;

export const MOBILE_SLOT_COUNT = MOBILE_ARC_SLOTS.length;
export const MOBILE_CENTER_SLOT = 2;
export const MOBILE_ORBIT_MOVE_MS = 750;

/** Hide the upper orbit path behind / above the white drip. */
export const ORBIT_CLIP = 'inset(168px -80px 0 -80px)';

export type OrbitPose = {
  angleDeg: number;
  radius: number;
  frameW: number;
  frameH: number;
  iconW: number;
  iconH: number;
  leafRotate: number;
};

export type OrbitNodeGeometry = {
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
};

/** Inline styles with identical string form on server and client. */
export type OrbitNodeStyle = {
  left: string;
  top: string;
  width: string;
  height: string;
  zIndex: number;
};

export function normalizePixel(value: number, precision: number = ORBIT_PIXEL_PRECISION): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function toCssPx(value: number): string {
  return `${normalizePixel(value)}px`;
}

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

function isWrapEdgePair(a: number, b: number): boolean {
  const last = MOBILE_SLOT_COUNT - 1;
  return (a === 0 && b === last) || (a === last && b === 0);
}

function neighborAngleDelta(fromDeg: number, toDeg: number, throughInvisible: boolean): number {
  const short = shortestAngleDelta(fromDeg, toDeg);
  if (!throughInvisible || short === 0) {
    return short;
  }
  return short > 0 ? short - 360 : short + 360;
}

/** Rest poses from Figma boxes; shared radius so motion stays on one circle. */
function buildPoses(): readonly OrbitPose[] {
  const polars = MOBILE_ARC_SLOTS.map((slot) => {
    const cx = slot.left + slot.frameW / 2;
    const cy = slot.top + slot.frameH / 2;
    return {
      angleDeg: (Math.atan2(cy - ORBIT_CY, cx - ORBIT_CX) * 180) / Math.PI,
      radius: Math.hypot(cx - ORBIT_CX, cy - ORBIT_CY),
      frameW: slot.frameW,
      frameH: slot.frameH,
      iconW: slot.iconW,
      iconH: slot.iconH,
      leafRotate: slot.rotate,
    };
  });

  const radius = polars.reduce((sum, pose) => sum + pose.radius, 0) / polars.length;

  return polars.map((pose) => ({
    ...pose,
    angleDeg: normalizePixel(pose.angleDeg, 6),
    radius: normalizePixel(radius, 6),
  }));
}

export const ORBIT_POSES = buildPoses();

export function wrapIndex(value: number, size: number): number {
  return ((value % size) + size) % size;
}

export function mobileArcAngleDelta(fromPose: number, toPose: number): number {
  let steps = toPose - fromPose;
  while (steps > MOBILE_SLOT_COUNT / 2) {
    steps -= MOBILE_SLOT_COUNT;
  }
  while (steps < -MOBILE_SLOT_COUNT / 2) {
    steps += MOBILE_SLOT_COUNT;
  }

  let delta = 0;
  if (steps >= 0) {
    for (let i = 0; i < steps; i += 1) {
      const a = wrapIndex(fromPose + i, MOBILE_SLOT_COUNT);
      const b = wrapIndex(fromPose + i + 1, MOBILE_SLOT_COUNT);
      delta += neighborAngleDelta(
        ORBIT_POSES[a]?.angleDeg ?? 0,
        ORBIT_POSES[b]?.angleDeg ?? 0,
        isWrapEdgePair(a, b),
      );
    }
  } else {
    for (let i = 0; i < -steps; i += 1) {
      const a = wrapIndex(fromPose - i, MOBILE_SLOT_COUNT);
      const b = wrapIndex(fromPose - i - 1, MOBILE_SLOT_COUNT);
      delta += neighborAngleDelta(
        ORBIT_POSES[a]?.angleDeg ?? 0,
        ORBIT_POSES[b]?.angleDeg ?? 0,
        isWrapEdgePair(a, b),
      );
    }
  }
  return delta;
}

/** Canonical left/top for a pose (single calculation path for SSR + client). */
export function calculateOrbitPosition(pose: OrbitPose): {
  left: number;
  top: number;
} {
  const rad = (pose.angleDeg * Math.PI) / 180;
  return {
    left: normalizePixel(ORBIT_CX + pose.radius * Math.cos(rad) - pose.frameW / 2),
    top: normalizePixel(ORBIT_CY + pose.radius * Math.sin(rad) - pose.frameH / 2),
  };
}

export function getOrbitNodeGeometry(pose: OrbitPose, isCenter: boolean): OrbitNodeGeometry {
  const { left, top } = calculateOrbitPosition(pose);
  return {
    left,
    top,
    width: normalizePixel(pose.frameW),
    height: normalizePixel(pose.frameH),
    zIndex: isCenter ? 40 : 30,
  };
}

/**
 * Deterministic CSS for the rider box. Always uses px strings so React SSR
 * markup and the first client fiber style props are byte-identical.
 */
export function getOrbitNodeStyle(pose: OrbitPose, isCenter: boolean): OrbitNodeStyle {
  const geometry = getOrbitNodeGeometry(pose, isCenter);
  return {
    left: toCssPx(geometry.left),
    top: toCssPx(geometry.top),
    width: toCssPx(geometry.width),
    height: toCssPx(geometry.height),
    zIndex: geometry.zIndex,
  };
}
