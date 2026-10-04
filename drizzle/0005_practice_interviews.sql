ALTER TABLE "interviews" ALTER COLUMN "offer_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "kind" text DEFAULT 'offer' NOT NULL;--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "topic" text;--> statement-breakpoint
ALTER TABLE "profile_facts" ADD COLUMN "ai_assisted" boolean DEFAULT false NOT NULL;