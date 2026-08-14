"use client";

import { motion, useReducedMotion } from "motion/react";

type HomeHeroTitleProps = {
  line1: string;
  line2: string;
  className?: string;
};

const TITLE_STYLE = {
  fontSize: "clamp(3.5rem, 14.9vw, 215px)",
  lineHeight: 0.73,
  letterSpacing: 0,
} as const;

function HeroTitleLine({
  text,
  className,
  delay,
}: {
  text: string;
  className: string;
  delay: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <span className={`${className} block w-full overflow-hidden`} style={TITLE_STYLE}>
      <motion.span
        key={text}
        className="block"
        initial={reduceMotion ? false : { y: "110%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {text}
      </motion.span>
    </span>
  );
}

/**
 * Figma Component 1 (51:179) — Pricehigh Black, 215px / leading 0.73.
 * Uses `display: contents` so line z-indexes interleave with the pide media sibling.
 */
export function HomeHeroTitle({
  line1,
  line2,
  className = "",
}: HomeHeroTitleProps) {
  return (
    <h1 className={`font-display contents text-center whitespace-nowrap ${className}`}>
      <HeroTitleLine
        text={line1}
        className="pideh-hero-title-line1 relative z-[1] text-white"
        delay={0.05}
      />
      <HeroTitleLine
        text={line2}
        className="pideh-hero-title-line2 relative z-[30] -mt-[0.12em] text-[#ffd64d]"
        delay={0.14}
      />
    </h1>
  );
}
