"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";

import type { DripWaveSpec } from "@/features/home/ui/wave-paths";

type SwimDripWaveProps = {
  spec: DripWaveSpec;
  className?: string;
};

const PATH_TOKEN = /[A-Za-z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g;
/** M + 7 crest cubics → 2 + 7×6 numeric tokens. */
const CREST_NUMBER_COUNT = 44;
const SWELL_SPREAD = 0.42;
const ROLL_AMPLITUDE = 14;

function tokenizePath(d: string): readonly string[] {
  return d.match(PATH_TOKEN) ?? [];
}

function viewBoxWidth(viewBox: string): number {
  const width = Number(viewBox.split(" ")[2]);
  return Number.isFinite(width) && width > 0 ? width : 1;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(value: number): number {
  return 1 - (1 - value) ** 3;
}

function swellY(
  targetY: number,
  nx: number,
  horizon: number,
  progress: number,
): number {
  const local = clamp01((progress - SWELL_SPREAD * nx) / (1 - SWELL_SPREAD));
  const swell = easeOutCubic(local);
  const roll =
    Math.sin(nx * Math.PI * 3 + progress * Math.PI) *
    ROLL_AMPLITUDE *
    swell *
    (1 - swell);
  return horizon + (targetY - horizon) * swell + roll;
}

/**
 * Straight full-width crest at `progress=0`, then a left-to-right ocean swell.
 */
function oceanCrestPath(
  full: string,
  horizon: number,
  width: number,
  progress: number,
): string {
  const tokens = tokenizePath(full);
  const parts: string[] = [];
  let numbersSeen = 0;
  let pendingX: number | null = null;

  for (const token of tokens) {
    if (/^[A-Za-z]$/.test(token)) {
      parts.push(token);
      continue;
    }

    const numeric = Number(token);
    const isCrestY = numbersSeen < CREST_NUMBER_COUNT && pendingX !== null;
    const isStartY = numbersSeen === 56;

    if (isCrestY || isStartY) {
      const nx = clamp01((pendingX ?? 0) / width);
      parts.push(String(swellY(numeric, nx, horizon, progress)));
      pendingX = null;
    } else {
      pendingX = numeric;
      parts.push(token);
    }
    numbersSeen += 1;
  }

  return parts.join(" ");
}

/**
 * Straight full-bleed edge until first scroll into view, then the swell plays once and stays.
 */
export function SwimDripWave({ spec, className = "" }: SwimDripWaveProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const gather = useMotionValue(0);
  const width = viewBoxWidth(spec.viewBox);

  useEffect(() => {
    if (!inView) {
      return;
    }

    const controls = animate(gather, 1, {
      duration: 12,
      ease: [0.12, 0.7, 0.2, 1],
    });

    return () => {
      controls.stop();
    };
  }, [gather, inView]);

  const d = useTransform(gather, (value) =>
    oceanCrestPath(spec.full, spec.horizon, width, clamp01(value)),
  );

  if (reduceMotion) {
    return (
      <div ref={ref} className={`size-full ${className}`}>
        <svg
          aria-hidden="true"
          className="block size-full max-w-none overflow-visible"
          viewBox={spec.viewBox}
          fill="none"
          preserveAspectRatio="none"
        >
          <path d={spec.full} fill={spec.fill} />
        </svg>
      </div>
    );
  }

  return (
    <div ref={ref} className={`size-full ${className}`}>
      <motion.svg
        aria-hidden="true"
        className="block size-full max-w-none overflow-visible"
        viewBox={spec.viewBox}
        fill="none"
        preserveAspectRatio="none"
      >
        <motion.path d={d} fill={spec.fill} />
      </motion.svg>
    </div>
  );
}
