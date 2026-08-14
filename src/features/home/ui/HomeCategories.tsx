"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { PidehPillButton } from "@/components/brand/PidehPillButton";
import { RevealOnView } from "@/components/motion/RevealOnView";
import { fadeUp, pillPop, titleSweep } from "@/components/motion/presets";
import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";
import { HomeCategoriesOrbit } from "@/features/home/ui/HomeCategoriesOrbit";
import { HomeYellowWave } from "@/features/home/ui/HomeYellowWave";
import { categoryFigmaBox } from "@/features/home/ui/category-orbit-slots";

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
const DEMO_PRODUCT_COUNT = 4;

const PIDE_CROP = {
  height: "116.23%",
  width: "196.94%",
  left: "-46.39%",
  top: "-5.81%",
} as const;

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

  const orbitItems = useMemo(
    () =>
      displayCategories.map((category) => ({
        id: category.id,
        imageUrl: category.imageUrl ?? PIDEH_ASSETS.foodPide,
      })),
    [displayCategories],
  );

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
      <div className="absolute inset-x-0 top-0 z-0 w-full">
        <HomeYellowWave />
      </div>

      <div
        className="relative z-10 mx-auto w-full max-w-[1448px]"
        style={{ aspectRatio: "1448 / 850" }}
      >
        <RevealOnView
          className="font-display absolute z-10 text-[#ff6b00]"
          style={{
            ...categoryFigmaBox(10, 92, 708, 218),
            fontSize: "clamp(2.75rem, 9.67vw, 8.75rem)",
            lineHeight: 0.78,
            letterSpacing: 0,
          }}
          variants={titleSweep}
        >
          <h2>{title}</h2>
        </RevealOnView>

        <RevealOnView
          className="absolute z-20"
          style={categoryFigmaBox(10, 452, 213, 56)}
          variants={pillPop}
          delay={0.12}
        >
          <PidehPillButton
            href={viewAllHref}
            label={viewAllLabel}
            tone="orange"
            className="h-full w-full px-6 py-4"
          />
        </RevealOnView>

        {active ? (
          <>
            <RevealOnView
              className="font-display absolute z-20 whitespace-nowrap text-[#1e1e1e]"
              style={{
                ...categoryFigmaBox(324, 438, 200, 68),
                fontSize: "clamp(1.75rem, 3.73vw, 3.375rem)",
                lineHeight: 1.25,
              }}
              variants={fadeUp}
              delay={0.16}
            >
              <p>{active.title}</p>
            </RevealOnView>
            {active.productCount != null ? (
              <RevealOnView
                className="absolute z-20 whitespace-nowrap text-[clamp(0.875rem,1.24vw,1.125rem)] leading-[1.25] font-medium text-[#1e1e1e]/60"
                style={categoryFigmaBox(524, 466, 120, 23)}
                variants={fadeUp}
                delay={0.2}
              >
                <p>
                  {typesLabel.replace("{count}", String(active.productCount))}
                </p>
              </RevealOnView>
            ) : null}
          </>
        ) : null}

        <HomeCategoriesOrbit
          items={orbitItems}
          index={index}
          crop={PIDE_CROP}
          arcStyle={categoryFigmaBox(1034.27, 108.24, 691.104, 691.104)}
        />

        {canCycle ? (
          <div
            className="absolute z-30 flex items-center gap-[6px]"
            style={categoryFigmaBox(1352.57, 440, 108, 51)}
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
