"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useMemo, useRef } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { MobileCategoryLayer } from "@/features/home/ui/mobile/MobileCategoryLayer";
import { MOBILE_HOME_ASSETS } from "@/features/home/ui/mobile/mobile-assets";

type CategoryItem = {
  id: string;
  title: string;
  href: string;
};

export type OrbitCategoryItem = CategoryItem;

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
const ORBIT_CX = 220;
const ORBIT_CY = 40.5;

/**
 * Figma Layer_1 rest poses (440 frame) — exact Dev Mode boxes + tilts.
 * drink −6/189 · mid 64/259 · pide 180/285 · chips 307/248 · sauce 379/194
 */
export const MOBILE_ARC_SLOTS: readonly ArcSlot[] = [
  {
    nodeId: "260:464",
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
    nodeId: "260:451",
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
    nodeId: "260:400",
    src: MOBILE_HOME_ASSETS.catPide,
    // Square fit in yellow disc — leave room below for the in-disc label.
    left: 192,
    top: 268,
    frameW: 56,
    frameH: 56,
    iconW: 56,
    iconH: 56,
    rotate: 0,
  },
  {
    nodeId: "260:441",
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
    nodeId: "260:996",
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
const ORBIT_CLIP = "inset(168px -80px 0 -80px)";

type OrbitPose = {
  angleDeg: number;
  radius: number;
  frameW: number;
  frameH: number;
  iconW: number;
  iconH: number;
  leafRotate: number;
};

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

function neighborAngleDelta(
  fromDeg: number,
  toDeg: number,
  throughInvisible: boolean,
): number {
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

  const radius =
    polars.reduce((sum, pose) => sum + pose.radius, 0) / polars.length;

  return polars.map((pose) => ({ ...pose, radius }));
}

const ORBIT_POSES = buildPoses();

function wrapIndex(value: number, size: number): number {
  return ((value % size) + size) % size;
}

function mobileArcAngleDelta(fromPose: number, toPose: number): number {
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

type RiderProps = {
  src: string;
  title: string;
  href: string;
  nodeId: string;
  pose: OrbitPose;
  poseIndex: number;
  isCenter: boolean;
  reduceMotion: boolean | null;
};

function OrbitRider({
  src,
  title,
  href,
  nodeId,
  pose,
  poseIndex,
  isCenter,
  reduceMotion,
}: RiderProps) {
  const settledPoseIndexRef = useRef(poseIndex);
  const angle = useMotionValue(pose.angleDeg);
  const radius = useMotionValue(pose.radius);
  const boxW = useMotionValue(pose.frameW);
  const boxH = useMotionValue(pose.frameH);

  useEffect(() => {
    const snap = (target: OrbitPose, targetIndex: number) => {
      settledPoseIndexRef.current = targetIndex;
      angle.set(target.angleDeg);
      radius.set(target.radius);
      boxW.set(target.frameW);
      boxH.set(target.frameH);
    };

    if (reduceMotion) {
      snap(pose, poseIndex);
      return;
    }

    const fromPoseIndex = settledPoseIndexRef.current;
    if (fromPoseIndex === poseIndex) {
      snap(pose, poseIndex);
      return;
    }

    const fromPose = ORBIT_POSES[fromPoseIndex];
    if (!fromPose) {
      snap(pose, poseIndex);
      return;
    }

    let finished = false;
    const finish = () => {
      if (finished) {
        return;
      }
      finished = true;
      snap(pose, poseIndex);
    };

    angle.set(fromPose.angleDeg);
    radius.set(fromPose.radius);
    boxW.set(pose.frameW);
    boxH.set(pose.frameH);

    const arcDelta = mobileArcAngleDelta(fromPoseIndex, poseIndex);
    const move = {
      duration: MOBILE_ORBIT_MOVE_MS / 1000,
      ease: [0.22, 1, 0.36, 1] as const,
    };
    const controls = [
      animate(angle, fromPose.angleDeg + arcDelta, {
        ...move,
        onComplete: finish,
      }),
      animate(radius, pose.radius, move),
    ];

    return () => {
      for (const control of controls) {
        control.stop();
      }
      finish();
    };
  }, [angle, boxH, boxW, pose, poseIndex, radius, reduceMotion]);

  const left = useTransform([angle, radius, boxW], (values) => {
    const [angleDeg, radiusPx, widthPx] = values as [number, number, number];
    const rad = (angleDeg * Math.PI) / 180;
    return ORBIT_CX + radiusPx * Math.cos(rad) - widthPx / 2;
  });

  const top = useTransform([angle, radius, boxH], (values) => {
    const [angleDeg, radiusPx, heightPx] = values as [number, number, number];
    const rad = (angleDeg * Math.PI) / 180;
    return ORBIT_CY + radiusPx * Math.sin(rad) - heightPx / 2;
  });

  return (
    <motion.div
      className="absolute will-change-transform"
      style={{
        left,
        top,
        width: pose.frameW,
        height: pose.frameH,
        zIndex: isCenter ? 40 : 30,
      }}
    >
      <AppLink
        href={href}
        prefetchPolicy="intent"
        aria-current={isCenter ? "true" : undefined}
        data-node-id={nodeId}
        className="pointer-events-auto absolute inset-0 flex items-center justify-center"
      >
        <MobileCategoryLayer
          src={src}
          alt={title}
          width={pose.frameW}
          height={pose.frameH}
          iconWidth={pose.iconW}
          iconHeight={pose.iconH}
          rotateDeg={pose.leafRotate}
        />
      </AppLink>
    </motion.div>
  );
}

type MobileCategoryOrbitProps = {
  spin: number;
  productsHref: string;
  categories: readonly OrbitCategoryItem[];
};

/**
 * Category icons at Figma rest poses; arrow spin rides the drip ellipse.
 * Edge wrap travels through the clipped (invisible) upper arc.
 */
export function MobileCategoryOrbit({
  spin,
  productsHref,
  categories,
}: MobileCategoryOrbitProps) {
  const reduceMotion = useReducedMotion();

  const riders = useMemo(() => {
    return MOBILE_ARC_SLOTS.map((home, riderIndex) => {
      const poseIndex = wrapIndex(riderIndex - spin, MOBILE_SLOT_COUNT);
      const pose = ORBIT_POSES[poseIndex] ?? ORBIT_POSES[MOBILE_CENTER_SLOT]!;
      const category = categories[riderIndex];

      return {
        key: `mobile-orbit-${riderIndex}`,
        poseIndex,
        pose,
        src: home.src,
        nodeId: home.nodeId,
        href: category?.href ?? productsHref,
        title: category?.title ?? "",
        isCenter: poseIndex === MOBILE_CENTER_SLOT,
      };
    });
  }, [categories, productsHref, spin]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30"
      style={{ clipPath: ORBIT_CLIP }}
    >
      {riders.map((rider) => (
        <OrbitRider
          key={rider.key}
          src={rider.src}
          title={rider.title}
          href={rider.href}
          nodeId={rider.nodeId}
          pose={rider.pose}
          poseIndex={rider.poseIndex}
          isCenter={rider.isCenter}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  );
}

/** Title of the category currently sitting in the yellow center disc. */
export function mobileActiveCategoryTitle(
  spin: number,
  categories: readonly OrbitCategoryItem[],
): string {
  if (categories.length === 0) {
    return "";
  }
  const riderIndex = wrapIndex(MOBILE_CENTER_SLOT + spin, categories.length);
  return categories[riderIndex]?.title ?? "";
}
