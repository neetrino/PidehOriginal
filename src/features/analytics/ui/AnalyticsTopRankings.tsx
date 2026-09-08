import { Package } from "lucide-react";

import type {
  AnalyticsTopCategory,
  AnalyticsTopProduct,
} from "@/features/analytics/application/queries";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AnalyticsTopRankingsProps = {
  products: AnalyticsTopProduct[];
  categories: AnalyticsTopCategory[];
  formatMoney: (amount: number) => string;
  copy: Dictionary["admin"];
};

function RankBadge({
  rank,
  tone,
}: {
  rank: number;
  tone: "ink" | "orange";
}) {
  return (
    <div
      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
        tone === "ink"
          ? "bg-[#1e1e1e]/10 text-[#1e1e1e]"
          : "bg-[#ff6b00]/15 text-[#ff6b00]"
      }`}
    >
      {rank}
    </div>
  );
}

export function AnalyticsTopRankings({
  products,
  categories,
  formatMoney,
  copy,
}: AnalyticsTopRankingsProps) {
  return (
    <div className="mb-2 grid gap-4 lg:grid-cols-2">
      <section className="rounded-[18px] border border-[#1e1e1e]/8 bg-white p-5 shadow-[0_8px_20px_rgba(30,30,30,0.04)] sm:p-6">
        <h2 className="font-display text-xl text-[#1e1e1e] uppercase sm:text-2xl">
          {copy.analytics.topProducts.title}
        </h2>
        <div className="mt-4 space-y-2.5">
          {products.map((product, index) => (
            <div
              key={product.productId}
              className="flex items-center gap-3 rounded-2xl border border-[#1e1e1e]/6 bg-[#fff8e7]/55 px-3 py-2.5"
            >
              <RankBadge rank={index + 1} tone="ink" />
              <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote R2 URLs; admin list pattern
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <Package className="size-5 text-[#1e1e1e]/35" aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#1e1e1e]">
                  {product.title}
                </p>
                <p className="mt-0.5 text-xs text-[#1e1e1e]/50">
                  {copy.analytics.topProducts.sold.replace(
                    "{quantity}",
                    String(product.quantitySold),
                  )}
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold text-[#1e1e1e]">
                {formatMoney(product.revenueAmount)}
              </p>
            </div>
          ))}
          {products.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#1e1e1e]/50">
              {copy.analytics.topProducts.empty}
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-[18px] border border-[#1e1e1e]/8 bg-white p-5 shadow-[0_8px_20px_rgba(30,30,30,0.04)] sm:p-6">
        <h2 className="font-display text-xl text-[#1e1e1e] uppercase sm:text-2xl">
          {copy.analytics.topCategories.title}
        </h2>
        <div className="mt-4 space-y-2.5">
          {categories.map((category, index) => (
            <div
              key={category.categoryId}
              className="flex items-center gap-3 rounded-2xl border border-[#1e1e1e]/6 bg-white px-3 py-2.5"
            >
              <RankBadge rank={index + 1} tone="orange" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#1e1e1e]">
                  {category.title}
                </p>
                <p className="mt-0.5 text-xs text-[#1e1e1e]/50">
                  {copy.analytics.topCategories.items.replace(
                    "{count}",
                    String(category.itemCount),
                  )}
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold text-[#1e1e1e]">
                {formatMoney(category.revenueAmount)}
              </p>
            </div>
          ))}
          {categories.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#1e1e1e]/50">
              {copy.analytics.topCategories.empty}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
