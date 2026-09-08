"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AnalyticsCsvRow } from "@/features/analytics/domain/csv";
import { formatAnalyticsShortDate } from "@/features/analytics/domain/date-range";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { formatMoneyAmount } from "@/lib/money/format";

type ChartPoint = {
  date: string;
  label: string;
  orderCount: number;
  revenueAmount: number;
};

type AnalyticsTrendChartProps = {
  rows: AnalyticsCsvRow[];
  from: string;
  to: string;
  locale: Locale;
  copy: Dictionary["admin"]["analytics"]["ordersByDay"];
};

function buildSeries(
  rows: AnalyticsCsvRow[],
  from: string,
  to: string,
): ChartPoint[] {
  const byDate = new Map(rows.map((row) => [row.date, row]));
  const start = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T00:00:00.000Z`);
  const points: ChartPoint[] = [];

  for (
    let cursor = new Date(start);
    cursor.getTime() <= end.getTime();
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    const iso = cursor.toISOString().slice(0, 10);
    const row = byDate.get(iso);
    points.push({
      date: iso,
      label: formatAnalyticsShortDate(iso),
      orderCount: row?.orderCount ?? 0,
      revenueAmount: row?.revenueAmount ?? 0,
    });
  }

  return points;
}

type TooltipPayloadItem = {
  dataKey?: string | number;
  value?: number | string;
  color?: string;
  name?: string;
};

function TrendTooltip({
  active,
  payload,
  label,
  locale,
  ordersLegend,
  revenueLegend,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  locale: Locale;
  ordersLegend: string;
  revenueLegend: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const orders = payload.find((item) => item.dataKey === "orderCount");
  const revenue = payload.find((item) => item.dataKey === "revenueAmount");

  return (
    <div className="rounded-2xl border-2 border-[#1e1e1e] bg-[#fff8e7] px-3 py-2.5 shadow-[4px_4px_0_#1e1e1e]">
      <p className="text-xs font-extrabold tracking-wide text-[#1e1e1e]/50 uppercase">
        {label}
      </p>
      <div className="mt-2 space-y-1.5 text-sm font-bold text-[#1e1e1e]">
        <p className="flex items-center gap-2">
          <span className="size-2.5 rounded-sm bg-[#ffd54a]" aria-hidden />
          {ordersLegend}: {Number(orders?.value ?? 0)}
        </p>
        <p className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#ff6b00]" aria-hidden />
          {revenueLegend}:{" "}
          {formatMoneyAmount(Number(revenue?.value ?? 0), "AMD", locale)}
        </p>
      </div>
    </div>
  );
}

function revenueTick(value: number): string {
  if (value >= 1_000_000) {
    return `${Math.round(value / 100_000) / 10}M`;
  }
  if (value >= 1000) {
    return `${Math.round(value / 1000)}k`;
  }
  return String(Math.round(value));
}

export function AnalyticsTrendChart({
  rows,
  from,
  to,
  locale,
  copy,
}: AnalyticsTrendChartProps) {
  const data = useMemo(() => buildSeries(rows, from, to), [rows, from, to]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div
        className="h-[300px] w-full animate-pulse rounded-xl bg-[#ffd54a]/20"
        role="img"
        aria-label={copy.chartAria}
      />
    );
  }

  return (
    <div
      className="h-[300px] w-full"
      role="img"
      aria-label={copy.chartAria}
    >
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <ComposedChart
          data={data}
          margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
          barCategoryGap="28%"
        >
          <defs>
            <linearGradient id="pidehOrdersBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffd54a" stopOpacity={1} />
              <stop offset="100%" stopColor="#ffb300" stopOpacity={0.85} />
            </linearGradient>
            <linearGradient id="pidehRevenueArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff6b00" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#ff6b00" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 8"
            vertical={false}
            stroke="rgba(30,30,30,0.1)"
          />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgba(30,30,30,0.45)", fontSize: 11, fontWeight: 600 }}
            dy={8}
            minTickGap={16}
          />

          <YAxis
            yAxisId="orders"
            orientation="left"
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={36}
            tick={{ fill: "rgba(30,30,30,0.4)", fontSize: 11 }}
          />

          <YAxis
            yAxisId="revenue"
            orientation="right"
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={revenueTick}
            tick={{ fill: "#ff6b00", fontSize: 11, fontWeight: 600 }}
          />

          <Tooltip
            cursor={{ fill: "rgba(255,213,74,0.12)" }}
            content={
              <TrendTooltip
                locale={locale}
                ordersLegend={copy.ordersLegend}
                revenueLegend={copy.revenueLegend}
              />
            }
          />

          <Legend
            verticalAlign="bottom"
            height={28}
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs font-bold text-[#1e1e1e]/70">{value}</span>
            )}
          />

          <Bar
            yAxisId="orders"
            dataKey="orderCount"
            name={copy.ordersLegend}
            fill="url(#pidehOrdersBar)"
            radius={[10, 10, 4, 4]}
            maxBarSize={42}
            isAnimationActive={false}
          />

          <Area
            yAxisId="revenue"
            dataKey="revenueAmount"
            name={copy.revenueLegend}
            type="monotone"
            fill="url(#pidehRevenueArea)"
            stroke="transparent"
            legendType="none"
            isAnimationActive={false}
          />

          <Line
            yAxisId="revenue"
            dataKey="revenueAmount"
            name={copy.revenueLegend}
            type="monotone"
            stroke="#ff6b00"
            strokeWidth={3}
            dot={{
              r: 5,
              fill: "#ff6b00",
              stroke: "#fff8e7",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 7,
              fill: "#ff6b00",
              stroke: "#1e1e1e",
              strokeWidth: 2,
            }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
