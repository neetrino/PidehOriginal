"use client";

import type { AdminDiscountsBoard } from "@/features/promotions/application/discounts-board";
import { CategoryDiscountsSection } from "@/features/promotions/ui/CategoryDiscountsSection";
import { DiscountInfoCard } from "@/features/promotions/ui/DiscountInfoCard";
import { GlobalDiscountCard } from "@/features/promotions/ui/GlobalDiscountCard";
import { ProductDiscountsSection } from "@/features/promotions/ui/ProductDiscountsSection";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminDiscountsViewCopy = {
  discounts: Dictionary["admin"]["discounts"];
  common: Dictionary["admin"]["common"];
};

type AdminDiscountsViewProps = {
  locale: string;
  board: AdminDiscountsBoard;
  copy: AdminDiscountsViewCopy;
};

export function AdminDiscountsView({
  locale,
  board,
  copy,
}: AdminDiscountsViewProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid w-full gap-6 lg:grid-cols-2">
        <GlobalDiscountCard
          locale={locale}
          initialPercent={board.globalPercent}
          copy={{ global: copy.discounts.global, common: copy.common }}
        />
        <DiscountInfoCard locale={locale} copy={copy.discounts.info} />
      </div>

      <CategoryDiscountsSection
        locale={locale}
        categories={board.categories}
        copy={{ categories: copy.discounts.categories, common: copy.common }}
      />

      <ProductDiscountsSection
        locale={locale}
        products={board.products}
        copy={{ products: copy.discounts.products, common: copy.common }}
      />
    </div>
  );
}
