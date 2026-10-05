'use client';

import { useMemo, useState } from 'react';

import { BuyGiftCardDrawer } from '@/features/gift-cards/ui/BuyGiftCardDrawer';
import { ProfileGiftCard } from '@/features/gift-cards/ui/ProfileGiftCard';
import type {
  CustomerGiftCardListItem,
  GiftCardDetail,
} from '@/features/gift-cards/application/queries';
import type {
  CustomerGiftCardBucket,
  GiftCardSettings,
} from '@/features/gift-cards/domain/gift-card-rules';
import type { Locale } from '@/lib/i18n/config';

type MyGiftCardsViewCopy = {
  title: string;
  buy: string;
  empty: string;
  history: string;
  balance: string;
  initial: string;
  recipient: string;
  created: string;
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
    cashOnDeliveryDescription: string;
    idram: string;
    idramDescription: string;
    arca: string;
    arcaDescription: string;
    terminal: string;
    terminalDescription: string;
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
        <h1 className="font-display text-3xl leading-[0.9] text-[#1e1e1e] uppercase sm:text-4xl">
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
        <p className="rounded-[22px] bg-[#fff8e7] px-4 py-6 text-sm text-[#1e1e1e]/65">{copy.empty}</p>
      ) : (
        <ul className="space-y-4">
          {filteredDetails.map(({ card, detail }) => (
            <li key={card.id}>
              <ProfileGiftCard locale={locale} card={card} detail={detail} copy={copy} />
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
