'use client';

import { motion } from 'motion/react';

const PARTICLE_COUNT = 8;
const PARTICLE_DISTANCE_PX = 17;
const BURST_DURATION_S = 0.5;

type WishlistHeartBurstProps = {
  /** Changes on every add, which replays the burst. */
  burstKey: number;
  onDone: () => void;
};

/** Sparks radiating from the heart once a product lands in the wishlist. */
export function WishlistHeartBurst({ burstKey, onDone }: WishlistHeartBurstProps) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: PARTICLE_COUNT }, (_unused, index) => {
        const angle = ((2 * Math.PI) / PARTICLE_COUNT) * index;
        const offsetX = Math.cos(angle) * PARTICLE_DISTANCE_PX;
        const offsetY = Math.sin(angle) * PARTICLE_DISTANCE_PX;

        return (
          <motion.span
            key={`${burstKey}-${index}`}
            className="absolute top-1/2 left-1/2 size-1.5 rounded-full bg-[#ff6b00]"
            initial={{ x: '-50%', y: '-50%', scale: 0.3, opacity: 1 }}
            animate={{
              x: `calc(-50% + ${offsetX}px)`,
              y: `calc(-50% + ${offsetY}px)`,
              scale: 0,
              opacity: 0,
            }}
            transition={{ duration: BURST_DURATION_S, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={index === PARTICLE_COUNT - 1 ? onDone : undefined}
          />
        );
      })}
    </span>
  );
}
