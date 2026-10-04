ALTER TABLE "interviews" ADD COLUMN "interviewer_id" text DEFAULT 'marie' NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "type" text;