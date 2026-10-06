import 'server-only';

import { and, count, desc, eq, inArray, isNotNull, max, sql, sum } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { orderItems, orders, reviews, users } from '@/db/schema';

export type ReviewSourceStats = {
  productId: string;
  reviewCount: number;
  ratingSum: number;
  pendingCount: number;
  lastReviewAt: Date | null;
};

export type AdminReviewSource = 'PRODUCT' | 'ORDER';

export type AdminProductReview = {
  id: string;
  source: AdminReviewSource;
  rating: number;
  comment: string | null;
  /** Only product reviews are moderated; null for order reviews. */
  moderationStatus: string | null;
  isVerifiedPurchase: boolean;
  orderNumber: string | null;
  createdAt: Date;
  authorName: string;
  authorEmail: string;
};

/** Per-product aggregates of reviews submitted from the product page. */
export async function loadProductReviewStats(): Promise<ReviewSourceStats[]> {
  return getDb()
    .select({
      productId: reviews.productId,
      reviewCount: count(reviews.id),
      ratingSum: sum(reviews.rating).mapWith(Number),
      pendingCount:
        sql<number>`count(*) filter (where ${reviews.moderationStatus} = 'PENDING')`.mapWith(Number),
      lastReviewAt: max(reviews.createdAt),
    })
    .from(reviews)
    .groupBy(reviews.productId);
}

/** Per-product aggregates of order reviews, attributed to every product in the reviewed order. */
export async function loadOrderReviewStats(): Promise<ReviewSourceStats[]> {
  const db = getDb();
  const pairs = db
    .selectDistinct({
      productId: orderItems.productId,
      orderId: orders.id,
      rating: orders.customerReviewRating,
      reviewedAt: orders.customerReviewedAt,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(isNotNull(orders.customerReviewRating), isNotNull(orderItems.productId)))
    .as('order_review_pairs');

  const rows = await db
    .select({
      productId: pairs.productId,
      reviewCount: count(),
      ratingSum: sum(pairs.rating).mapWith(Number),
      lastReviewAt: max(pairs.reviewedAt),
    })
    .from(pairs)
    .groupBy(pairs.productId);

  return rows.flatMap((row) =>
    row.productId ? [{ ...row, productId: row.productId, pendingCount: 0 }] : [],
  );
}

/** Product-page reviews for one product, any moderation status. */
export async function loadProductReviews(productId: string): Promise<AdminProductReview[]> {
  const rows = await getDb()
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      moderationStatus: reviews.moderationStatus,
      orderItemId: reviews.orderItemId,
      createdAt: reviews.createdAt,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));

  return rows.map((row) => ({
    id: row.id,
    source: 'PRODUCT',
    rating: row.rating,
    comment: row.comment,
    moderationStatus: row.moderationStatus,
    isVerifiedPurchase: row.orderItemId !== null,
    orderNumber: null,
    createdAt: row.createdAt,
    authorName: `${row.firstName} ${row.lastName}`.trim(),
    authorEmail: row.email,
  }));
}

/** Order reviews for orders that contain the given product. */
export async function loadOrderReviewsForProduct(productId: string): Promise<AdminProductReview[]> {
  const db = getDb();
  const orderIdsWithProduct = db
    .select({ orderId: orderItems.orderId })
    .from(orderItems)
    .where(eq(orderItems.productId, productId));

  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      rating: orders.customerReviewRating,
      comment: orders.customerReviewComment,
      reviewedAt: orders.customerReviewedAt,
      contactName: orders.contactName,
      contactEmail: orders.contactEmail,
    })
    .from(orders)
    .where(and(isNotNull(orders.customerReviewRating), inArray(orders.id, orderIdsWithProduct)));

  return rows.flatMap((row) =>
    row.rating === null
      ? []
      : [
          {
            id: row.id,
            source: 'ORDER' as const,
            rating: row.rating,
            comment: row.comment,
            moderationStatus: null,
            isVerifiedPurchase: true,
            orderNumber: row.orderNumber,
            createdAt: row.reviewedAt ?? new Date(0),
            authorName: row.contactName,
            authorEmail: row.contactEmail,
          },
        ],
  );
}
