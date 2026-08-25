"use client";

import { useState } from "react";

import { BuyGiftCardDrawer } from "@/features/gift-cards/ui/BuyGiftCardDrawer";
import type { GiftCardDetail, GiftCardListItem } from "@/features/gift-cards/application/queries";
import type { GiftCardSettings } from "@/features/gift-cards/domain/gift-card-rules";
import type { Locale } from "@/lib/i18n/config";
import { formatMoneyAmount } from "@/lib/money/format";

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
    card: GiftCardListItem;
    detail: GiftCardDetail | null;
  }>;
  copy: MyGiftCardsViewCopy;
};

export function MyGiftCardsView({
  locale,
  settings,
  defaultPurchaserName,
  details,
  copy,
}: MyGiftCardsViewProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerKey, setDrawerKey] = useState(0);

  return (
    <section className="profile-sheet-keep-frame space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {copy.title}
        </h1>
        <button
          type="button"
          onClick={() => {
            setDrawerKey((key) => key + 1);
            setDrawerOpen(true);
          }}
          className="inline-flex h-10 items-center rounded-xl bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
        >
          {copy.buy}
        </button>
      </div>

      {details.length === 0 ? (
        <p className="text-sm text-gray-600">{copy.empty}</p>
      ) : (
        <ul className="space-y-4">
          {details.map(({ card, detail }) => (
            <li
              key={card.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              <div className="space-y-2 px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-gray-900">
                      {card.code}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {copy.status}: {copy.statuses[card.status] ?? card.status}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium text-gray-900">
                      {copy.balance}:{" "}
                      {formatMoneyAmount(card.balanceAmount, "AMD", locale)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {copy.initial}:{" "}
                      {formatMoneyAmount(card.initialAmount, "AMD", locale)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {copy.recipient}: {card.recipientName} · {card.recipientEmail}
                </p>
                {card.expiresAt ? (
                  <p className="text-xs text-gray-500">
                    {copy.expires}: {card.expiresAt.toISOString().slice(0, 10)}
                  </p>
                ) : null}
              </div>
              {detail && detail.transactions.length > 0 ? (
                <div className="border-t border-gray-100 px-4 py-3 sm:px-5">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                    {copy.history}
                  </p>
                  <ul className="space-y-2">
                    {detail.transactions.map((row) => (
                      <li
                        key={row.id}
                        className="flex items-center justify-between gap-3 text-xs text-gray-600"
                      >
                        <span>
                          {row.type} · {row.createdAt.toISOString().slice(0, 10)}
                        </span>
                        <span className="font-medium text-gray-900">
                          {row.delta > 0 ? "+" : ""}
                          {formatMoneyAmount(row.delta, "AMD", locale)}
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
