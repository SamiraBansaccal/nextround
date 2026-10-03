CREATE TYPE "public"."contact_kind" AS ENUM('email', 'phone', 'person', 'apply_url');--> statement-breakpoint
CREATE TYPE "public"."document_kind" AS ENUM('cv', 'cover_letter');--> statement-breakpoint
CREATE TYPE "public"."fact_source" AS ENUM('github', 'codewars', 'cv_upload', 'chat', 'manual');--> statement-breakpoint
CREATE TYPE "public"."fact_type" AS ENUM('experience', 'skill', 'project', 'education', 'language', 'achievement');--> statement-breakpoint
CREATE TYPE "public"."interview_mode" AS ENUM('text', 'voice');--> statement-breakpoint
CREATE TYPE "public"."offer_status" AS ENUM('saved', 'applied', 'interview', 'offer', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."question_group" AS ENUM('hr', 'technical', 'gap');--> statement-breakpoint
CREATE TYPE "public"."requirement_category" AS ENUM('tech', 'soft', 'language');--> statement-breakpoint
CREATE TYPE "public"."requirement_kind" AS ENUM('must', 'nice');--> statement-breakpoint
CREATE TYPE "public"."source_site" AS ENUM('indeed', 'actiris', 'forem', 'linkedin', 'company', 'other');--> statement-breakpoint
CREATE TABLE "ai_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"base_url" text NOT NULL,
	"model" text NOT NULL,
	"api_key_encrypted" text,
	"api_key_last4" text,
	"elevenlabs_key_encrypted" text,
	"elevenlabs_key_last4" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"answer" text NOT NULL,
	"feedback" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"offer_id" uuid,
	"kind" "document_kind" NOT NULL,
	"version" integer NOT NULL,
	"sentences" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"offer_id" uuid NOT NULL,
	"mode" "interview_mode" DEFAULT 'text' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offer_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"offer_id" uuid NOT NULL,
	"kind" "contact_kind" NOT NULL,
	"value" text NOT NULL,
	"quote" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"source_url" text,
	"source_site" "source_site" DEFAULT 'other' NOT NULL,
	"title" text,
	"company" text,
	"location" text,
	"contract" text,
	"language" text,
	"raw_text" text NOT NULL,
	"stack" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "offer_status" DEFAULT 'saved' NOT NULL,
	"applied_at" timestamp with time zone,
	"scanned_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_facts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" "fact_type" NOT NULL,
	"text" text NOT NULL,
	"source" "fact_source" NOT NULL,
	"source_ref" text,
	"quote" text,
	"validated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"interview_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"group" "question_group" NOT NULL,
	"text" text NOT NULL,
	"source" text NOT NULL,
	"suggested_answer" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"offer_id" uuid NOT NULL,
	"kind" "requirement_kind" NOT NULL,
	"category" "requirement_category" NOT NULL,
	"text" text NOT NULL,
	"quote" text NOT NULL,
	"fact_ids" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"kind" text NOT NULL,
	"ref" text NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_counters" (
	"user_id" text NOT NULL,
	"day" date NOT NULL,
	"kind" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "usage_counters_user_id_day_kind_pk" PRIMARY KEY("user_id","day","kind")
);
--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_contacts" ADD CONSTRAINT "offer_contacts_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "answers_user_idx" ON "answers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "documents_user_idx" ON "documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "interviews_user_idx" ON "interviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "offer_contacts_user_idx" ON "offer_contacts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "offers_user_idx" ON "offers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "profile_facts_user_idx" ON "profile_facts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "questions_user_idx" ON "questions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "requirements_user_idx" ON "requirements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "requirements_offer_idx" ON "requirements" USING btree ("offer_id");--> statement-breakpoint
CREATE INDEX "sources_user_idx" ON "sources" USING btree ("user_id");