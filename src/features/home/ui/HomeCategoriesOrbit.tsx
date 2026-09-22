'use client';

import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useReducedMotion } from 'motion/react';

import { HomeCategoryArc } from '@/features/home/ui/HomeCategoryArc';
import { OrbitPide } from '@/features/home/ui/OrbitPide';
import { ORBIT_SLOT_POSES, SLOT_COUNT } from '@/features/home/ui/category-orbit-slots';
import { ORBIT_MOVE_MS } from '@/features/home/ui/orbit-motion';

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

export { ORBIT_MOVE_MS };

function wrapIndex(value: number, size: number): number {
  if (size <= 0) {
    return 0;
  }
  return ((value % size) + size) % size;
}

/**
 * Mounted riders ease from slot to slot along the white ring.
 * `spin` only changes which slot each rider occupies.
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
        pose: (typeof ORBIT_SLOT_POSES)[number];
        poseIndex: number;
      } => rider != null,
    );
  }, [count, items, spin]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 isolate overflow-visible">
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
