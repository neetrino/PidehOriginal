'use client';

import { useState, useTransition } from 'react';

import type { AdminOrderDetailView } from '@/features/orders/application/order-detail-view';
import { submitOrderReviewAction } from '@/features/orders/application/submit-order-review';
import { RatingStars } from '@/features/products/ui/ProductReviewRating';
import { StarRatingInput } from '@/features/reviews/ui/StarRatingInput';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type OrderDetailsDrawerReviewProps = {
  detail: AdminOrderDetailView;
  copy: Dictionary['admin']['orders']['drawer'];
  /** Required to submit a new review from the customer drawer. */
  locale?: Locale;
  onReviewSubmitted?: (detail: AdminOrderDetailView) => void;
};

export function OrderDetailsDrawerReview({
  detail,
  copy,
  locale,
  onReviewSubmitted,
}: OrderDetailsDrawerReviewProps) {
  const existing = detail.customerReview;
  const [rating, setRating] = useState(0);
  const [commentDraft, setCommentDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (existing) {
    return (
      <section className="rounded-2xl border border-gray-200 px-5 py-4">
        <h3 className="mb-3 text-base font-semibold text-gray-900">{copy.reviewTitle}</h3>
        <RatingStars average={existing.rating} />
        {existing.comment ? (
          <p className="mt-3 text-sm whitespace-pre-wrap text-gray-800">{existing.comment}</p>
        ) : null}
      </section>
    );
  }

  if (!detail.canSubmitReview || !locale) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-gray-200 px-5 py-4">
      <h3 className="mb-1 text-base font-semibold text-gray-900">{copy.reviewTitle}</h3>
      <p className="mb-4 text-sm text-gray-500">{copy.reviewHint}</p>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const comment = commentDraft.trim();
          if (rating < 1 || comment.length === 0) {
            return;
          }
          setError(null);
          startTransition(async () => {
            const result = await submitOrderReviewAction(locale, {
              orderNumber: detail.orderNumber,
              rating,
              comment,
            });
            if (!result.ok) {
              setError(result.error.message);
              return;
            }
            onReviewSubmitted?.({
              ...detail,
              canSubmitReview: false,
              customerReview: {
                rating,
                comment,
                reviewedAt: new Date().toISOString(),
              },
            });
          });
        }}
      >
        <StarRatingInput
          value={rating}
          onChange={setRating}
          label={copy.reviewRating}
          disabled={pending}
        />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-900" htmlFor="order-review-comment">
            {copy.reviewComment}
          </label>
          <textarea
            id="order-review-comment"
            rows={4}
            maxLength={2000}
            required
            disabled={pending}
            value={commentDraft}
            onChange={(event) => setCommentDraft(event.target.value)}
            placeholder={copy.reviewPlaceholder}
            className="min-h-[6rem] resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 disabled:opacity-60"
          />
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={pending || rating < 1 || commentDraft.trim().length === 0}
          className="inline-flex w-fit rounded-full bg-[#ff6b00] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e85f00] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? copy.reviewSubmitting : copy.reviewSubmit}
        </button>
      </form>
    </section>
  );
}
