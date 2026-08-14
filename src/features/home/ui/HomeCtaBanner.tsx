"use client";

import { motion, useReducedMotion } from "motion/react";

import { VIEWPORT_ONCE, ctaLift } from "@/components/motion/presets";
import { HomeCtaCard } from "@/features/home/ui/HomeCtaCard";

type HomeCtaBannerProps = {
  titleLine1: string;
  titleLine2: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

type HomeCtaOrangeBandProps = {
  className?: string;
};

/**
 * Full-bleed orange page band. Sibling behind HomeCtaCard — not its parent.
 */
export function HomeCtaOrangeBand({ className = "" }: HomeCtaOrangeBandProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 bottom-0 bg-[#ff6b00] ${className}`}
      initial={reduceMotion ? false : { clipPath: "inset(0 0 100% 0)" }}
      whileInView={reduceMotion ? undefined : { clipPath: "inset(0 0 0% 0)" }}
      viewport={VIEWPORT_ONCE}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

/**
 * CTA card sits on the reviews-yellow / orange seam and is independent of the orange band.
 */
export function HomeCtaBanner({
  titleLine1,
  titleLine2,
  description,
  ctaLabel,
  ctaHref,
}: HomeCtaBannerProps) {
  const reduceMotion = useReducedMotion();
  const card = (
    <HomeCtaCard
      titleLine1={titleLine1}
      titleLine2={titleLine2}
      description={description}
      ctaLabel={ctaLabel}
      ctaHref={ctaHref}
    />
  );

  return (
    <div className="relative z-30 -mt-8 md:-mt-12">
      <HomeCtaOrangeBand className="top-8 md:top-12" />
      {reduceMotion ? (
        <div className="relative z-10 px-4 pb-12 md:px-10 md:pb-16 lg:px-[100px]">
          {card}
        </div>
      ) : (
        <motion.div
          className="relative z-10 px-4 pb-12 md:px-10 md:pb-16 lg:px-[100px]"
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          variants={ctaLift}
        >
          {card}
        </motion.div>
      )}
    </div>
  );
}
