import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

import type { AnalyticsMetricBlock } from '@/features/analytics/application/queries';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type AnalyticsSnapshotCardsProps = {
  snapshots: {
    today: AnalyticsMetricBlock;
    yesterday: AnalyticsMetricBlock;
    month: AnalyticsMetricBlock;
    total: AnalyticsMetricBlock;
  };
  formatMoney: (amount: number) => string;
  copy: Dictionary['admin'];
};

function formatChange(changePercent: number): string {
  if (changePercent === 0) {
    return '0%';
  }
  const sign = changePercent > 0 ? '+' : '';
  return `${sign}${changePercent.toFixed(1)}%`;
}

function ChangeBadge({
  changePercent,
  changeAria,
}: {
  changePercent: number | null;
  changeAria: string;
}) {
  if (changePercent == null) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-[#1e1e1e]/6 px-2 py-0.5 text-xs font-bold text-[#1e1e1e]/55">
        —
      </span>
    );
  }

  const positive = changePercent >= 0;
  const display = formatChange(changePercent);

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold ${
        positive ? 'bg-emerald-50 text-emerald-700' : 'bg-[#ff6b00]/12 text-[#c2410c]'
      }`}
      aria-label={changeAria.replace('{value}', display)}
    >
      {positive ? (
        <ArrowUpRight className="size-3.5" aria-hidden />
      ) : (
        <ArrowDownRight className="size-3.5" aria-hidden />
      )}
      {display}
    </span>
  );
}

export function AnalyticsSnapshotCards({
  snapshots,
  formatMoney,
  copy,
}: AnalyticsSnapshotCardsProps) {
  const cards = [
    { key: 'today', label: copy.analytics.snapshots.today, block: snapshots.today },
    {
      key: 'yesterday',
      label: copy.analytics.snapshots.yesterday,
      block: snapshots.yesterday,
    },
    { key: 'month', label: copy.analytics.snapshots.month, block: snapshots.month },
    { key: 'total', label: copy.analytics.snapshots.total, block: snapshots.total },
  ] as const;

  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.key}
          className="rounded-[18px] border border-[#1e1e1e]/8 bg-white p-4 shadow-[0_8px_20px_rgba(30,30,30,0.05)]"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-extrabold tracking-[0.14em] text-[#1e1e1e]/45 uppercase">
              {card.label}
            </p>
            <ChangeBadge
              changePercent={card.block.changePercent}
              changeAria={copy.analytics.snapshots.changeAria}
            />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[#1e1e1e] sm:text-[1.7rem]">
            {formatMoney(card.block.revenueAmount)}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#1e1e1e]/55">
            <span>
              {copy.analytics.snapshots.orders.replace('{count}', String(card.block.orderCount))}
            </span>
            <span>
              {copy.analytics.snapshots.avgOrder.replace(
                '{amount}',
                formatMoney(card.block.averageOrderValue),
              )}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
