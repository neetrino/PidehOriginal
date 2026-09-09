import 'server-only';

import { and, count, eq, gte, inArray, isNotNull, lte, or, sql } from 'drizzle-orm';

import { getProviders } from '@/config/providers';
import { getDb } from '@/db/client';
import { orders } from '@/db/schema';
import {
  queryTopCategories,
  queryTopSellingProducts,
  type AnalyticsTopCategory,
  type AnalyticsTopProduct,
} from '@/features/analytics/application/top-rankings';
import type { AnalyticsCsvRow } from '@/features/analytics/domain/csv';
import { percentChange } from '@/features/analytics/domain/date-range';
import type { OrderStatus } from '@/features/orders/domain/order-status';
import { getStoreRevenue } from '@/features/settings/application/queries';
import type { Locale } from '@/lib/i18n/config';

export type {
  AnalyticsTopCategory,
  AnalyticsTopProduct,
} from '@/features/analytics/application/top-rankings';
export type { AnalyticsCsvRow } from '@/features/analytics/domain/csv';
export { buildAnalyticsCsv, guardCsvCell } from '@/features/analytics/domain/csv';

const CACHE_TTL_SECONDS = 300;
const cacheKeys = new Set<string>();

export type AnalyticsMetricBlock = {
  revenueAmount: number;
  orderCount: number;
  averageOrderValue: number;
  changePercent: number | null;
};

export type AnalyticsPeriodMetrics = {
  revenueAmount: number;
  orderCount: number;
  averageOrderValue: number;
  customerCount: number;
  previousRevenueAmount: number;
  previousOrderCount: number;
  previousAverageOrderValue: number;
  previousCustomerCount: number;
};

export type AnalyticsSummary = {
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
  snapshots: {
    today: AnalyticsMetricBlock;
    yesterday: AnalyticsMetricBlock;
    month: AnalyticsMetricBlock;
    total: AnalyticsMetricBlock;
  };
  period: AnalyticsPeriodMetrics;
  dailyRows: AnalyticsCsvRow[];
  topProducts: AnalyticsTopProduct[];
  topCategories: AnalyticsTopCategory[];
};

function periodBounds(
  from: string,
  to: string,
): {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
  previousFrom: string;
  previousTo: string;
} {
  const start = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T23:59:59.999Z`);
  const durationMs = Math.max(end.getTime() - start.getTime(), 24 * 60 * 60 * 1000 - 1);
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - durationMs);

  return {
    start,
    end,
    previousStart,
    previousEnd,
    previousFrom: previousStart.toISOString().slice(0, 10),
    previousTo: previousEnd.toISOString().slice(0, 10),
  };
}

function utcDayBounds(isoDate: string): { start: Date; end: Date } {
  return {
    start: new Date(`${isoDate}T00:00:00.000Z`),
    end: new Date(`${isoDate}T23:59:59.999Z`),
  };
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function averageOrderValue(revenue: number, orderCount: number): number {
  if (orderCount === 0) {
    return 0;
  }
  return Math.round((revenue / orderCount) * 100) / 100;
}

function cacheKey(from: string, to: string, locale: Locale): string {
  return `analytics:v2:${locale}:${from}:${to}`;
}

function metricBlock(
  revenueAmount: number,
  orderCount: number,
  previousRevenue: number,
  withChange: boolean,
): AnalyticsMetricBlock {
  return {
    revenueAmount,
    orderCount,
    averageOrderValue: averageOrderValue(revenueAmount, orderCount),
    changePercent: withChange ? percentChange(revenueAmount, previousRevenue) : null,
  };
}

async function queryPeriodMetrics(input: {
  start: Date;
  end: Date;
  revenueStatuses: OrderStatus[];
}): Promise<{ orderCount: number; revenueAmount: number }> {
  const where = and(
    eq(orders.isArchived, false),
    gte(orders.placedAt, input.start),
    lte(orders.placedAt, input.end),
  );

  const [[ordersRow], [revenueRow]] = await Promise.all([
    getDb().select({ value: count() }).from(orders).where(where),
    getDb()
      .select({
        value: sql<number>`coalesce(sum(${orders.totalAmount}), 0)`.mapWith(Number),
      })
      .from(orders)
      .where(and(where, inArray(orders.status, input.revenueStatuses))),
  ]);

  return {
    orderCount: ordersRow?.value ?? 0,
    revenueAmount: revenueRow?.value ?? 0,
  };
}

async function queryCustomerCount(input: { start: Date; end: Date }): Promise<number> {
  const [row] = await getDb()
    .select({
      value:
        sql<number>`count(distinct coalesce(${orders.userId}::text, ${orders.contactEmail}))`.mapWith(
          Number,
        ),
    })
    .from(orders)
    .where(
      and(
        eq(orders.isArchived, false),
        gte(orders.placedAt, input.start),
        lte(orders.placedAt, input.end),
        or(isNotNull(orders.userId), isNotNull(orders.contactEmail)),
      ),
    );

  return row?.value ?? 0;
}

async function queryAllTimeMetrics(input: {
  revenueStatuses: OrderStatus[];
}): Promise<{ orderCount: number; revenueAmount: number }> {
  const where = eq(orders.isArchived, false);

  const [[ordersRow], [revenueRow]] = await Promise.all([
    getDb().select({ value: count() }).from(orders).where(where),
    getDb()
      .select({
        value: sql<number>`coalesce(sum(${orders.totalAmount}), 0)`.mapWith(Number),
      })
      .from(orders)
      .where(and(where, inArray(orders.status, input.revenueStatuses))),
  ]);

  return {
    orderCount: ordersRow?.value ?? 0,
    revenueAmount: revenueRow?.value ?? 0,
  };
}

async function queryDailyRows(input: {
  from: string;
  to: string;
  revenueStatuses: OrderStatus[];
}): Promise<AnalyticsCsvRow[]> {
  const bounds = periodBounds(input.from, input.to);
  const revenueStatusSql = sql.join(
    input.revenueStatuses.map((status) => sql`${status}`),
    sql`, `,
  );
  const rows = await getDb()
    .select({
      date: sql<string>`to_char(${orders.placedAt} at time zone 'UTC', 'YYYY-MM-DD')`,
      orderCount: count(),
      revenueAmount:
        sql<number>`coalesce(sum(case when ${orders.status} in (${revenueStatusSql}) then ${orders.totalAmount} else 0 end), 0)`.mapWith(
          Number,
        ),
    })
    .from(orders)
    .where(
      and(
        eq(orders.isArchived, false),
        gte(orders.placedAt, bounds.start),
        lte(orders.placedAt, bounds.end),
      ),
    )
    .groupBy(sql`to_char(${orders.placedAt} at time zone 'UTC', 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${orders.placedAt} at time zone 'UTC', 'YYYY-MM-DD')`);

  return rows.map((row) => ({
    date: row.date,
    orderCount: row.orderCount,
    revenueAmount: row.revenueAmount,
    averageOrderValue: averageOrderValue(row.revenueAmount, row.orderCount),
  }));
}

async function computeAnalyticsSummary(input: {
  from: string;
  to: string;
  locale: Locale;
}): Promise<AnalyticsSummary> {
  const revenue = await getStoreRevenue();
  const revenueStatuses = revenue.statuses as OrderStatus[];
  const bounds = periodBounds(input.from, input.to);

  const todayIso = toIsoDate(
    new Date(
      Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()),
    ),
  );
  const yesterdayDate = new Date(`${todayIso}T00:00:00.000Z`);
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
  const yesterdayIso = toIsoDate(yesterdayDate);
  const dayBeforeDate = new Date(yesterdayDate);
  dayBeforeDate.setUTCDate(dayBeforeDate.getUTCDate() - 1);
  const dayBeforeIso = toIsoDate(dayBeforeDate);

  const monthStartIso = `${todayIso.slice(0, 7)}-01`;
  const prevMonthEnd = new Date(`${monthStartIso}T00:00:00.000Z`);
  prevMonthEnd.setUTCDate(0);
  const prevMonthEndIso = toIsoDate(prevMonthEnd);
  const prevMonthStartIso = `${prevMonthEndIso.slice(0, 7)}-01`;

  const todayBounds = utcDayBounds(todayIso);
  const yesterdayBounds = utcDayBounds(yesterdayIso);
  const dayBeforeBounds = utcDayBounds(dayBeforeIso);
  const monthBounds = {
    start: new Date(`${monthStartIso}T00:00:00.000Z`),
    end: todayBounds.end,
  };
  const prevMonthBounds = {
    start: new Date(`${prevMonthStartIso}T00:00:00.000Z`),
    end: new Date(`${prevMonthEndIso}T23:59:59.999Z`),
  };

  const [
    current,
    previous,
    currentCustomers,
    previousCustomers,
    today,
    yesterday,
    dayBefore,
    month,
    prevMonth,
    allTime,
    dailyRows,
    topProducts,
    topCategories,
  ] = await Promise.all([
    queryPeriodMetrics({
      start: bounds.start,
      end: bounds.end,
      revenueStatuses,
    }),
    queryPeriodMetrics({
      start: bounds.previousStart,
      end: bounds.previousEnd,
      revenueStatuses,
    }),
    queryCustomerCount({ start: bounds.start, end: bounds.end }),
    queryCustomerCount({
      start: bounds.previousStart,
      end: bounds.previousEnd,
    }),
    queryPeriodMetrics({
      start: todayBounds.start,
      end: todayBounds.end,
      revenueStatuses,
    }),
    queryPeriodMetrics({
      start: yesterdayBounds.start,
      end: yesterdayBounds.end,
      revenueStatuses,
    }),
    queryPeriodMetrics({
      start: dayBeforeBounds.start,
      end: dayBeforeBounds.end,
      revenueStatuses,
    }),
    queryPeriodMetrics({
      start: monthBounds.start,
      end: monthBounds.end,
      revenueStatuses,
    }),
    queryPeriodMetrics({
      start: prevMonthBounds.start,
      end: prevMonthBounds.end,
      revenueStatuses,
    }),
    queryAllTimeMetrics({ revenueStatuses }),
    queryDailyRows({
      from: input.from,
      to: input.to,
      revenueStatuses,
    }),
    queryTopSellingProducts({
      start: bounds.start,
      end: bounds.end,
      revenueStatuses,
    }),
    queryTopCategories({
      start: bounds.start,
      end: bounds.end,
      revenueStatuses,
      locale: input.locale,
    }),
  ]);

  return {
    from: input.from,
    to: input.to,
    previousFrom: bounds.previousFrom,
    previousTo: bounds.previousTo,
    snapshots: {
      today: metricBlock(today.revenueAmount, today.orderCount, yesterday.revenueAmount, true),
      yesterday: metricBlock(
        yesterday.revenueAmount,
        yesterday.orderCount,
        dayBefore.revenueAmount,
        true,
      ),
      month: metricBlock(month.revenueAmount, month.orderCount, prevMonth.revenueAmount, true),
      total: metricBlock(allTime.revenueAmount, allTime.orderCount, 0, false),
    },
    period: {
      revenueAmount: current.revenueAmount,
      orderCount: current.orderCount,
      averageOrderValue: averageOrderValue(current.revenueAmount, current.orderCount),
      customerCount: currentCustomers,
      previousRevenueAmount: previous.revenueAmount,
      previousOrderCount: previous.orderCount,
      previousAverageOrderValue: averageOrderValue(previous.revenueAmount, previous.orderCount),
      previousCustomerCount: previousCustomers,
    },
    dailyRows,
    topProducts,
    topCategories,
  };
}

/** Loads analytics summary with Redis cache (300s TTL). */
export async function getAnalyticsSummary(input: {
  from: string;
  to: string;
  locale?: Locale;
}): Promise<AnalyticsSummary> {
  const locale = input.locale ?? 'hy';
  const key = cacheKey(input.from, input.to, locale);
  const redis = getProviders().redis.getClient();
  const cached = await redis.get(key);

  if (cached) {
    return JSON.parse(cached) as AnalyticsSummary;
  }

  const summary = await computeAnalyticsSummary({
    from: input.from,
    to: input.to,
    locale,
  });
  await redis.set(key, JSON.stringify(summary), { ex: CACHE_TTL_SECONDS });
  cacheKeys.add(key);
  return summary;
}

/** Deletes cached analytics keys (exact keys tracked in-process). */
export async function invalidateAnalyticsCache(): Promise<void> {
  const redis = getProviders().redis.getClient();
  await Promise.all(
    [...cacheKeys].map(async (key) => {
      await redis.del(key);
      cacheKeys.delete(key);
    }),
  );
}
