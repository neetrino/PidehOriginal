"use client";

import Link from "next/link";
import { useState } from "react";

import { ReviewForm } from "@/features/reviews/ui/ReviewForm";
import type { Locale } from "@/lib/i18n/config";

type ProductWriteReviewCtaProps = {
  locale: Locale;
  productId: string;
  productSlug: string;
  canSubmit: boolean;
  isSignedIn: boolean;
  hasExistingReview: boolean;
  showEmptyPrompt: boolean;
  labels: {
    writeReview: string;
    writeReviewTitle: string;
    ratingLabel: string;
    yourReviewLabel: string;
    reviewPlaceholder: string;
    submitReview: string;
    submittingReview: string;
    cancelReview: string;
    reviewPending: string;
    reviewSaveError: string;
    emptyPrompt: string;
    signIn: string;
    signInToReview: string;
  };
};

const ctaClassName =
  "inline-flex items-center justify-center rounded-full bg-gray-900 px-10 py-3 text-base font-semibold text-white transition hover:bg-gray-800";

export function ProductWriteReviewCta({
  locale,
  productId,
  productSlug,
  canSubmit,
  isSignedIn,
  hasExistingReview,
  showEmptyPrompt,
  labels,
}: ProductWriteReviewCtaProps) {
  const [open, setOpen] = useState(false);
  const loginHref = `/${locale}/login?next=${encodeURIComponent(`/${locale}/products/${productSlug}`)}`;

  if (hasExistingReview) {
    return null;
  }

  if (canSubmit && isSignedIn) {
    if (open) {
      return (
        <div className="mt-2 w-full">
          <ReviewForm
            locale={locale}
            productId={productId}
            onCancel={() => setOpen(false)}
            labels={{
              title: labels.writeReviewTitle,
              ratingLabel: labels.ratingLabel,
              yourReviewLabel: labels.yourReviewLabel,
              placeholder: labels.reviewPlaceholder,
              submit: labels.submitReview,
              submitting: labels.submittingReview,
              cancel: labels.cancelReview,
              pending: labels.reviewPending,
              saveError: labels.reviewSaveError,
            }}
          />
        </div>
      );
    }

    return (
      <div className="mt-2 flex flex-col items-center gap-6">
        {showEmptyPrompt ? (
          <p className="max-w-xl text-center text-base text-gray-700">
            {labels.emptyPrompt}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={ctaClassName}
        >
          {labels.writeReview}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col items-center gap-6">
      {showEmptyPrompt ? (
        <p className="max-w-xl text-center text-base text-gray-700">
          {labels.emptyPrompt}
        </p>
      ) : null}
      <Link href={loginHref} className={ctaClassName}>
        {labels.writeReview}
      </Link>
      <p className="text-sm text-gray-500">
        <span className="font-medium text-gray-800">{labels.signIn}</span>{" "}
        {labels.signInToReview}
      </p>
    </div>
  );
}
