"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { AppLink } from "@/components/ui/AppLink";
import {
  MOBILE_ORBIT_MOVE_MS,
  MOBILE_SLOT_COUNT,
  MobileCategoryOrbit,
  mobileActiveCategoryTitle,
  type OrbitCategoryItem,
} from "@/features/home/ui/mobile/MobileCategoryOrbit";
import { MOBILE_HOME_ASSETS } from "@/features/home/ui/mobile/mobile-assets";
import { catalogHref } from "@/features/products/application/catalog-search-params";
import type { Locale } from "@/lib/i18n/config";

type CategoryItem = {
  id: string;
  title: string;
  href: string;
  imageUrl: string | null;
};

type MobileHomeHeroProps = {
  locale: Locale;
  searchLabel: string;
  pideLabel: string;
  /** Fallback titles for the 5 Figma arc slots (drink → sauce). */
  arcTitles: readonly string[];
  categories: readonly CategoryItem[];
  prevLabel: string;
  nextLabel: string;
  titleLine1: string;
  titleLine2: string;
  viewAllHref: string;
  viewAllLabel: string;
};

/**
 * Merge API categories onto the 5 arc slots; fill gaps with arcTitles.
 */
function buildOrbitCategories(
  categories: readonly CategoryItem[],
  arcTitles: readonly string[],
  pideLabel: string,
  productsHref: string,
): OrbitCategoryItem[] {
  return Array.from({ length: MOBILE_SLOT_COUNT }, (_, index) => {
    const fromApi = categories[index];
    const fallbackTitle = arcTitles[index] ?? pideLabel;
    return {
      id: fromApi?.id ?? `arc-slot-${index}`,
      title: fromApi?.title?.trim() || fallbackTitle,
      href: fromApi?.href ?? productsHref,
    };
  });
}

/**
 * Search + circular category orbit + arrows + featured title/CTA (Figma 259:369).
 * Must sit inside MobileFrame440 (440px design space).
 */
export function MobileHomeHero({
  locale,
  searchLabel,
  pideLabel,
  arcTitles,
  categories,
  prevLabel,
  nextLabel,
  titleLine1,
  titleLine2,
  viewAllHref,
  viewAllLabel,
}: MobileHomeHeroProps) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const productsHref = `/${locale}/products`;
  const [searchQuery, setSearchQuery] = useState("");
  const [spin, setSpin] = useState(0);
  const [orbitBusy, setOrbitBusy] = useState(false);
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const orbitCategories = useMemo(
    () => buildOrbitCategories(categories, arcTitles, pideLabel, productsHref),
    [arcTitles, categories, pideLabel, productsHref],
  );

  useEffect(() => {
    return () => {
      if (unlockTimerRef.current) {
        clearTimeout(unlockTimerRef.current);
      }
    };
  }, []);

  const activeLabel = mobileActiveCategoryTitle(spin, orbitCategories);

  function step(delta: number): void {
    if (orbitBusy) {
      return;
    }
    setOrbitBusy(true);
    setSpin((current) => current + delta);
    if (unlockTimerRef.current) {
      clearTimeout(unlockTimerRef.current);
    }
    unlockTimerRef.current = setTimeout(() => {
      setOrbitBusy(false);
      unlockTimerRef.current = null;
    }, MOBILE_ORBIT_MOVE_MS);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    router.push(
      catalogHref(locale, {
        q: trimmed || undefined,
        sort: "newest",
        page: 1,
        pageSize: 24,
      }),
    );
  }

  return (
    <>
      {/* Search — 260:440 (inline input; Enter submits to catalog) */}
      <form
        role="search"
        onSubmit={handleSearchSubmit}
        className="absolute top-[150px] left-1/2 z-30 h-14 w-[286px] -translate-x-1/2 overflow-hidden rounded-[40px] bg-white"
        onClick={() => searchInputRef.current?.focus()}
      >
        <label htmlFor="mobile-home-search" className="sr-only">
          {searchLabel}
        </label>
        <span className="pointer-events-none absolute top-[9px] left-[9px] size-[39px]">
          <Image
            src={MOBILE_HOME_ASSETS.search}
            alt=""
            width={39}
            height={39}
            className="size-full"
          />
        </span>
        <input
          ref={searchInputRef}
          id="mobile-home-search"
          type="search"
          name="q"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={searchLabel}
          autoComplete="off"
          enterKeyHint="search"
          className="font-montserrat-arm size-full bg-transparent pr-5 pl-[54px] text-base leading-[21px] font-medium text-pideh-ink outline-none placeholder:text-[rgba(179,96,37,0.5)] [&::-webkit-search-cancel-button]:appearance-none"
        />
      </form>

      {/* Yellow highlight + active label (label stays inside the disc) */}
      <div
        data-node-id="260:466"
        className="pointer-events-none absolute top-[271px] left-[calc(50%-45px)] z-20 size-[90px] overflow-hidden rounded-full bg-[#ffd54a]"
      >
        <p className="absolute inset-x-1 bottom-2 z-40 truncate text-center text-[15px] leading-4 font-medium text-[#ff6b00]">
          {activeLabel}
        </p>
      </div>

      <MobileCategoryOrbit
        spin={spin}
        productsHref={productsHref}
        categories={orbitCategories}
      />

      {/* Arrows — 260:379 */}
      <div className="absolute top-[384px] left-1/2 z-40 flex h-[47px] w-[108px] -translate-x-1/2 items-center gap-1.5">
        <button
          type="button"
          aria-label={prevLabel}
          disabled={orbitBusy}
          className="relative size-[51px] touch-manipulation transition active:scale-95 disabled:pointer-events-none disabled:opacity-70"
          onClick={() => step(-1)}
        >
          <Image
            src={MOBILE_HOME_ASSETS.arrowLeft}
            alt=""
            width={51}
            height={51}
            className="size-full rotate-180 -scale-y-100"
          />
        </button>
        <button
          type="button"
          aria-label={nextLabel}
          disabled={orbitBusy}
          className="relative size-[51px] touch-manipulation transition active:scale-95 disabled:pointer-events-none disabled:opacity-70"
          onClick={() => step(1)}
        >
          <Image
            src={MOBILE_HOME_ASSETS.arrowRight}
            alt=""
            width={51}
            height={51}
            className="size-full"
          />
        </button>
      </div>

      {/* Featured title — 260:492 */}
      <h2 className="font-display absolute top-[432px] left-[calc(50%-203px)] z-20 h-[130px] w-[290px] text-[50px] leading-[0.84] text-white">
        <span className="mb-0 block">{titleLine1}</span>
        <span className="block">{titleLine2}</span>
      </h2>

      {/* View-all — 260:548 */}
      <AppLink
        href={viewAllHref}
        prefetchPolicy="intent"
        aria-label={viewAllLabel}
        className="absolute top-[505px] left-[358px] z-20 flex items-center gap-1 overflow-hidden rounded-[42px] bg-[#ffd54a] px-6 py-4"
      >
        <Image
          src={MOBILE_HOME_ASSETS.viewAllArrow}
          alt=""
          width={20}
          height={20}
          className="size-5"
        />
      </AppLink>
    </>
  );
}
