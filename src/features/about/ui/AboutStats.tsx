"use client";

import NumberFlow from "@number-flow/react";
import { useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

import { fadeUp } from "@/components/motion/presets";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AboutStatsProps = {
  copy: Dictionary["about"];
};

function StatValue({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const shown = inView || reduceMotion ? value : 0;

  return (
    <span ref={ref} className="font-display text-6xl text-pideh-ink md:text-7xl">
      <NumberFlow
        value={shown}
        suffix={suffix}
        respectMotionPreference
        transformTiming={{ duration: 900, easing: "ease-out" }}
      />
    </span>
  );
}

export function AboutStats({ copy }: AboutStatsProps) {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <StaggerGroup className="grid gap-6 sm:grid-cols-3">
        {copy.stats.map((stat) => (
          <StaggerItem key={stat.label} variants={fadeUp}>
            <div className="relative rounded-[2px] bg-white px-6 py-8 shadow-[10px_14px_0_0_rgba(255,107,0,0.9)]">
              <StatValue value={stat.value} suffix={stat.suffix} />
              <p className="mt-3 text-sm font-semibold tracking-[0.16em] text-pideh-muted uppercase">
                {stat.label}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
