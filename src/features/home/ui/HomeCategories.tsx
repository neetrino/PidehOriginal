'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { PidehPillButton } from '@/components/brand/PidehPillButton';
import { PAGE_CONTAINER, pageColumnRow } from '@/components/layout/page-container';
import { RevealOnView } from '@/components/motion/RevealOnView';
import { pillPop, titleSweep } from '@/components/motion/presets';
import { PIDEH_ASSETS } from '@/features/home/ui/brand-assets';
import {
  featuredOrbitCategoryIndex,
  HomeCategoriesOrbit,
  ORBIT_MOVE_MS,
} from '@/features/home/ui/HomeCategoriesOrbit';
import { HomeYellowWave } from '@/features/home/ui/HomeYellowWave';
import { OrbitNavButton } from '@/features/home/ui/OrbitNavButton';
import { CATEGORY_FRAME, categoryFigmaBox } from '@/features/home/ui/category-orbit-slots';
import { ORBIT_MOVE_EASE } from '@/features/home/ui/orbit-motion';
import { uniqueOrbitPhotos } from '@/features/home/ui/unique-orbit-photos';

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
  /** Distinct pide cutouts for the ring. */
  orbitImageUrls?: readonly string[];
};

/** Figma Categories frame (1:373) — 1448 × 850. */
const DEMO_PRODUCT_COUNT = 4;

export function HomeCategories({
  title,
  viewAllLabel,
  viewAllHref,
  typesLabel,
  demoCategoryTitle,
  categories,
  orbitImageUrls = [],
}: HomeCategoriesProps) {
  const [spin, setSpin] = useState(0);
  const [orbitBusy, setOrbitBusy] = useState(false);
  const orbitUnlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const orbitBusyRef = useRef(false);
  const reduceMotion = useReducedMotion();
  orbitBusyRef.current = orbitBusy;

  const displayCategories = useMemo((): readonly CategoryItem[] => {
    if (categories.length > 0) {
      return categories;
    }

    return [
      {
        id: 'demo-cheese',
        title: demoCategoryTitle,
        href: viewAllHref,
        imageUrl: orbitImageUrls[0] ?? PIDEH_ASSETS.foodPide,
        productCount: DEMO_PRODUCT_COUNT,
      },
      {
        id: 'demo-orbit-2',
        title: demoCategoryTitle,
        href: viewAllHref,
        imageUrl: orbitImageUrls[1] ?? PIDEH_ASSETS.categoryPide,
        productCount: DEMO_PRODUCT_COUNT,
      },
      {
        id: 'demo-orbit-3',
        title: demoCategoryTitle,
        href: viewAllHref,
        imageUrl: orbitImageUrls[2] ?? PIDEH_ASSETS.foodPide,
        productCount: DEMO_PRODUCT_COUNT,
      },
      {
        id: 'demo-orbit-4',
        title: demoCategoryTitle,
        href: viewAllHref,
        imageUrl: orbitImageUrls[3] ?? PIDEH_ASSETS.categoryPide,
        productCount: DEMO_PRODUCT_COUNT,
      },
      {
        id: 'demo-orbit-5',
        title: demoCategoryTitle,
        href: viewAllHref,
        imageUrl: orbitImageUrls[4] ?? PIDEH_ASSETS.ctaPide,
        productCount: DEMO_PRODUCT_COUNT,
      },
    ];
  }, [categories, demoCategoryTitle, orbitImageUrls, viewAllHref]);

  const activeIndex = featuredOrbitCategoryIndex(spin, displayCategories.length);
  const active = displayCategories[activeIndex] ?? displayCategories[0] ?? null;

  const orbitItems = useMemo(() => {
    const urls = uniqueOrbitPhotos([
      ...orbitImageUrls,
      ...displayCategories.map((category) => category.imageUrl),
      PIDEH_ASSETS.foodPide,
    ]);

    return urls.map((imageUrl, index) => ({
      id: `orbit-photo-${index}`,
      imageUrl,
    }));
  }, [displayCategories, orbitImageUrls]);

  useEffect(() => {
    return () => {
      if (orbitUnlockTimerRef.current) {
        clearTimeout(orbitUnlockTimerRef.current);
      }
    };
  }, []);

  const go = useCallback((delta: number) => {
    if (orbitBusyRef.current) {
      return;
    }
    orbitBusyRef.current = true;
    setOrbitBusy(true);
    setSpin((current) => current + delta);
    if (orbitUnlockTimerRef.current) {
      clearTimeout(orbitUnlockTimerRef.current);
    }
    orbitUnlockTimerRef.current = setTimeout(
      () => {
        orbitBusyRef.current = false;
        setOrbitBusy(false);
        orbitUnlockTimerRef.current = null;
      },
      reduceMotion ? 0 : ORBIT_MOVE_MS,
    );
  }, [reduceMotion]);

  return (
    <section className="relative z-[5] -mt-24 overflow-x-clip bg-transparent pt-24 pb-8 md:-mt-32 md:pt-36 md:pb-16">
      {/* Wave sits over the hero video; drip valleys show the video underneath. */}
      <div className="absolute inset-x-0 top-0 z-[1] w-full">
        <HomeYellowWave />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[18%] bottom-0 z-0 bg-[#ffcf48]"
      />

      <div
        className="relative z-10 mx-auto w-full max-w-[1448px]"
        style={{ aspectRatio: '1448 / 850' }}
      >
        <div className="absolute inset-x-0 z-10" style={pageColumnRow(92, 218, CATEGORY_FRAME.h)}>
          <div className={PAGE_CONTAINER}>
            <RevealOnView
              className="font-display max-w-[708px] text-[#ff6b00]"
              style={{
                fontSize: 'clamp(2.75rem, 9.67vw, 8.75rem)',
                lineHeight: 0.78,
                letterSpacing: 0,
              }}
              variants={titleSweep}
            >
              <h2>{title}</h2>
            </RevealOnView>
          </div>
        </div>

        <div className="absolute inset-x-0 z-20" style={pageColumnRow(452, 56, CATEGORY_FRAME.h)}>
          <div className={PAGE_CONTAINER}>
            <RevealOnView className="h-14 w-[213px]" variants={pillPop} delay={0.12}>
              <PidehPillButton
                href={viewAllHref}
                label={viewAllLabel}
                tone="orange"
                className="h-full w-full px-6 py-4"
              />
            </RevealOnView>
          </div>
        </div>

        {active ? (
          <div className="absolute z-20" style={categoryFigmaBox(380, 438, 320, 68)}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                className="absolute inset-0 flex items-baseline gap-[clamp(0.5rem,1.1vw,1rem)] whitespace-nowrap"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{
                  duration: reduceMotion ? 0.15 : 0.4,
                  ease: ORBIT_MOVE_EASE,
                }}
              >
                <p
                  className="font-display text-[#1e1e1e]"
                  style={{
                    fontSize: 'clamp(1.75rem, 3.73vw, 3.375rem)',
                    lineHeight: 1.25,
                  }}
                >
                  {active.title}
                </p>
                {active.productCount != null ? (
                  <p className="text-[clamp(0.875rem,1.24vw,1.125rem)] leading-[1.25] font-medium text-[#1e1e1e]/60">
                    {typesLabel.replace('{count}', String(active.productCount))}
                  </p>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : null}

        <HomeCategoriesOrbit
          items={orbitItems}
          spin={spin}
          arcStyle={categoryFigmaBox(978.27, 108.24, 691.104, 691.104)}
        />

        {/* Figma Arrows (1:383 / 1:385) — always visible inside the ring. */}
        <div
          className="absolute z-40 flex items-center gap-[6px]"
          style={categoryFigmaBox(1296.57, 440, 108, 51)}
        >
          <OrbitNavButton
            disabled={orbitBusy}
            reduceMotion={reduceMotion}
            src={PIDEH_ASSETS.arrowLeft}
            label="Previous category"
            onClick={() => go(1)}
          />
          <OrbitNavButton
            disabled={orbitBusy}
            reduceMotion={reduceMotion}
            src={PIDEH_ASSETS.arrowRight}
            label="Next category"
            onClick={() => go(-1)}
          />
        </div>
      </div>
    </section>
  );
}
