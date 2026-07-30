CREATE TYPE "public"."product_modifier_kind" AS ENUM('ADDITION', 'EXCEPTION');--> statement-breakpoint
CREATE TABLE "cart_item_modifiers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"cart_item_id" uuid NOT NULL,
	"modifier_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_item_modifiers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"order_item_id" uuid NOT NULL,
	"modifier_id" uuid,
	"kind" "product_modifier_kind" NOT NULL,
	"name_snapshot" text NOT NULL,
	"unit_price_amount" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_item_modifiers_price_chk" CHECK ("order_item_modifiers"."unit_price_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "product_modifier_links" (
	"id" uuid PRIMARY KEY NOT NULL,
	"product_id" uuid NOT NULL,
	"modifier_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_modifiers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"kind" "product_modifier_kind" NOT NULL,
	"name" text NOT NULL,
	"price_amount" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_modifiers_price_chk" CHECK ((
        ("product_modifiers"."kind" = 'ADDITION' AND "product_modifiers"."price_amount" >= 0)
        OR ("product_modifiers"."kind" = 'EXCEPTION' AND "product_modifiers"."price_amount" = 0)
      ))
);
--> statement-breakpoint
DROP INDEX "cart_items_cart_product_uidx";--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "selection_key" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_item_modifiers" ADD CONSTRAINT "cart_item_modifiers_cart_item_id_cart_items_id_fk" FOREIGN KEY ("cart_item_id") REFERENCES "public"."cart_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item_modifiers" ADD CONSTRAINT "cart_item_modifiers_modifier_id_product_modifiers_id_fk" FOREIGN KEY ("modifier_id") REFERENCES "public"."product_modifiers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item_modifiers" ADD CONSTRAINT "order_item_modifiers_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item_modifiers" ADD CONSTRAINT "order_item_modifiers_modifier_id_product_modifiers_id_fk" FOREIGN KEY ("modifier_id") REFERENCES "public"."product_modifiers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_modifier_links" ADD CONSTRAINT "product_modifier_links_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_modifier_links" ADD CONSTRAINT "product_modifier_links_modifier_id_product_modifiers_id_fk" FOREIGN KEY ("modifier_id") REFERENCES "public"."product_modifiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cart_item_modifiers_uidx" ON "cart_item_modifiers" USING btree ("cart_item_id","modifier_id");--> statement-breakpoint
CREATE INDEX "cart_item_modifiers_modifier_idx" ON "cart_item_modifiers" USING btree ("modifier_id");--> statement-breakpoint
CREATE INDEX "order_item_modifiers_order_item_idx" ON "order_item_modifiers" USING btree ("order_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_modifier_links_uidx" ON "product_modifier_links" USING btree ("product_id","modifier_id");--> statement-breakpoint
CREATE INDEX "product_modifier_links_modifier_idx" ON "product_modifier_links" USING btree ("modifier_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_modifiers_kind_name_uidx" ON "product_modifiers" USING btree ("kind","name");--> statement-breakpoint
CREATE INDEX "product_modifiers_kind_active_idx" ON "product_modifiers" USING btree ("kind","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_cart_product_selection_uidx" ON "cart_items" USING btree ("cart_id","product_id","selection_key");