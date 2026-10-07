import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';

import { Card } from '@/components/ui/Card';
import { ADMIN_PAGE_SUBTITLE } from '@/features/admin/ui/admin-form-classes';
import { AdminPageHeading } from '@/features/admin/ui/AdminPageHeading';
import { ADMIN_BADGE } from '@/features/admin/ui/status-badge';
import { getAdminProductReviews } from '@/features/reviews/application/admin-queries';
import { reviewStatusBadgeClass } from '@/features/reviews/ui/review-status-badge';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type AdminProductReviewsPageProps = {
  params: Promise<{ locale: string; productId: string }>;
};

const productIdSchema = z.string().uuid();

export default async function AdminProductReviewsPage({ params }: AdminProductReviewsPageProps) {
  const { locale, productId } = await params;
  if (!isLocale(locale) || !productIdSchema.safeParse(productId).success) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const t = dictionary.admin.reviews;

  const view = await getAdminProductReviews(productId, locale);
  if (!view) {
    notFound();
  }

  return (
    <section>
      <div className="mb-6">
        <p className={`mb-1 ${ADMIN_PAGE_SUBTITLE}`}>
          <Link
            href={`/${locale}/admin/reviews`}
            className="font-medium text-gray-700 hover:underline"
          >
            {t.breadcrumb}
          </Link>
        </p>
        <AdminPageHeading
          title={view.title}
          description={t.count.replace('{total}', String(view.reviews.length))}
        />
      </div>

      {view.reviews.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-gray-600">{t.detail.empty}</p>
        </Card>
      ) : (
        <ul className="space-y-4">
          {view.reviews.map((review) => (
            <li key={review.id}>
              <Card className="p-6">
                <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-semibold text-gray-900">{review.authorName}</span>
                  <span className="text-xs text-gray-500">{review.authorEmail}</span>
                  <span className="text-amber-500" aria-label={`${review.rating}/5`}>
                    {'★'.repeat(review.rating)}
                    <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                  </span>
                  {review.moderationStatus ? (
                    <span
                      className={`${ADMIN_BADGE} ${reviewStatusBadgeClass(review.moderationStatus)}`}
                    >
                      {review.moderationStatus}
                    </span>
                  ) : null}
                  {review.orderNumber ? (
                    <Link
                      href={`/${locale}/admin/orders/${review.orderNumber}`}
                      className={`${ADMIN_BADGE} bg-purple-100 text-purple-800 hover:underline`}
                    >
                      {t.detail.orderReview.replace('{orderNumber}', review.orderNumber)}
                    </Link>
                  ) : null}
                  {review.isVerifiedPurchase ? (
                    <span className={`${ADMIN_BADGE} bg-blue-100 text-blue-800`}>
                      {t.detail.verifiedPurchase}
                    </span>
                  ) : null}
                  <span className="ml-auto text-xs text-gray-500">
                    {review.createdAt.toISOString().slice(0, 16).replace('T', ' ')}{' '}
                    {dictionary.admin.common.utc}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                  {review.comment || t.detail.noComment}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
