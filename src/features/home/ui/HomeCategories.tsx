"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { PidehPillButton } from "@/components/brand/PidehPillButton";
import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";
import { HomeCategoryArc } from "@/features/home/ui/HomeCategoryArc";
import { HomeYellowWave } from "@/features/home/ui/HomeYellowWave";

type CategoryItem = {
  id: string;
  title: string;
  href: string;
  imageUrl: string | null;
  productCount?: number;
};

type HomeCategoriesProps = {
  title: string;
  viewAllLabel: string;
  viewAllHref: string;
  typesLabel: string;
  demoCategoryTitle: string;
  categories: readonly CategoryItem[];
};

/** Figma Categories frame (1:373) — 1448 × 850. */
const FRAME = { w: 1448, h: 850 } as const;
const DEMO_PRODUCT_COUNT = 4;

function figmaBox(x: number, y: number, width: number, height: number) {
  return {
    left: `${(x / FRAME.w) * 100}%`,
    top: `${(y / FRAME.h) * 100}%`,
    width: `${(width / FRAME.w) * 100}%`,
    height: `${(height / FRAME.h) * 100}%`,
  };
}

const PIDE_CROP = {
  height: "116.23%",
  width: "196.94%",
  left: "-46.39%",
  top: "-5.81%",
} as const;

type OrbitSlot = {
  box: ReturnType<typeof figmaBox>;
  innerClassName: string;
  innerStyle: { width: string; height: string };
};

/**
 * Orbit AABBs from Figma Group 70675 (1:374). Inner sizes are the
 * pre-transform leaf boxes as % of each AABB — not inflated fill %.
 */
const ORBIT_SLOTS: readonly OrbitSlot[] = [
  {
    // 1:377 — AABB 516.702×243.154, leaf 243.154×516.702, -scale-y-100 rotate-90
    box: figmaBox(780, 334.45, 516.702, 243.154),
    innerClassName: "-scale-y-100 rotate-90",
    innerStyle: { width: "47.06%", height: "212.5%" },
  },
  {
    // 1:378 — AABB 272.565×242.72, leaf 118.095×250.952, -scale-y-100 rotate-125.86
    box: figmaBox(1096.52, 91.58, 272.565, 242.72),
    innerClassName: "-scale-y-100 rotate-[125.86deg]",
    innerStyle: { width: "43.33%", height: "103.39%" },
  },
  {
    // 1:379 — visual AABB top is 53 (not unrotated 304)
    box: figmaBox(1414.79, 53, 118.186, 251.145),
    innerClassName: "-scale-y-100",
    innerStyle: { width: "100%", height: "100%" },
  },
  {
    // 1:380
    box: figmaBox(1414.79, 598.42, 118.392, 251.583),
    innerClassName: "",
    innerStyle: { width: "100%", height: "100%" },
  },
  {
    // 1:381 — AABB 263.173×258.582, leaf 118.095×250.952, rotate-[-133.6deg]
    box: figmaBox(1097.4, 586.96, 263.173, 258.582),
    innerClassName: "rotate-[-133.6deg]",
    innerStyle: { width: "44.87%", height: "97.05%" },
  },
];

export function HomeCategories({
  title,
  viewAllLabel,
  viewAllHref,
  typesLabel,
  demoCategoryTitle,
  categories,
}: HomeCategoriesProps) {
  const [index, setIndex] = useState(0);

  const displayCategories = useMemo((): readonly CategoryItem[] => {
    if (categories.length > 0) {
      return categories;
    }

    return [
      {
        id: "demo-cheese",
        title: demoCategoryTitle,
        href: viewAllHref,
        imageUrl: PIDEH_ASSETS.foodPide,
        productCount: DEMO_PRODUCT_COUNT,
      },
      {
        id: "demo-orbit-2",
        title: demoCategoryTitle,
        href: viewAllHref,
        imageUrl: PIDEH_ASSETS.categoryPide,
        productCount: DEMO_PRODUCT_COUNT,
      },
      {
        id: "demo-orbit-3",
        title: demoCategoryTitle,
        href: viewAllHref,
        imageUrl: PIDEH_ASSETS.foodPide,
        productCount: DEMO_PRODUCT_COUNT,
      },
      {
        id: "demo-orbit-4",
        title: demoCategoryTitle,
        href: viewAllHref,
        imageUrl: PIDEH_ASSETS.categoryPide,
        productCount: DEMO_PRODUCT_COUNT,
      },
      {
        id: "demo-orbit-5",
        title: demoCategoryTitle,
        href: viewAllHref,
        imageUrl: PIDEH_ASSETS.foodPide,
        productCount: DEMO_PRODUCT_COUNT,
      },
    ];
  }, [categories, demoCategoryTitle, viewAllHref]);

  const active = displayCategories[index] ?? displayCategories[0] ?? null;
  const canCycle = displayCategories.length > 1;

  const orbitImages = useMemo(() => {
    return ORBIT_SLOTS.map((_, slotIndex) => {
      const category =
        displayCategories[(index + slotIndex) % displayCategories.length];
      return category?.imageUrl ?? PIDEH_ASSETS.foodPide;
    });
  }, [displayCategories, index]);

  function go(delta: number): void {
    if (!canCycle) {
      return;
    }
    setIndex(
      (current) =>
        (current + delta + displayCategories.length) % displayCategories.length,
    );
  }

  return (
    <section className="relative z-0 overflow-x-clip overflow-y-hidden bg-[#ff6b00] pt-24 md:pt-36">
      <div className="absolute inset-x-0 top-0 z-0 w-full min-w-full">
        <HomeYellowWave />
      </div>

      <div
        className="relative z-10 mx-auto w-full max-w-[1448px]"
        style={{ aspectRatio: "1448 / 850" }}
      >
        <h2
          className="font-display absolute z-10 text-[#ff6b00]"
          style={{
            ...figmaBox(10, 92, 708, 218),
            fontSize: "clamp(2.75rem, 9.67vw, 8.75rem)",
            lineHeight: 0.78,
            letterSpacing: 0,
          }}
        >
          {title}
        </h2>

        <div className="absolute z-20" style={figmaBox(10, 452, 213, 56)}>
          <PidehPillButton
            href={viewAllHref}
            label={viewAllLabel}
            tone="orange"
            className="h-full w-full px-6 py-4"
          />
        </div>

        {active ? (
          <>
            <p
              className="font-display absolute z-20 whitespace-nowrap text-[#1e1e1e]"
              style={{
                ...figmaBox(324, 438, 200, 68),
                fontSize: "clamp(1.75rem, 3.73vw, 3.375rem)",
                lineHeight: 1.25,
              }}
            >
              {active.title}
            </p>
            {active.productCount != null ? (
              <p
                className="absolute z-20 whitespace-nowrap text-[clamp(0.875rem,1.24vw,1.125rem)] leading-[1.25] font-medium text-[#1e1e1e]/60"
                style={figmaBox(524, 466, 120, 23)}
              >
                {typesLabel.replace("{count}", String(active.productCount))}
              </p>
            ) : null}
          </>
        ) : null}

        <HomeCategoryArc
          className="z-0"
          style={figmaBox(1034.27, 108.24, 691.104, 691.104)}
        />

        {orbitImages.map((src, slotIndex) => {
          const slot = ORBIT_SLOTS[slotIndex];
          if (!slot) {
            return null;
          }

          return (
            <div
              key={`${src}-${slotIndex}`}
              className="absolute z-10 flex items-center justify-center"
              style={slot.box}
            >
              <div
                className={`relative flex-none overflow-hidden ${slot.innerClassName}`}
                style={slot.innerStyle}
              >
                <Image
                  src={src}
                  alt=""
                  width={800}
                  height={800}
                  sizes="(max-width: 768px) 55vw, 520px"
                  className="absolute max-w-none"
                  style={PIDE_CROP}
                />
              </div>
            </div>
          );
        })}

        {canCycle ? (
          <div
            className="absolute z-30 flex items-center gap-[6px]"
            style={figmaBox(1352.57, 440, 108, 51)}
          >
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous category"
              className="flex size-[51px] shrink-0 items-center justify-center overflow-hidden rounded-full"
            >
              <span className="-scale-y-100 relative block size-[51px] rotate-180">
                <Image
                  src={PIDEH_ASSETS.arrowLeft}
                  alt=""
                  width={51}
                  height={51}
                  className="size-full"
                />
              </span>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next category"
              className="size-[51px] shrink-0 overflow-hidden rounded-full"
            >
              <Image
                src={PIDEH_ASSETS.arrowRight}
                alt=""
                width={51}
                height={51}
                className="size-full"
              />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
