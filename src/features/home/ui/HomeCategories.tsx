"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { PidehPillButton } from "@/components/brand/PidehPillButton";
import { RevealOnView } from "@/components/motion/RevealOnView";
import { pillPop, titleSweep } from "@/components/motion/presets";
import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";
import {
  featuredOrbitCategoryIndex,
  HomeCategoriesOrbit,
  ORBIT_MOVE_MS,
} from "@/features/home/ui/HomeCategoriesOrbit";
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
  const [spin, setSpin] = useState(0);
  const [orbitBusy, setOrbitBusy] = useState(false);
  const orbitUnlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const reduceMotion = useReducedMotion();

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

  const activeIndex = featuredOrbitCategoryIndex(
    spin,
    displayCategories.length,
  );
  const active = displayCategories[activeIndex] ?? displayCategories[0] ?? null;

  const orbitItems = useMemo(
    () =>
      displayCategories.map((category) => ({
        id: category.id,
        imageUrl: category.imageUrl ?? PIDEH_ASSETS.foodPide,
      })),
    [displayCategories],
  );

  useEffect(() => {
    return () => {
      if (orbitUnlockTimerRef.current) {
        clearTimeout(orbitUnlockTimerRef.current);
      }
    };
  }, []);

  function go(delta: number): void {
    if (orbitBusy) {
      return;
    }
    setOrbitBusy(true);
    setSpin((current) => current + delta);
    if (orbitUnlockTimerRef.current) {
      clearTimeout(orbitUnlockTimerRef.current);
    }
    orbitUnlockTimerRef.current = setTimeout(() => {
      setOrbitBusy(false);
      orbitUnlockTimerRef.current = null;
    }, reduceMotion ? 0 : ORBIT_MOVE_MS);
  }

  return (
    <section className="relative z-[5] overflow-x-clip bg-pideh-orange pt-24 pb-8 md:pt-36 md:pb-16">
      {/* Orange base continues from hero; yellow drip sits on top so valleys show orange. */}
      <div className="absolute inset-x-0 top-0 z-0 w-full">
        <HomeYellowWave />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[18%] bottom-0 z-0 bg-[#ffcf48]"
      />

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
          <div
            className="absolute z-20"
            style={categoryFigmaBox(324, 438, 320, 68)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <p
                  className="font-display whitespace-nowrap text-[#1e1e1e]"
                  style={{
                    fontSize: "clamp(1.75rem, 3.73vw, 3.375rem)",
                    lineHeight: 1.25,
                  }}
                >
                  {active.title}
                </p>
                {active.productCount != null ? (
                  <p className="mt-1 text-[clamp(0.875rem,1.24vw,1.125rem)] leading-[1.25] font-medium text-[#1e1e1e]/60">
                    {typesLabel.replace(
                      "{count}",
                      String(active.productCount),
                    )}
                  </p>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : null}

        <HomeCategoriesOrbit
          items={orbitItems}
          spin={spin}
          crop={PIDE_CROP}
          arcStyle={categoryFigmaBox(1034.27, 108.24, 691.104, 691.104)}
        />

        {/* Figma Arrows (1:383 / 1:385) — always visible inside the ring. */}
        <div
          className="absolute z-40 flex items-center gap-[6px]"
          style={categoryFigmaBox(1352.57, 440, 108, 51)}
        >
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={orbitBusy}
            aria-label="Previous category"
            className="size-[51px] shrink-0 overflow-hidden rounded-full transition hover:brightness-110 active:scale-95 disabled:pointer-events-none"
          >
            {/* SVG brand asset — next/image not required */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PIDEH_ASSETS.arrowLeft}
              alt=""
              width={51}
              height={51}
              className="size-full"
              draggable={false}
            />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={orbitBusy}
            aria-label="Next category"
            className="size-[51px] shrink-0 overflow-hidden rounded-full transition hover:brightness-110 active:scale-95 disabled:pointer-events-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PIDEH_ASSETS.arrowRight}
              alt=""
              width={51}
              height={51}
              className="size-full"
              draggable={false}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
