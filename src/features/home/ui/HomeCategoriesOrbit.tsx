'use client';

import Image from 'next/image';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef } from 'react';

import { HomeCategoryArc } from '@/features/home/ui/HomeCategoryArc';
import {
  CATEGORY_FRAME,
  ORBIT_CIRCLE,
  ORBIT_SLOT_POSES,
  SLOT_COUNT,
  orbitArcAngleDelta,
  orbitProductSpanWidthPct,
  orbitProductVisual,
  type OrbitSlotPose,
} from '@/features/home/ui/category-orbit-slots';

type OrbitItem = {
  id: string;
  imageUrl: string;
};

type HomeCategoriesOrbitProps = {
  items: readonly OrbitItem[];
  /** Discrete orbit steps from arrow clicks (grows forever). */
  spin: number;
  arcStyle: CSSProperties;
};

const ORBIT_MOVE = {
  duration: 2.4,
  ease: [0.22, 1, 0.36, 1] as const,
};

/** ms — keep arrow lock until the arc tween has finished. */
export const ORBIT_MOVE_MS = ORBIT_MOVE.duration * 1000 + 80;

function poseSize(pose: OrbitSlotPose): number {
  return Math.sqrt(pose.w * pose.h);
}

const ORBIT_ROTATE_TRANSITION = `transform ${ORBIT_MOVE.duration}s cubic-bezier(0.22, 1, 0.36, 1)`;

type OrbitPideProps = {
  src: string;
  pose: OrbitSlotPose;
  poseIndex: number;
  reduceMotion: boolean | null;
};

/**
 * Glides along the white ring with uniform scale. Catalog cutouts stay
 * unclipped; rotation is applied on the image, not a masking wrapper.
 */
function OrbitPide({ src, pose, poseIndex, reduceMotion }: OrbitPideProps) {
  const settledPoseIndexRef = useRef(poseIndex);
  const angle = useMotionValue(pose.angleDeg);
  const radius = useMotionValue(pose.radius);
  const boxW = useMotionValue(pose.w);
  const boxH = useMotionValue(pose.h);
  const scale = useMotionValue(1);

  useEffect(() => {
    const snapToPose = (target: OrbitSlotPose, targetIndex: number) => {
      settledPoseIndexRef.current = targetIndex;
      angle.set(target.angleDeg);
      radius.set(target.radius);
      boxW.set(target.w);
      boxH.set(target.h);
      scale.set(1);
    };

    if (reduceMotion) {
      snapToPose(pose, poseIndex);
      return;
    }

    const fromPoseIndex = settledPoseIndexRef.current;
    if (fromPoseIndex === poseIndex) {
      snapToPose(pose, poseIndex);
      return;
    }

    const fromPose = ORBIT_SLOT_POSES[fromPoseIndex];
    if (!fromPose) {
      snapToPose(pose, poseIndex);
      return;
    }

    let finished = false;
    const finish = () => {
      if (finished) {
        return;
      }
      finished = true;
      snapToPose(pose, poseIndex);
    };

    boxW.set(pose.w);
    boxH.set(pose.h);
    angle.set(fromPose.angleDeg);
    radius.set(fromPose.radius);
    scale.set(poseSize(fromPose) / poseSize(pose));

    const arcDelta = orbitArcAngleDelta(fromPoseIndex, poseIndex);
    const controls = [
      animate(angle, fromPose.angleDeg + arcDelta, {
        ...ORBIT_MOVE,
        onComplete: finish,
      }),
      animate(radius, pose.radius, ORBIT_MOVE),
      animate(scale, 1, ORBIT_MOVE),
    ];

    return () => {
      for (const control of controls) {
        control.stop();
      }
      finish();
    };
  }, [angle, boxH, boxW, pose, poseIndex, radius, reduceMotion, scale]);

  const left = useTransform([angle, radius, boxW], (values) => {
    const [angleDeg, radiusPx, widthPx] = values as [number, number, number];
    const rad = (angleDeg * Math.PI) / 180;
    const centerX = ORBIT_CIRCLE.cx + radiusPx * Math.cos(rad);
    const x = centerX - widthPx / 2;
    return `${(x / CATEGORY_FRAME.w) * 100}%`;
  });

  const top = useTransform([angle, radius, boxH], (values) => {
    const [angleDeg, radiusPx, heightPx] = values as [number, number, number];
    const rad = (angleDeg * Math.PI) / 180;
    const centerY = ORBIT_CIRCLE.cy + radiusPx * Math.sin(rad);
    const y = centerY - heightPx / 2;
    return `${(y / CATEGORY_FRAME.h) * 100}%`;
  });

  const visual = orbitProductVisual(poseIndex);

  return (
    <motion.div
      className="absolute overflow-visible will-change-transform [backface-visibility:hidden]"
      style={{
        left,
        top,
        width: pose.box.width,
        height: pose.box.height,
        scale,
        transformOrigin: 'center center',
        zIndex: pose.zIndex,
      }}
    >
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 overflow-visible"
        style={{
          width: orbitProductSpanWidthPct(pose),
          transform: `translate(calc(-50% + ${visual.offsetXPct}%), calc(-50% + ${visual.offsetYPct}%)) scale(${visual.scale})`,
          transition: reduceMotion ? 'none' : ORBIT_ROTATE_TRANSITION,
        }}
      >
        <div
          className="origin-center"
          style={{
            transform: `rotate(${visual.rotateDeg}deg)`,
            transition: reduceMotion ? 'none' : ORBIT_ROTATE_TRANSITION,
          }}
        >
          <Image
            src={src}
            alt=""
            width={800}
            height={800}
            sizes="(max-width: 1024px) 70vw, 760px"
            className="h-auto w-full object-contain"
          />
        </div>
      </div>
    </motion.div>
  );
}

function wrapIndex(value: number, size: number): number {
  if (size <= 0) {
    return 0;
  }
  return ((value % size) + size) % size;
}

/**
 * Pides travel around the ring on an arc path. Uniform scale grows/shrinks
 * during the move; each rider keeps a stable key across spins.
 */
export function HomeCategoriesOrbit({ items, spin, arcStyle }: HomeCategoriesOrbitProps) {
  const reduceMotion = useReducedMotion();
  const count = items.length;

  const riders = useMemo(() => {
    if (count === 0) {
      return [];
    }

    return Array.from({ length: SLOT_COUNT }, (_, riderIndex) => {
      const poseIndex = wrapIndex(riderIndex - spin, SLOT_COUNT);
      const item = items[riderIndex % count];
      const pose = ORBIT_SLOT_POSES[poseIndex];
      if (!item || !pose) {
        return null;
      }

      return {
        key: `orbit-rider-${riderIndex}`,
        src: item.imageUrl,
        pose,
        poseIndex,
      };
    }).filter(
      (
        rider,
      ): rider is {
        key: string;
        src: string;
        pose: OrbitSlotPose;
        poseIndex: number;
      } => rider != null,
    );
  }, [count, items, spin]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-visible isolate">
      <div className="absolute z-0" style={arcStyle}>
        <HomeCategoryArc />
      </div>

      {riders.map((rider) => (
        <OrbitPide
          key={rider.key}
          src={rider.src}
          pose={rider.pose}
          poseIndex={rider.poseIndex}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  );
}

/** Category shown in the featured (slot 0) pose for the current spin. */
export function featuredOrbitCategoryIndex(spin: number, categoryCount: number): number {
  if (categoryCount <= 0) {
    return 0;
  }
  return wrapIndex(spin, SLOT_COUNT) % categoryCount;
}
