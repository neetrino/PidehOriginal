ALTER TABLE "orders" ADD COLUMN "customer_review_rating" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_review_comment" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_review_rating_chk" CHECK ("customer_review_rating" IS NULL OR ("customer_review_rating" BETWEEN 1 AND 5));
