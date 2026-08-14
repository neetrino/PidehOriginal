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

type OrbitSlot = {
  box: ReturnType<typeof figmaBox>;
  innerClassName: string;
  innerStyle: { width: string; height: string };
};

/**
 * Orbit AABBs + inner pre-transform sizes from Figma Group 70675.
 * Transforms match the Dev Mode export for nodes 1:377–1:381.
 */
const ORBIT_SLOTS: readonly OrbitSlot[] = [
  {
    // 1:377 main — 516.7×243.2, inner 243.2×516.7, -scale-y-100 rotate-90
    box: figmaBox(724, 334.45, 516.702, 243.154),
    innerClassName: "-scale-y-100 rotate-90",
    innerStyle: { width: "88%", height: "396%" },
  },
  {
    // 1:378 top — 272.6×242.7, inner 118.1×251.0, -scale-y-100 rotate-125.86
    box: figmaBox(1040.52, 91.58, 272.565, 242.72),
    innerClassName: "-scale-y-100 rotate-[125.86deg]",
    innerStyle: { width: "82%", height: "195%" },
  },
  {
    // 1:379 right-upper — 118.2×251.1, -scale-y-100
    box: figmaBox(1358.79, 304.14, 118.186, 251.145),
    innerClassName: "-scale-y-100",
    innerStyle: { width: "185%", height: "185%" },
  },
  {
    // 1:380 right-lower — 118.4×251.6
    box: figmaBox(1358.79, 598.42, 118.392, 251.583),
    innerClassName: "",
    innerStyle: { width: "185%", height: "185%" },
  },
  {
    // 1:381 bottom — 263.2×258.6, inner 118.1×251.0, rotate-[-133.6deg]
    box: figmaBox(1041.4, 586.96, 263.173, 258.582),
    innerClassName: "rotate-[-133.6deg]",
    innerStyle: { width: "84%", height: "182%" },
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
    <section className="relative -mt-[72px] overflow-x-clip bg-[#ff6b00] md:-mt-[93px]">
      <div className="absolute inset-x-0 top-0 z-0 w-full">
        <HomeYellowWave />
      </div>

      <div
        className="relative z-10 mx-auto w-full max-w-[1448px]"
        style={{ aspectRatio: "1448 / 850" }}
      >
        <h2
          className="font-display absolute z-10 text-[#ff6b00]"
          style={{
            ...figmaBox(66, 92, 708, 218),
            fontSize: "clamp(2.75rem, 9.67vw, 8.75rem)",
            lineHeight: 0.78,
            letterSpacing: 0,
          }}
        >
          {title}
        </h2>

        <div className="absolute z-20" style={figmaBox(66, 452, 213, 56)}>
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
                ...figmaBox(380, 438, 200, 68),
                fontSize: "clamp(1.75rem, 3.73vw, 3.375rem)",
                lineHeight: 1.25,
              }}
            >
              {active.title}
            </p>
            {active.productCount != null ? (
              <p
                className="absolute z-20 whitespace-nowrap text-[clamp(0.875rem,1.24vw,1.125rem)] leading-[1.25] font-medium text-[#1e1e1e]/60"
                style={figmaBox(580, 466, 120, 23)}
              >
                {typesLabel.replace("{count}", String(active.productCount))}
              </p>
            ) : null}
          </>
        ) : null}

        <HomeCategoryArc
          className="z-0"
          style={figmaBox(978.27, 108.24, 691.104, 691.104)}
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
                className={`relative flex-none ${slot.innerClassName}`}
                style={slot.innerStyle}
              >
                <div className="relative size-full">
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 55vw, 520px"
                    className="object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.22)]"
                  />
                </div>
              </div>
            </div>
          );
        })}

        {canCycle ? (
          <div
            className="absolute z-30 flex items-center gap-1.5"
            style={figmaBox(1296.57, 440, 108, 51)}
          >
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous category"
              className="size-[51px] shrink-0 overflow-hidden rounded-full"
            >
              <Image
                src={PIDEH_ASSETS.arrowRight}
                alt=""
                width={51}
                height={51}
                className="size-full rotate-180"
              />
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
