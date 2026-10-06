import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Card } from '@/components/ui/Card';
import { AdminPageHeading } from '@/features/admin/ui/AdminPageHeading';
import {
  ADMIN_TABLE,
  ADMIN_TABLE_CARD,
  ADMIN_TABLE_OUTER_SCROLL,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_STATE_INSET,
  ADMIN_TABLE_TBODY,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TD_CENTER,
  ADMIN_TABLE_TH,
  ADMIN_TABLE_TH_CENTER,
  ADMIN_TABLE_THEAD,
} from '@/features/admin/ui/admin-table-classes';
import { ADMIN_BADGE } from '@/features/admin/ui/status-badge';
import { listAdminReviewedProducts } from '@/features/reviews/application/admin-queries';
import { reviewStatusBadgeClass } from '@/features/reviews/ui/review-status-badge';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type AdminReviewsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminReviewsPage({ params }: AdminReviewsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const t = dictionary.admin.reviews;
  const rows = await listAdminReviewedProducts(locale);

  return (
    <section>
      <AdminPageHeading
        className="mb-6"
        title={t.title}
        description={t.count.replace('{total}', String(rows.length))}
      />

      <Card className={ADMIN_TABLE_CARD}>
        {rows.length === 0 ? (
          <p className={`${ADMIN_TABLE_STATE_INSET} text-sm text-gray-600`}>{t.empty}</p>
        ) : (
          <div className={ADMIN_TABLE_OUTER_SCROLL}>
            <table className={ADMIN_TABLE}>
              <thead className={ADMIN_TABLE_THEAD}>
                <tr>
                  <th className={ADMIN_TABLE_TH}>{t.table.product}</th>
                  <th className={ADMIN_TABLE_TH_CENTER}>{t.table.reviews}</th>
                  <th className={ADMIN_TABLE_TH_CENTER}>{t.table.pending}</th>
                  <th className={ADMIN_TABLE_TH_CENTER}>{t.table.rating}</th>
                  <th className={ADMIN_TABLE_TH}>{t.table.lastReview}</th>
                </tr>
              </thead>
              <tbody className={ADMIN_TABLE_TBODY}>
                {rows.map((row) => (
                  <tr key={row.productId} className={ADMIN_TABLE_ROW}>
                    <td className={ADMIN_TABLE_TD}>
                      <Link
                        href={`/${locale}/admin/reviews/${row.productId}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {row.title}
                      </Link>
                      <p className="text-xs text-gray-500">{row.sku}</p>
                    </td>
                    <td className={ADMIN_TABLE_TD_CENTER}>{row.reviewCount}</td>
                    <td className={ADMIN_TABLE_TD_CENTER}>
                      {row.pendingCount > 0 ? (
                        <span className={`${ADMIN_BADGE} ${reviewStatusBadgeClass('PENDING')}`}>
                          {row.pendingCount}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className={ADMIN_TABLE_TD_CENTER}>★ {row.averageRating.toFixed(1)}</td>
                    <td className={ADMIN_TABLE_TD}>
                      <span className="text-xs text-gray-500">
                        {row.lastReviewAt.toISOString().slice(0, 16).replace('T', ' ')}{' '}
                        {dictionary.admin.common.utc}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}
