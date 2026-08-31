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

type ShopCategoryChipsProps = {
  locale: string;
  filters: CatalogFilters;
  categories: readonly ShopCategoryOption[];
  allLabel: string;
};

export function ShopCategoryChips({
  locale,
  filters,
  categories,
  allLabel,
}: ShopCategoryChipsProps) {
  const allActive = !filters.category;

  return (
    <div
      role="tablist"
      aria-label={allLabel}
      className="min-w-0 flex-1 overflow-x-auto pb-1"
    >
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
            invertIcon={false}
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
                invertIcon={active}
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
  invertIcon: boolean;
};

function CategoryChip({
  href,
  label,
  icon,
  active,
  invertIcon,
}: CategoryChipProps) {
  return (
    <AppLink
      href={href}
      prefetchPolicy="intent"
      scroll={false}
      role="tab"
      aria-selected={active}
      className={
        active
          ? "inline-flex h-14 shrink-0 items-center gap-2 rounded-[40px] bg-[#ff6b00] pr-5 pl-4 text-base font-semibold whitespace-nowrap text-[#ffd255] transition duration-200 hover:brightness-105"
          : "inline-flex h-14 shrink-0 items-center gap-2 rounded-[40px] bg-white pr-5 pl-4 text-base font-semibold whitespace-nowrap text-[#ff6b00] shadow-none transition duration-200 hover:scale-[1.04] hover:bg-white hover:shadow-[0px_8px_14px_rgba(31,20,8,0.08)]"
      }
    >
      <Image
        src={icon.src}
        alt=""
        width={icon.width}
        height={icon.height}
        className={`shrink-0 object-contain ${invertIcon ? "brightness-0 invert" : ""}`}
        style={{ width: icon.width, height: icon.height }}
      />
      {label}
    </AppLink>
  );
}
