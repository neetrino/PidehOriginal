import type { CSSProperties } from "react";

import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";

type HomeCategoryArcProps = {
  className?: string;
  style?: CSSProperties;
};

/**
 * Figma Ellipse 3469 (1:376) — white ring behind the categories carousel.
 * Exact size in design: 691.104 × 691.104.
 */
export function HomeCategoryArc({
  className = "",
  style,
}: HomeCategoryArcProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute ${className}`}
      style={style}
    >
      {/* Decorative SVG ring — next/image not used for this asset */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PIDEH_ASSETS.categoryArc}
        alt=""
        width={691}
        height={691}
        className="block size-full max-w-none"
      />
    </div>
  );
}
