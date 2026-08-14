"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

import { VIEWPORT_ONCE } from "@/components/motion/presets";

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  stagger?: number;
  delayChildren?: number;
};

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variants: Variants;
};

/**
 * Parent for viewport-triggered staggered children.
 */
export function StaggerGroup({
  children,
  className,
  style,
  stagger = 0.07,
  delayChildren = 0.05,
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
      whileInView="show"
      viewport={VIEWPORT_ONCE}
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
export function StaggerItem({
  children,
  className,
  style,
  variants,
}: StaggerItemProps) {
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
