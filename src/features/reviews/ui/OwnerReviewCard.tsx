"use client";

import { useState } from "react";

import { RatingStars } from "@/features/products/ui/ProductReviewRating";
import type { ViewerReview } from "@/features/reviews/application/queries";
import {
  canEditOwnReview,
  isReviewModerationStatus,
} from "@/features/reviews/domain/review-rules";
import { ReviewForm } from "@/features/reviews/ui/ReviewForm";
import type { Locale } from "@/lib/i18n/config";

type OwnerReviewCardLabels = {
  editReview: string;
  editReviewTitle: string;
  ratingLabel: string;
  yourReviewLabel: string;
  reviewPlaceholder: string;
  saveReview: string;
  savingReview: string;
  cancelReview: string;
  reviewPending: string;
  reviewSaveError: string;
  alreadyReviewed: string;
};

type OwnerReviewCardProps = {
  locale: Locale;
  productId: string;
  review: ViewerReview;
  labels: OwnerReviewCardLabels;
};

const editButtonClassName =
  "inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50";

export function OwnerReviewCard({
  locale,
  productId,
  review,
  labels,
}: OwnerReviewCardProps) {
  const [editing, setEditing] = useState(false);
  const isPending = review.moderationStatus === "PENDING";
  const canEdit =
    isReviewModerationStatus(review.moderationStatus) &&
    canEditOwnReview(review.moderationStatus);

  if (editing && canEdit) {
    return (
      <ReviewForm
        locale={locale}
        productId={productId}
        reviewId={review.id}
        initialRating={review.rating}
        initialComment={review.comment ?? ""}
        onCancel={() => setEditing(false)}
        labels={{
          title: labels.editReviewTitle,
          ratingLabel: labels.ratingLabel,
          yourReviewLabel: labels.yourReviewLabel,
          placeholder: labels.reviewPlaceholder,
          submit: labels.saveReview,
          submitting: labels.savingReview,
          cancel: labels.cancelReview,
          pending: labels.reviewPending,
          saveError: labels.reviewSaveError,
        }}
      />
    );
  }

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-gray-900">{review.authorName}</p>
        <RatingStars average={review.rating} size="sm" />
      </div>
      {review.comment ? (
        <p className="mt-2 text-sm whitespace-pre-wrap text-gray-700">
          {review.comment}
        </p>
      ) : null}
      <p className="mt-3 text-sm text-gray-500">
        {isPending ? labels.reviewPending : labels.alreadyReviewed}
      </p>
      {canEdit ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`${editButtonClassName} mt-4`}
        >
          {labels.editReview}
        </button>
      ) : null}
    </div>
  );
}
