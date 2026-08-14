"use client";

import type { CSSProperties } from "react";

type HomeCategoryArcProps = {
  className?: string;
  style?: CSSProperties;
};

const ARC_PATH =
  "M634.564 534.968C589.36 603.94 520.98 654.473 441.777 677.436C362.573 700.4 277.768 694.282 202.682 660.186C127.595 626.09 67.1775 566.265 32.3429 491.519C-2.4916 416.772 -9.44619 332.032 12.7355 252.605C34.9171 173.179 84.7724 104.305 153.295 58.4229C221.818 12.5412 304.491 -7.32215 386.378 2.42099C468.266 12.1641 543.97 50.8713 599.814 111.55C655.658 172.23 687.961 250.88 690.886 333.293L594.35 336.72C592.242 277.345 568.969 220.681 528.736 176.965C488.503 133.248 433.962 105.361 374.966 98.3419C315.969 91.3224 256.408 105.633 207.04 138.689C157.672 171.744 121.754 221.366 105.773 278.588C89.792 335.811 94.8025 396.863 119.899 450.714C144.996 504.566 188.524 547.667 242.62 572.231C296.717 596.796 357.815 601.204 414.877 584.66C471.94 568.115 521.204 531.709 553.772 482.018L634.564 534.968Z";

/**
 * Figma Ellipse 3469 (1:376) — flat white ring.
 */
export function HomeCategoryArc({
  className = "",
  style,
}: HomeCategoryArcProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none size-full ${className}`}
      style={style}
    >
      <svg
        className="block size-full max-w-none overflow-visible"
        viewBox="0 0 691.104 691.104"
        fill="none"
      >
        <path d={ARC_PATH} fill="#ffffff" />
      </svg>
    </div>
  );
}
