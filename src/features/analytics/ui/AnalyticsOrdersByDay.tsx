import type { AnalyticsCsvRow } from "@/features/analytics/domain/csv";
import { AnalyticsTrendChart } from "@/features/analytics/ui/AnalyticsTrendChart";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { formatMoneyAmount } from "@/lib/money/format";

type AnalyticsOrdersByDayProps = {
  rows: AnalyticsCsvRow[];
  from: string;
  to: string;
  locale: Locale;
  revenueAmount: number;
  orderCount: number;
  averageOrderValue: number;
  copy: Dictionary["admin"];
};

export function AnalyticsOrdersByDay({
  rows,
  from,
  to,
  locale,
  revenueAmount,
  orderCount,
  averageOrderValue,
  copy,
}: AnalyticsOrdersByDayProps) {
  const revenueLabel = formatMoneyAmount(revenueAmount, "AMD", locale);
  const averageLabel = formatMoneyAmount(averageOrderValue, "AMD", locale);

  return (
    <div className="mb-5 overflow-hidden rounded-[22px] border-2 border-[#1e1e1e] bg-white shadow-[6px_6px_0_#1e1e1e]">
      <div className="flex flex-col lg:flex-row">
        <div className="min-w-0 flex-1 p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="font-display text-2xl text-[#1e1e1e] uppercase">
              {copy.analytics.ordersByDay.title}
            </h2>
            <p className="mt-1 text-sm text-[#1e1e1e]/55">
              {copy.analytics.ordersByDay.subtitle}
            </p>
          </div>

          {rows.length === 0 ? (
            <p className="py-16 text-center text-sm text-[#1e1e1e]/50">
              {copy.analytics.ordersByDay.empty}
            </p>
          ) : (
            <div className="rounded-2xl bg-gradient-to-b from-[#fff8e7]/80 to-white p-2 sm:p-3">
              <AnalyticsTrendChart
                rows={rows}
                from={from}
                to={to}
                locale={locale}
                copy={copy.analytics.ordersByDay}
              />
            </div>
          )}
        </div>

        <aside className="flex w-full flex-row gap-3 border-t-2 border-[#1e1e1e] bg-[#ffd54a]/35 p-4 lg:w-52 lg:flex-col lg:border-t-0 lg:border-l-2">
          <div className="flex-1 rounded-2xl border border-[#1e1e1e]/10 bg-white px-3 py-3 shadow-[2px_2px_0_rgba(30,30,30,0.08)]">
            <p className="text-[11px] font-bold tracking-wide text-[#1e1e1e]/45 uppercase">
              {copy.analytics.ordersByDay.sideIncome}
            </p>
            <p className="mt-1 text-sm font-bold text-[#1e1e1e]">{revenueLabel}</p>
          </div>
          <div className="flex-1 rounded-2xl border border-[#1e1e1e]/10 bg-white px-3 py-3 shadow-[2px_2px_0_rgba(30,30,30,0.08)]">
            <p className="text-[11px] font-bold tracking-wide text-[#1e1e1e]/45 uppercase">
              {copy.analytics.ordersByDay.sideOrders}
            </p>
            <p className="mt-1 text-sm font-bold text-[#1e1e1e]">{orderCount}</p>
          </div>
          <div className="flex-1 rounded-2xl border border-[#1e1e1e]/10 bg-white px-3 py-3 shadow-[2px_2px_0_rgba(30,30,30,0.08)]">
            <p className="text-[11px] font-bold tracking-wide text-[#1e1e1e]/45 uppercase">
              {copy.analytics.ordersByDay.sideAvg}
            </p>
            <p className="mt-1 text-sm font-bold text-[#1e1e1e]">{averageLabel}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
