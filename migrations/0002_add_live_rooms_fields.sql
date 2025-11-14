
-- Add missing columns to live_rooms table
ALTER TABLE "bustan"."live_rooms" ADD COLUMN IF NOT EXISTS "password" varchar;
ALTER TABLE "bustan"."live_rooms" ADD COLUMN IF NOT EXISTS "allowed_student_ids" varchar[];
ALTER TABLE "bustan"."live_rooms" ADD COLUMN IF NOT EXISTS "entry_access_window_minutes" integer DEFAULT 15;
ALTER TABLE "bustan"."live_rooms" ADD COLUMN IF NOT EXISTS "cancellation_reason" text;
ALTER TABLE "bustan"."live_rooms" ADD COLUMN IF NOT EXISTS "cancelled_by" varchar;
ALTER TABLE "bustan"."live_rooms" ADD COLUMN IF NOT EXISTS "cancelled_at" timestamp;

-- Add foreign key constraint for cancelled_by
ALTER TABLE "bustan"."live_rooms" ADD CONSTRAINT "live_rooms_cancelled_by_users_id_fk" 
FOREIGN KEY ("cancelled_by") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;
