-- Formation Share v1: custom role names + libero preference only.
-- Does not store court layouts / coordinates.
-- Idempotent: safe if the table or FK already exists.
CREATE TABLE IF NOT EXISTS "formation_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"owner_user_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone DEFAULT (now() + interval '30 days') NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'formation_shares_token_unique'
	) THEN
		ALTER TABLE "formation_shares"
			ADD CONSTRAINT "formation_shares_token_unique" UNIQUE ("token");
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'formation_shares_owner_user_id_app_users_id_fk'
	) THEN
		ALTER TABLE "formation_shares"
			ADD CONSTRAINT "formation_shares_owner_user_id_app_users_id_fk"
			FOREIGN KEY ("owner_user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;
