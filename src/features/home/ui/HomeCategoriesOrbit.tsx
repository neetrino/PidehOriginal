"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";

import { HomeCategoryArc } from "@/features/home/ui/HomeCategoryArc";
import {
  ORBIT_SLOT_POSES,
  type OrbitSlotPose,
} from "@/features/home/ui/category-orbit-slots";

type OrbitItem = {
  id: string;
  imageUrl: string;
};

type HomeCategoriesOrbitProps = {
  items: readonly OrbitItem[];
  index: number;
  crop: CSSProperties;
  arcStyle: CSSProperties;
};

const SPIN = {
  type: "tween",
  duration: 1.55,
  ease: [0.16, 1, 0.3, 1],
} as const;

type OrbitPideProps = {
  src: string;
  pose: OrbitSlotPose;
  crop: CSSProperties;
  reduceMotion: boolean | null;
};

function OrbitPide({ src, pose, crop, reduceMotion }: OrbitPideProps) {
  const instant = Boolean(reduceMotion);

  return (
    <motion.div
      className="absolute z-10 flex items-center justify-center"
      initial={false}
      animate={pose.box}
      transition={instant ? { duration: 0 } : SPIN}
      style={{ zIndex: pose.zIndex }}
    >
      <div
        className={`relative flex-none overflow-hidden ${pose.innerClassName}`}
        style={{
          width: pose.innerWidth,
          height: pose.innerHeight,
        }}
      >
        <Image
          src={src}
          alt=""
          width={800}
          height={800}
          sizes="(max-width: 768px) 55vw, 520px"
          className="absolute max-w-none"
          style={crop}
        />
      </div>
    </motion.div>
  );
}

/**
 * Pides travel around the ring in the original 2D Figma poses.
 * The incoming featured slot grows; the outgoing one shrinks.
 */
export function HomeCategoriesOrbit({
  items,
  index,
  crop,
  arcStyle,
}: HomeCategoriesOrbitProps) {
  const reduceMotion = useReducedMotion();
  const count = items.length;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute z-0" style={arcStyle}>
        <HomeCategoryArc />
      </div>

      {count === 0
        ? null
        : ORBIT_SLOT_POSES.map((pose, slotIndex) => {
            const item = items[(index + slotIndex) % count];
            if (!item) {
              return null;
            }

            const duplicateOffset = ORBIT_SLOT_POSES.slice(0, slotIndex).some(
              (_, prior) => items[(index + prior) % count]?.id === item.id,
            );

            return (
              <OrbitPide
                key={duplicateOffset ? `${item.id}-${slotIndex}` : item.id}
                src={item.imageUrl}
                pose={pose}
                crop={crop}
                reduceMotion={reduceMotion}
              />
            );
          })}
    </div>
  );
}
