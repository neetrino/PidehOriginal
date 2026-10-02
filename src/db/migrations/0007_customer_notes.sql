ALTER TABLE "cart_items" ADD COLUMN "customer_note" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "customer_note" text;--> statement-breakpoint
ALTER TABLE "group_order_items" ADD COLUMN "customer_note" text;
