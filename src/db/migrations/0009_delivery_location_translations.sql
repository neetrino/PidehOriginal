ALTER TABLE "delivery_rules" ADD COLUMN "translations" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
UPDATE "delivery_rules"
SET "translations" = jsonb_build_object(
  'hy', jsonb_build_object(
    'city', COALESCE(NULLIF(TRIM("city"), ''), ''),
    'area', COALESCE(NULLIF(TRIM("region"), ''), '')
  ),
  'en', jsonb_build_object(
    'city', COALESCE(NULLIF(TRIM("city"), ''), ''),
    'area', COALESCE(NULLIF(TRIM("region"), ''), '')
  ),
  'ru', jsonb_build_object(
    'city', COALESCE(NULLIF(TRIM("city"), ''), ''),
    'area', COALESCE(NULLIF(TRIM("region"), ''), '')
  )
)
WHERE "translations" = '{}'::jsonb;
