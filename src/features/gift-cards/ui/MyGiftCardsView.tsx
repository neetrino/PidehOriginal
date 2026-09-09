'use client';

import { useMemo, useState } from 'react';

import { BuyGiftCardDrawer } from '@/features/gift-cards/ui/BuyGiftCardDrawer';
import type {
  CustomerGiftCardListItem,
  GiftCardDetail,
} from '@/features/gift-cards/application/queries';
import type {
  CustomerGiftCardBucket,
  GiftCardSettings,
} from '@/features/gift-cards/domain/gift-card-rules';
import type { Locale } from '@/lib/i18n/config';
import { formatMoneyAmount } from '@/lib/money/format';

type MyGiftCardsViewCopy = {
  title: string;
  buy: string;
  empty: string;
  history: string;
  status: string;
  balance: string;
  initial: string;
  recipient: string;
  expires: string;
  filters: Record<CustomerGiftCardBucket, string>;
  statuses: Record<string, string>;
  buyDrawer: {
    title: string;
    description: string;
    amount: string;
    customAmount: string;
    recipientName: string;
    recipientEmail: string;
    recipientPhone: string;
    purchaserName: string;
    message: string;
    sendDate: string;
    paymentMethod: string;
    cashOnDelivery: string;
    submit: string;
    submitting: string;
    successPending: string;
  };
};

type MyGiftCardsViewProps = {
  locale: Locale;
  settings: GiftCardSettings;
  defaultPurchaserName: string;
  details: Array<{
    card: CustomerGiftCardListItem;
    detail: GiftCardDetail | null;
  }>;
  copy: MyGiftCardsViewCopy;
};

const FILTER_ORDER: CustomerGiftCardBucket[] = ['mine', 'usedByMe', 'boughtForOthers'];

export function MyGiftCardsView({
  locale,
  settings,
  defaultPurchaserName,
  details,
  copy,
}: MyGiftCardsViewProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerKey, setDrawerKey] = useState(0);
  const [activeFilter, setActiveFilter] = useState<CustomerGiftCardBucket>('mine');

  const filteredDetails = useMemo(
    () => details.filter(({ card }) => card.bucket === activeFilter),
    [activeFilter, details],
  );

  return (
    <section className="profile-sheet-keep-frame space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-[#1e1e1e] sm:text-3xl">
          {copy.title}
        </h1>
        <button
          type="button"
          onClick={() => {
            setDrawerKey((key) => key + 1);
            setDrawerOpen(true);
          }}
          className="inline-flex h-10 items-center rounded-full bg-[#ff6b00] px-5 text-sm font-bold text-white transition hover:brightness-105"
        >
          {copy.buy}
        </button>
      </div>

      <div
        className="flex flex-nowrap items-center gap-1.5 sm:gap-2"
        role="tablist"
        aria-label={copy.title}
      >
        {FILTER_ORDER.map((bucket) => {
          const isActive = activeFilter === bucket;
          return (
            <button
              key={bucket}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveFilter(bucket)}
              className={`inline-flex min-h-8 flex-1 items-center justify-center rounded-full px-2.5 py-1.5 text-center text-[10px] font-bold leading-tight tracking-wide uppercase transition sm:min-h-9 sm:px-3 sm:text-[11px] lg:text-xs ${
                isActive
                  ? 'bg-[#1e1e1e] text-white shadow-[0_8px_18px_rgba(30,30,30,0.18)]'
                  : 'bg-[#ff6b00]/12 text-[#1e1e1e] hover:bg-[#ff6b00]/20'
              }`}
            >
              {copy.filters[bucket]}
            </button>
          );
        })}
      </div>

      {filteredDetails.length === 0 ? (
        <p className="text-sm text-[#1e1e1e]/65">{copy.empty}</p>
      ) : (
        <ul className="space-y-4">
          {filteredDetails.map(({ card, detail }) => (
            <li
              key={card.id}
              className="overflow-hidden rounded-2xl border border-[#ff6b00]/15 bg-white shadow-[0_8px_20px_rgba(30,30,30,0.04)]"
            >
              <div className="space-y-2 px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-[#1e1e1e]">
                      {card.code}
                    </p>
                    <p className="mt-1 text-xs text-[#1e1e1e]/55">
                      {copy.status}: {copy.statuses[card.status] ?? card.status}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium text-[#1e1e1e]">
                      {copy.balance}: {formatMoneyAmount(card.balanceAmount, 'AMD', locale)}
                    </p>
                    <p className="text-xs text-[#1e1e1e]/55">
                      {copy.initial}: {formatMoneyAmount(card.initialAmount, 'AMD', locale)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#1e1e1e]/55">
                  {copy.recipient}: {card.recipientName} · {card.recipientEmail}
                </p>
                {card.expiresAt ? (
                  <p className="text-xs text-[#1e1e1e]/55">
                    {copy.expires}: {card.expiresAt.toISOString().slice(0, 10)}
                  </p>
                ) : null}
              </div>
              {detail && detail.transactions.length > 0 ? (
                <div className="border-t border-[#ff6b00]/10 px-4 py-3 sm:px-5">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#1e1e1e]/45">
                    {copy.history}
                  </p>
                  <ul className="space-y-2">
                    {detail.transactions.map((row) => (
                      <li
                        key={row.id}
                        className="flex items-center justify-between gap-3 text-xs text-[#1e1e1e]/65"
                      >
                        <span>
                          {row.type} · {row.createdAt.toISOString().slice(0, 10)}
                        </span>
                        <span className="font-medium text-[#1e1e1e]">
                          {row.delta > 0 ? '+' : ''}
                          {formatMoneyAmount(row.delta, 'AMD', locale)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <BuyGiftCardDrawer
        key={drawerKey}
        locale={locale}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        settings={settings}
        defaultPurchaserName={defaultPurchaserName}
        copy={copy.buyDrawer}
      />
    </section>
  );
}
