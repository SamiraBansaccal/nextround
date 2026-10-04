ALTER TABLE "documents" ADD COLUMN "language" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "content" jsonb;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "kept" boolean DEFAULT false NOT NULL;