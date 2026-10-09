ALTER TABLE "products" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "products_status_sort_idx" ON "products" USING btree ("status","sort_order");--> statement-breakpoint
WITH ranked AS (
  SELECT "id", row_number() OVER (ORDER BY "created_at" DESC, "id" DESC) AS rn
  FROM "products"
)
UPDATE "products" AS p
SET "sort_order" = ranked.rn
FROM ranked
WHERE p."id" = ranked."id";
