import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ADMIN_PAGE_SUBTITLE,
  ADMIN_PAGE_TITLE,
} from "@/features/admin/ui/admin-form-classes";
import {
  ADMIN_TABLE,
  ADMIN_TABLE_CARD,
  ADMIN_TABLE_OUTER_SCROLL,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_STATE_INSET,
  ADMIN_TABLE_TBODY,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TH,
  ADMIN_TABLE_THEAD,
} from "@/features/admin/ui/admin-table-classes";
import { Card } from "@/components/ui/Card";
import { getGiftCardDetail } from "@/features/gift-cards/application/queries";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatMoneyAmount } from "@/lib/money/format";

type AdminGiftCardDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminGiftCardDetailPage({
  params,
}: AdminGiftCardDetailPageProps) {
  const { locale, id } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const [card, dict] = await Promise.all([
    getGiftCardDetail(id),
    getDictionary(locale),
  ]);
  if (!card) {
    notFound();
  }

  const copy = dict.admin.giftCards;

  return (
    <section>
      <div className="mb-6">
        <p className="mb-2 text-sm text-gray-500">
          <Link
            href={`/${locale}/admin/gift-cards`}
            className="underline-offset-2 hover:underline"
          >
            {copy.title}
          </Link>
        </p>
        <h1 className={ADMIN_PAGE_TITLE}>
          <span className="font-mono tracking-wide">{card.code}</span>
        </h1>
        <p className={ADMIN_PAGE_SUBTITLE}>
          {copy.statuses[card.status] ?? card.status} ·{" "}
          {formatMoneyAmount(card.balanceAmount, "AMD", locale)} /{" "}
          {formatMoneyAmount(card.initialAmount, "AMD", locale)}
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card className="rounded-2xl border border-gray-200 p-5 shadow-none">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            {copy.table.recipient}
          </h2>
          <p className="text-sm text-gray-900">{card.recipientName}</p>
          <p className="text-sm text-gray-600">{card.recipientEmail}</p>
          {card.recipientPhone ? (
            <p className="text-sm text-gray-600">{card.recipientPhone}</p>
          ) : null}
        </Card>
        <Card className="rounded-2xl border border-gray-200 p-5 shadow-none">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            {copy.table.purchaser}
          </h2>
          <p className="text-sm text-gray-900">{card.purchaserName}</p>
          <p className="text-sm text-gray-600">{card.purchaserEmail ?? "—"}</p>
        </Card>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-gray-900">{copy.history}</h2>
      <Card className={ADMIN_TABLE_CARD}>
        <div className={ADMIN_TABLE_OUTER_SCROLL}>
          <table className={ADMIN_TABLE}>
            <thead className={ADMIN_TABLE_THEAD}>
              <tr>
                <th className={ADMIN_TABLE_TH}>{dict.admin.common.status}</th>
                <th className={ADMIN_TABLE_TH}>Delta</th>
                <th className={ADMIN_TABLE_TH}>{copy.table.balance}</th>
                <th className={ADMIN_TABLE_TH}>UTC</th>
              </tr>
            </thead>
            <tbody className={ADMIN_TABLE_TBODY}>
              {card.transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className={ADMIN_TABLE_STATE_INSET}>
                    {copy.empty}
                  </td>
                </tr>
              ) : (
                card.transactions.map((row) => (
                  <tr key={row.id} className={ADMIN_TABLE_ROW}>
                    <td className={ADMIN_TABLE_TD}>{row.type}</td>
                    <td className={ADMIN_TABLE_TD}>
                      {formatMoneyAmount(row.delta, "AMD", locale)}
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      {formatMoneyAmount(row.resultingBalance, "AMD", locale)}
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      {row.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
