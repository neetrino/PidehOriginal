CREATE TYPE "public"."bonus_transaction_type" AS ENUM('EARN', 'REDEEM', 'REVERSAL_EARN', 'REVERSAL_REDEEM', 'EXPIRE');--> statement-breakpoint
CREATE TYPE "public"."gift_card_status" AS ENUM('PENDING_PAYMENT', 'ACTIVE', 'USED', 'EXPIRED', 'DISABLED');--> statement-breakpoint
CREATE TYPE "public"."gift_card_transaction_type" AS ENUM('ISSUE', 'REDEEM', 'REVERSAL', 'ADJUST');--> statement-breakpoint
CREATE TABLE "bonus_transactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" uuid,
	"type" "bonus_transaction_type" NOT NULL,
	"delta" integer NOT NULL,
	"resulting_balance" integer NOT NULL,
	"expires_at" timestamp with time zone,
	"actor_user_id" uuid,
	"correlation_id" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bonus_transactions_resulting_nonneg_chk" CHECK ("bonus_transactions"."resulting_balance" >= 0),
	CONSTRAINT "bonus_transactions_delta_nonzero_chk" CHECK ("bonus_transactions"."delta" <> 0)
);
--> statement-breakpoint
CREATE TABLE "gift_cards" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"initial_amount" integer NOT NULL,
	"balance_amount" integer NOT NULL,
	"currency" text DEFAULT 'AMD' NOT NULL,
	"status" "gift_card_status" DEFAULT 'PENDING_PAYMENT' NOT NULL,
	"purchaser_user_id" uuid,
	"recipient_user_id" uuid,
	"purchaser_name" text NOT NULL,
	"purchaser_email" text,
	"recipient_name" text NOT NULL,
	"recipient_email" text NOT NULL,
	"recipient_phone" text,
	"message" text,
	"payment_method" text,
	"scheduled_send_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"activated_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_by_user_id" uuid,
	"disabled_at" timestamp with time zone,
	"disabled_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gift_cards_initial_positive_chk" CHECK ("gift_cards"."initial_amount" > 0),
	CONSTRAINT "gift_cards_balance_nonneg_chk" CHECK ("gift_cards"."balance_amount" >= 0),
	CONSTRAINT "gift_cards_balance_lte_initial_chk" CHECK ("gift_cards"."balance_amount" <= "gift_cards"."initial_amount")
);
--> statement-breakpoint
CREATE TABLE "gift_card_transactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"gift_card_id" uuid NOT NULL,
	"order_id" uuid,
	"type" "gift_card_transaction_type" NOT NULL,
	"delta" integer NOT NULL,
	"resulting_balance" integer NOT NULL,
	"actor_user_id" uuid,
	"correlation_id" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gift_card_transactions_resulting_nonneg_chk" CHECK ("gift_card_transactions"."resulting_balance" >= 0),
	CONSTRAINT "gift_card_transactions_delta_nonzero_chk" CHECK ("gift_card_transactions"."delta" <> 0)
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "bonus_redeemed_amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "bonus_earned_amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "gift_card_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "gift_card_code_snapshot" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "gift_card_amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bonus_balance" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "bonus_transactions" ADD CONSTRAINT "bonus_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bonus_transactions" ADD CONSTRAINT "bonus_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bonus_transactions" ADD CONSTRAINT "bonus_transactions_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_card_transactions" ADD CONSTRAINT "gift_card_transactions_gift_card_id_gift_cards_id_fk" FOREIGN KEY ("gift_card_id") REFERENCES "public"."gift_cards"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_card_transactions" ADD CONSTRAINT "gift_card_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_card_transactions" ADD CONSTRAINT "gift_card_transactions_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_purchaser_user_id_users_id_fk" FOREIGN KEY ("purchaser_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_recipient_user_id_users_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bonus_transactions_user_created_idx" ON "bonus_transactions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "bonus_transactions_order_idx" ON "bonus_transactions" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bonus_transactions_order_type_user_uidx" ON "bonus_transactions" USING btree ("order_id","type","user_id") WHERE "bonus_transactions"."order_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "gift_card_transactions_card_created_idx" ON "gift_card_transactions" USING btree ("gift_card_id","created_at");--> statement-breakpoint
CREATE INDEX "gift_card_transactions_order_idx" ON "gift_card_transactions" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "gift_card_transactions_order_redeem_uidx" ON "gift_card_transactions" USING btree ("order_id") WHERE "gift_card_transactions"."order_id" IS NOT NULL AND "gift_card_transactions"."type" = 'REDEEM';--> statement-breakpoint
CREATE UNIQUE INDEX "gift_cards_code_uidx" ON "gift_cards" USING btree ("code");--> statement-breakpoint
CREATE INDEX "gift_cards_status_created_idx" ON "gift_cards" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "gift_cards_purchaser_idx" ON "gift_cards" USING btree ("purchaser_user_id");--> statement-breakpoint
CREATE INDEX "gift_cards_recipient_user_idx" ON "gift_cards" USING btree ("recipient_user_id");--> statement-breakpoint
CREATE INDEX "gift_cards_recipient_email_idx" ON "gift_cards" USING btree ("recipient_email");--> statement-breakpoint
CREATE INDEX "gift_cards_expires_idx" ON "gift_cards" USING btree ("expires_at");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_bonus_redeemed_nonneg_chk" CHECK ("orders"."bonus_redeemed_amount" >= 0);--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_bonus_earned_nonneg_chk" CHECK ("orders"."bonus_earned_amount" >= 0);--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_gift_card_amount_nonneg_chk" CHECK ("orders"."gift_card_amount" >= 0);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_bonus_balance_nonneg_chk" CHECK ("users"."bonus_balance" >= 0);
