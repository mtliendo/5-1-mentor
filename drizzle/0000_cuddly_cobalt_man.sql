-- Baseline matching existing Neon tables (app_users, user_preferences, user_progress).
-- Idempotent: safe if those tables/FKs already exist.
CREATE TABLE IF NOT EXISTS "app_users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"libero_enabled" boolean DEFAULT true NOT NULL,
	"role_names" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_progress" (
	"user_id" text PRIMARY KEY NOT NULL,
	"completed" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_rotation" smallint DEFAULT 1 NOT NULL,
	"last_mode" text DEFAULT 'serve' NOT NULL,
	"last_alternate" text,
	"last_step" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_progress_last_rotation_check" CHECK ("user_progress"."last_rotation" >= 1 AND "user_progress"."last_rotation" <= 6),
	CONSTRAINT "user_progress_last_mode_check" CHECK ("user_progress"."last_mode" in ('serve', 'serve-receive'))
);
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint c
		JOIN pg_class t ON t.oid = c.conrelid
		JOIN pg_namespace n ON n.oid = t.relnamespace
		WHERE n.nspname = 'public'
			AND t.relname = 'user_preferences'
			AND c.contype = 'f'
	) THEN
		ALTER TABLE "user_preferences"
			ADD CONSTRAINT "user_preferences_user_id_app_users_id_fk"
			FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint c
		JOIN pg_class t ON t.oid = c.conrelid
		JOIN pg_namespace n ON n.oid = t.relnamespace
		WHERE n.nspname = 'public'
			AND t.relname = 'user_progress'
			AND c.contype = 'f'
	) THEN
		ALTER TABLE "user_progress"
			ADD CONSTRAINT "user_progress_user_id_app_users_id_fk"
			FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;
