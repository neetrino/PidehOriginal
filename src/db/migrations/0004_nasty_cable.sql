CREATE TYPE "public"."group_order_event_type" AS ENUM('STATUS_CHANGE', 'PARTICIPANT_JOINED', 'PARTICIPANT_REMOVED', 'PARTICIPANT_LEFT', 'ITEMS_CHANGED', 'ITEMS_READY', 'SPEND_LIMIT_CHANGED', 'JOINS_CLOSED', 'PAYMENT_STATUS', 'NOTE', 'ADMIN_ACTION');--> statement-breakpoint
CREATE TYPE "public"."group_order_participant_payment_status" AS ENUM('NOT_REQUIRED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED', 'MARKED_RECEIVED');--> statement-breakpoint
CREATE TYPE "public"."group_order_participant_role" AS ENUM('ORGANIZER', 'PARTICIPANT');--> statement-breakpoint
CREATE TYPE "public"."group_order_participant_status" AS ENUM('ACTIVE', 'REMOVED', 'LEFT');--> statement-breakpoint
CREATE TYPE "public"."group_order_payment_mode" AS ENUM('ORGANIZER_PAYS_ALL', 'SPLIT_PER_PARTICIPANT');--> statement-breakpoint
CREATE TYPE "public"."group_order_status" AS ENUM('OPEN', 'LOCKED', 'AWAITING_PAYMENTS', 'CHECKOUT', 'PAID', 'PREPARING', 'COMPLETED', 'EXPIRED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "group_order_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"group_order_id" uuid NOT NULL,
	"event_type" "group_order_event_type" NOT NULL,
	"from_state" text,
	"to_state" text,
	"actor_user_id" uuid,
	"actor_participant_id" uuid,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_order_item_modifiers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"group_order_item_id" uuid NOT NULL,
	"modifier_id" uuid NOT NULL,
	"kind_snapshot" text NOT NULL,
	"name_snapshot" text NOT NULL,
	"price_amount_snapshot" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_order_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"group_order_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"selection_key" text DEFAULT '' NOT NULL,
	"quantity" integer NOT NULL,
	"unit_amount" integer DEFAULT 0 NOT NULL,
	"line_total_amount" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "group_order_items_qty_chk" CHECK ("group_order_items"."quantity" > 0),
	CONSTRAINT "group_order_items_money_nonneg_chk" CHECK ("group_order_items"."unit_amount" >= 0 AND "group_order_items"."line_total_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "group_order_participants" (
	"id" uuid PRIMARY KEY NOT NULL,
	"group_order_id" uuid NOT NULL,
	"user_id" uuid,
	"guest_token_hash" text,
	"display_name" text NOT NULL,
	"role" "group_order_participant_role" NOT NULL,
	"status" "group_order_participant_status" DEFAULT 'ACTIVE' NOT NULL,
	"payment_status" "group_order_participant_payment_status" DEFAULT 'NOT_REQUIRED' NOT NULL,
	"payment_id" uuid,
	"subtotal_amount" integer DEFAULT 0 NOT NULL,
	"delivery_share_amount" integer DEFAULT 0 NOT NULL,
	"final_amount" integer DEFAULT 0 NOT NULL,
	"items_ready" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "group_order_participants_owner_chk" CHECK ((
        ("group_order_participants"."user_id" IS NOT NULL AND "group_order_participants"."guest_token_hash" IS NULL)
        OR ("group_order_participants"."user_id" IS NULL AND "group_order_participants"."guest_token_hash" IS NOT NULL)
      )),
	CONSTRAINT "group_order_participants_money_nonneg_chk" CHECK ("group_order_participants"."subtotal_amount" >= 0
        AND "group_order_participants"."delivery_share_amount" >= 0
        AND "group_order_participants"."final_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "group_orders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"invite_token" uuid NOT NULL,
	"organizer_user_id" uuid,
	"organizer_guest_token_hash" text,
	"organizer_display_name" text NOT NULL,
	"payment_mode" "group_order_payment_mode" NOT NULL,
	"status" "group_order_status" DEFAULT 'OPEN' NOT NULL,
	"spend_limit_amount" integer,
	"joins_closed" boolean DEFAULT false NOT NULL,
	"delivery_amount" integer DEFAULT 0 NOT NULL,
	"delivery_address" text,
	"delivery_distance_label" text,
	"order_id" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"locked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "group_orders_owner_chk" CHECK ((
        ("group_orders"."organizer_user_id" IS NOT NULL AND "group_orders"."organizer_guest_token_hash" IS NULL)
        OR ("group_orders"."organizer_user_id" IS NULL AND "group_orders"."organizer_guest_token_hash" IS NOT NULL)
      )),
	CONSTRAINT "group_orders_spend_limit_chk" CHECK ("group_orders"."spend_limit_amount" IS NULL OR "group_orders"."spend_limit_amount" > 0),
	CONSTRAINT "group_orders_delivery_nonneg_chk" CHECK ("group_orders"."delivery_amount" >= 0)
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "group_order_participant_id" uuid;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "participant_name_snapshot" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "group_order_id" uuid;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "group_order_participant_id" uuid;--> statement-breakpoint
ALTER TABLE "group_order_events" ADD CONSTRAINT "group_order_events_group_order_id_group_orders_id_fk" FOREIGN KEY ("group_order_id") REFERENCES "public"."group_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_order_events" ADD CONSTRAINT "group_order_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_order_events" ADD CONSTRAINT "group_order_events_actor_participant_id_group_order_participants_id_fk" FOREIGN KEY ("actor_participant_id") REFERENCES "public"."group_order_participants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_order_item_modifiers" ADD CONSTRAINT "group_order_item_modifiers_group_order_item_id_group_order_items_id_fk" FOREIGN KEY ("group_order_item_id") REFERENCES "public"."group_order_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_order_items" ADD CONSTRAINT "group_order_items_group_order_id_group_orders_id_fk" FOREIGN KEY ("group_order_id") REFERENCES "public"."group_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_order_items" ADD CONSTRAINT "group_order_items_participant_id_group_order_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."group_order_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_order_items" ADD CONSTRAINT "group_order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_order_participants" ADD CONSTRAINT "group_order_participants_group_order_id_group_orders_id_fk" FOREIGN KEY ("group_order_id") REFERENCES "public"."group_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_order_participants" ADD CONSTRAINT "group_order_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_orders" ADD CONSTRAINT "group_orders_organizer_user_id_users_id_fk" FOREIGN KEY ("organizer_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_orders" ADD CONSTRAINT "group_orders_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "group_order_events_order_created_idx" ON "group_order_events" USING btree ("group_order_id","created_at");--> statement-breakpoint
CREATE INDEX "group_order_events_type_idx" ON "group_order_events" USING btree ("event_type");--> statement-breakpoint
CREATE UNIQUE INDEX "group_order_item_modifiers_uidx" ON "group_order_item_modifiers" USING btree ("group_order_item_id","modifier_id");--> statement-breakpoint
CREATE INDEX "group_order_item_modifiers_item_idx" ON "group_order_item_modifiers" USING btree ("group_order_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "group_order_items_participant_product_selection_uidx" ON "group_order_items" USING btree ("participant_id","product_id","selection_key");--> statement-breakpoint
CREATE INDEX "group_order_items_order_idx" ON "group_order_items" USING btree ("group_order_id");--> statement-breakpoint
CREATE INDEX "group_order_items_participant_idx" ON "group_order_items" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "group_order_participants_order_idx" ON "group_order_participants" USING btree ("group_order_id");--> statement-breakpoint
CREATE INDEX "group_order_participants_user_idx" ON "group_order_participants" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "group_order_participants_active_user_uidx" ON "group_order_participants" USING btree ("group_order_id","user_id") WHERE "group_order_participants"."status" = 'ACTIVE' AND "group_order_participants"."user_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "group_order_participants_active_guest_uidx" ON "group_order_participants" USING btree ("group_order_id","guest_token_hash") WHERE "group_order_participants"."status" = 'ACTIVE' AND "group_order_participants"."guest_token_hash" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "group_orders_invite_token_uidx" ON "group_orders" USING btree ("invite_token");--> statement-breakpoint
CREATE INDEX "group_orders_status_created_idx" ON "group_orders" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "group_orders_organizer_user_idx" ON "group_orders" USING btree ("organizer_user_id");--> statement-breakpoint
CREATE INDEX "group_orders_order_idx" ON "group_orders" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_group_participant_idx" ON "order_items" USING btree ("group_order_participant_id");--> statement-breakpoint
CREATE INDEX "payments_group_participant_idx" ON "payments" USING btree ("group_order_participant_id");