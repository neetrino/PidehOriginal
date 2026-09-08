import Image from "next/image";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { orbitPop } from "@/components/motion/presets";
import { AppLink } from "@/components/ui/AppLink";
import { catalogHref } from "@/features/products/application/catalog-search-params";
import type { CatalogFilters } from "@/features/products/schemas/catalog-list";
import { shopCategoryIcon } from "@/features/products/ui/shop-category-icon";

type ShopCategoryOption = {
  slug: string;
  title: string;
};

/**
 * `onCream` — desktop shop page (cream background, orange active chip).
 * `onOrange` — mobile menu (orange page background, yellow active chip).
 */
export type ShopCategoryChipsTone = "onCream" | "onOrange";

const BASE_CHIP =
  "inline-flex h-14 shrink-0 items-center gap-2 rounded-[40px] pr-5 pl-4 text-base font-semibold whitespace-nowrap transition duration-200";

const INACTIVE_CHIP =
  "bg-white text-[#ff6b00] shadow-none hover:scale-[1.04] hover:bg-white hover:shadow-[0px_8px_14px_rgba(31,20,8,0.08)]";

const ACTIVE_CHIP: Record<ShopCategoryChipsTone, string> = {
  onCream: "bg-[#ff6b00] text-[#ffd255] hover:brightness-105",
  onOrange: "bg-[#ffcf48] text-[#ff6900] hover:brightness-105",
};

/**
 * Active chips flatten their glyph to the chip's own label colour — the source
 * SVGs are filled `#FFCF48`, which disappears on the yellow mobile chip.
 */
const ACTIVE_ICON_COLOR: Record<ShopCategoryChipsTone, string> = {
  onCream: "#ffffff",
  onOrange: "#ff6900",
};

type ShopCategoryChipsProps = {
  locale: string;
  filters: CatalogFilters;
  categories: readonly ShopCategoryOption[];
  allLabel: string;
  tone?: ShopCategoryChipsTone;
  className?: string;
};

export function ShopCategoryChips({
  locale,
  filters,
  categories,
  allLabel,
  tone = "onCream",
  className = "min-w-0 flex-1 overflow-x-auto pb-1",
}: ShopCategoryChipsProps) {
  const allActive = !filters.category;

  return (
    <div role="tablist" aria-label={allLabel} className={className}>
      <StaggerGroup
        className="flex items-center gap-2.5"
        stagger={0.06}
        delayChildren={0.08}
      >
        <StaggerItem variants={orbitPop}>
          <CategoryChip
            href={catalogHref(locale, filters, { category: undefined, page: 1 })}
            label={allLabel}
            icon={shopCategoryIcon("all")}
            active={allActive}
            tone={tone}
          />
        </StaggerItem>
        {categories.map((category) => {
          const active = filters.category === category.slug;
          return (
            <StaggerItem key={category.slug} variants={orbitPop}>
              <CategoryChip
                href={catalogHref(locale, filters, {
                  category: category.slug,
                  page: 1,
                })}
                label={category.title}
                icon={shopCategoryIcon(category.slug)}
                active={active}
                tone={tone}
              />
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </div>
  );
}

type CategoryChipProps = {
  href: string;
  label: string;
  icon: ReturnType<typeof shopCategoryIcon>;
  active: boolean;
  tone: ShopCategoryChipsTone;
};

function CategoryChip({ href, label, icon, active, tone }: CategoryChipProps) {
  return (
    <AppLink
      href={href}
      prefetchPolicy="intent"
      scroll={false}
      role="tab"
      aria-selected={active}
      className={`${BASE_CHIP} ${active ? ACTIVE_CHIP[tone] : INACTIVE_CHIP}`}
    >
      {active ? (
        <span
          aria-hidden
          className="shrink-0"
          style={{
            width: icon.width,
            height: icon.height,
            backgroundColor: ACTIVE_ICON_COLOR[tone],
            maskImage: `url(${icon.src})`,
            maskRepeat: "no-repeat",
            maskPosition: "center",
            maskSize: "contain",
            WebkitMaskImage: `url(${icon.src})`,
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            WebkitMaskSize: "contain",
          }}
        />
      ) : (
        <Image
          src={icon.src}
          alt=""
          width={icon.width}
          height={icon.height}
          className="shrink-0 object-contain"
          style={{ width: icon.width, height: icon.height }}
        />
      )}
      {label}
    </AppLink>
  );
}
