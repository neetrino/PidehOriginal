import type { Transition, Variants } from "motion/react";

export const VIEWPORT_ONCE = { once: true, amount: 0.25 } as const;

export const springSoft: Transition = {
  type: "spring",
  stiffness: 90,
  damping: 20,
  mass: 0.9,
};

export const easeOutSoft: Transition = {
  duration: 0.9,
  ease: [0.16, 1, 0.3, 1],
};

export const easeSlow: Transition = {
  duration: 1.15,
  ease: [0.16, 1, 0.3, 1],
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: easeOutSoft },
};

export const clipUp: Variants = {
  hidden: { opacity: 0, y: 48 },
  show: { opacity: 1, y: 0, transition: easeSlow },
};

export const titleSweep: Variants = {
  hidden: { opacity: 0, x: -56 },
  show: { opacity: 1, x: 0, transition: easeSlow },
};

export const pillPop: Variants = {
  hidden: { opacity: 0, scale: 0.82, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: springSoft },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: springSoft },
};

export const cardShelf: Variants = {
  hidden: { opacity: 0, y: 56, rotate: 5, scale: 0.92 },
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: springSoft,
  },
};

export const orbitPop: Variants = {
  hidden: { opacity: 0, scale: 0.82 },
  show: { opacity: 1, scale: 1, transition: springSoft },
};

export const reviewCard: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.35, ease: [0.16, 1, 0.3, 1] },
  },
};

export const ctaLift: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] },
  },
};

export const footerColumn: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 1.3, ease: [0.16, 1, 0.3, 1] } },
};

export const specklePop: Variants = {
  hidden: { opacity: 0, scale: 0 },
  show: { opacity: 1, scale: 1, transition: springSoft },
};

export const reviewCardReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

export const FEATURE_ENTRANCES: readonly Variants[] = [
  {
    hidden: { opacity: 0, x: -64, rotate: -6 },
    show: { opacity: 1, x: 0, rotate: 0, transition: { ...springSoft, delay: 0.05 } },
  },
  {
    hidden: { opacity: 0, y: -48, rotate: -10 },
    show: { opacity: 1, y: 0, rotate: 0, transition: springSoft },
  },
  {
    hidden: { opacity: 0, y: 56, scale: 0.88 },
    show: { opacity: 1, y: 0, scale: 1, transition: springSoft },
  },
  {
    hidden: { opacity: 0, x: 64, rotate: 10 },
    show: { opacity: 1, x: 0, rotate: 0, transition: springSoft },
  },
];
