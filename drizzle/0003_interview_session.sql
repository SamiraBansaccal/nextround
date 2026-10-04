ALTER TABLE "interviews" ADD COLUMN "language" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "focus" text DEFAULT 'both' NOT NULL;--> statement-breakpoint
-- Existing interviews keep the language their questions were written in (the offer's language).
UPDATE "interviews" SET "language" = 'fr' FROM "offers" WHERE "offers"."id" = "interviews"."offer_id" AND "offers"."language" ILIKE 'fr%';
