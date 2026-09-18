'use client';

import { motion, useReducedMotion, type Variants } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';

import { VIEWPORT_ONCE } from '@/components/motion/presets';

type StaggerPlay = 'inView' | 'mount';

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  stagger?: number;
  delayChildren?: number;
  /**
   * `inView` waits until the group intersects the viewport.
   * `mount` plays on mount — required when the group remounts already on screen
   * (catalog category/sort changes with `scroll={false}`).
   */
  play?: StaggerPlay;
};

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variants: Variants;
};

/**
 * Parent for staggered children. Plays on viewport entry or immediately on mount.
 */
export function StaggerGroup({
  children,
  className,
  style,
  stagger = 0.07,
  delayChildren = 0.05,
  play = 'inView',
}: StaggerGroupProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      animate={play === 'mount' ? 'show' : undefined}
      whileInView={play === 'inView' ? 'show' : undefined}
      viewport={play === 'inView' ? VIEWPORT_ONCE : undefined}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger, delayChildren },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Child of StaggerGroup — must be a direct descendant.
 */
export function StaggerItem({ children, className, style, variants }: StaggerItemProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div className={className} style={style} variants={variants}>
      {children}
    </motion.div>
  );
}
