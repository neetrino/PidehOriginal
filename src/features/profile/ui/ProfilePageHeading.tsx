"use client";

import { annotate } from "rough-notation";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

type ProfilePageHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function ProfilePageHeading({
  eyebrow,
  title,
  description,
}: ProfilePageHeadingProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const titleEl = titleRef.current;
    if (!titleEl) {
      return;
    }
    const mark = annotate(titleEl, {
      type: "highlight",
      color: "#ffd54a",
      animate: !reduceMotion,
      animationDuration: 800,
    });
    mark.show();
    return () => mark.remove();
  }, [reduceMotion, title]);

  return (
    <div>
      <p className="text-[11px] font-bold tracking-[0.22em] text-[#ff6b00] uppercase">
        {eyebrow}
      </p>
      <h1
        ref={titleRef}
        className="font-display mt-2 inline-block text-3xl leading-[0.9] text-[#1e1e1e] uppercase sm:text-4xl"
      >
        {title}
      </h1>
      {description ? (
        <p className="mt-3 text-sm text-[#1e1e1e]/65">{description}</p>
      ) : null}
    </div>
  );
}
