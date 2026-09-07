import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { percentChange } from "@/features/analytics/domain/date-range";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { formatMoneyAmount } from "@/lib/money/format";

type HighlightTone = "pink" | "yellow" | "blue" | "cream";

type AnalyticsMetricCardsProps = {
  locale: Locale;
  revenueAmount: number;
  orderCount: number;
  averageOrderValue: number;
  customerCount: number;
  previousRevenueAmount: number;
  previousOrderCount: number;
  previousAverageOrderValue: number;
  previousCustomerCount: number;
  copy: Dictionary["admin"];
};

const TONE_CLASS: Record<HighlightTone, string> = {
  pink: "border-[#ff6b00]/15 bg-[#ffe8dc]",
  yellow: "border-[#ffd54a]/60 bg-[#fff4c2]",
  blue: "border-[#1e1e1e]/10 bg-[#eef2f6]",
  cream: "border-[#1e1e1e]/10 bg-[#fff8e7]",
};

function formatChange(change: number | null): string {
  if (change == null) {
    return "—";
  }
  if (change === 0) {
    return "0%";
  }
  return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
}

export function AnalyticsMetricCards({
  locale,
  revenueAmount,
  orderCount,
  averageOrderValue,
  customerCount,
  previousRevenueAmount,
  previousOrderCount,
  previousAverageOrderValue,
  previousCustomerCount,
  copy,
}: AnalyticsMetricCardsProps) {
  function money(amount: number): string {
    return formatMoneyAmount(amount, "AMD", locale);
  }

  const items: Array<{
    key: string;
    label: string;
    value: string;
    change: number | null;
    tone: HighlightTone;
  }> = [
    {
      key: "income",
      label: copy.analytics.metrics.income,
      value: money(revenueAmount),
      change: percentChange(revenueAmount, previousRevenueAmount),
      tone: "pink",
    },
    {
      key: "orders",
      label: copy.analytics.metrics.orders,
      value: String(orderCount),
      change: percentChange(orderCount, previousOrderCount),
      tone: "yellow",
    },
    {
      key: "avg",
      label: copy.analytics.metrics.avgCheck,
      value: money(averageOrderValue),
      change: percentChange(averageOrderValue, previousAverageOrderValue),
      tone: "blue",
    },
    {
      key: "customers",
      label: copy.analytics.metrics.customersInRange,
      value: String(customerCount),
      change: percentChange(customerCount, previousCustomerCount),
      tone: "cream",
    },
  ];

  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const positive = (item.change ?? 0) >= 0;
        const display = formatChange(item.change);

        return (
          <article
            key={item.key}
            className={`rounded-[16px] border px-4 py-4 ${TONE_CLASS[item.tone]}`}
          >
            <p className="text-xs font-bold tracking-[0.12em] text-[#1e1e1e]/55 uppercase">
              {item.label}
            </p>
            <div className="mt-2 flex items-end justify-between gap-2">
              <p className="text-xl font-bold text-[#1e1e1e] sm:text-2xl">
                {item.value}
              </p>
              {item.change == null ? (
                <span className="text-xs font-bold text-[#1e1e1e]/40">—</span>
              ) : (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                    positive ? "text-emerald-700" : "text-[#c2410c]"
                  }`}
                >
                  {positive ? (
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  ) : (
                    <ArrowDownRight className="size-3.5" aria-hidden />
                  )}
                  {display}
                </span>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
