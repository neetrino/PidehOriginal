ALTER TABLE "products" ALTER COLUMN "stock_on_hand" SET DEFAULT 100000;--> statement-breakpoint
UPDATE "products" SET "stock_on_hand" = 100000 WHERE "stock_on_hand" < 100000;
