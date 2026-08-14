"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

import { VIEWPORT_ONCE, fadeUp } from "@/components/motion/presets";

type RevealOnViewProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variants?: Variants;
  delay?: number;
};

/**
 * Plays an entrance animation once when the node enters the viewport.
 */
export function RevealOnView({
  children,
  className,
  style,
  variants = fadeUp,
  delay = 0,
}: RevealOnViewProps) {
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
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
