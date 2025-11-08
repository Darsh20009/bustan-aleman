CREATE TABLE "bustan"."certificates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"course_id" varchar,
	"exam_attempt_id" varchar,
	"title_ar" varchar NOT NULL,
	"title_en" varchar,
	"description_ar" text,
	"description_en" text,
	"issued_at" timestamp DEFAULT now(),
	"issued_by" varchar,
	"code" varchar DEFAULT gen_random_uuid() NOT NULL,
	"certificate_number" varchar DEFAULT gen_random_uuid() NOT NULL,
	"grade" varchar,
	"score" integer,
	"teacher_name" varchar,
	"qr_image_data_url" text,
	"verification_token" varchar DEFAULT gen_random_uuid() NOT NULL,
	"status" varchar DEFAULT 'valid',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "certificates_code_unique" UNIQUE("code"),
	CONSTRAINT "certificates_certificate_number_unique" UNIQUE("certificate_number"),
	CONSTRAINT "certificates_verification_token_unique" UNIQUE("verification_token")
);
--> statement-breakpoint
CREATE TABLE "bustan"."class_schedules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" varchar NOT NULL,
	"end_time" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."contact_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"subject" varchar NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."course_enrollments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"course_id" varchar NOT NULL,
	"enrollment_date" timestamp DEFAULT now(),
	"status" varchar DEFAULT 'enrolled',
	"progress" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."course_modules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar NOT NULL,
	"title_ar" varchar NOT NULL,
	"title_en" varchar,
	"description_ar" text,
	"description_en" text,
	"content_ar" text,
	"content_en" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"video_url" varchar,
	"document_url" varchar,
	"duration" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."courses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_ar" varchar NOT NULL,
	"title_en" varchar,
	"description_ar" text,
	"description_en" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"instructor_id" varchar,
	"level" varchar NOT NULL,
	"category" varchar NOT NULL,
	"max_students" integer DEFAULT 50,
	"current_students" integer DEFAULT 0,
	"price" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."daily_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"assignment_date" date NOT NULL,
	"memorization" text,
	"review" text,
	"mistakes" text,
	"notes" text,
	"assigned_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."exam_attempts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"course_id" varchar NOT NULL,
	"answers" text NOT NULL,
	"score" integer NOT NULL,
	"total_points" integer NOT NULL,
	"percentage" numeric(5, 2) NOT NULL,
	"passed" boolean DEFAULT false NOT NULL,
	"start_time" timestamp NOT NULL,
	"submit_time" timestamp NOT NULL,
	"time_taken" integer,
	"certificate_issued" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."exam_questions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar NOT NULL,
	"question_ar" text NOT NULL,
	"question_en" text,
	"options_ar" text NOT NULL,
	"options_en" text,
	"correct_answer" integer NOT NULL,
	"explanation" text,
	"points" integer DEFAULT 1,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."instructors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_ar" varchar NOT NULL,
	"name_en" varchar,
	"title_ar" varchar,
	"title_en" varchar,
	"bio_ar" text,
	"bio_en" text,
	"profile_image_url" varchar,
	"qualifications" text,
	"experience" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."live_annotations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" varchar NOT NULL,
	"sheikh_id" varchar NOT NULL,
	"student_id" varchar NOT NULL,
	"surah_number" integer NOT NULL,
	"ayah_number" integer NOT NULL,
	"word_index" integer,
	"annotation_type" varchar NOT NULL,
	"highlight_color" varchar,
	"note_text" text,
	"is_permanent" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."live_rooms" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"sheikh_id" varchar NOT NULL,
	"session_date" timestamp NOT NULL,
	"session_time" varchar NOT NULL,
	"room_token" varchar DEFAULT gen_random_uuid() NOT NULL,
	"status" varchar DEFAULT 'scheduled',
	"started_at" timestamp,
	"ended_at" timestamp,
	"duration" integer,
	"is_enabled" boolean DEFAULT false,
	"enabled_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "live_rooms_room_token_unique" UNIQUE("room_token")
);
--> statement-breakpoint
CREATE TABLE "bustan"."messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_id" varchar NOT NULL,
	"receiver_id" varchar,
	"content" text NOT NULL,
	"message_type" varchar DEFAULT 'text',
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"is_group_message" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."quiz_attempts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" varchar NOT NULL,
	"student_id" varchar NOT NULL,
	"score" integer NOT NULL,
	"answers" text,
	"passed" boolean DEFAULT false,
	"attempt_date" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"anti_cheat_log" text
);
--> statement-breakpoint
CREATE TABLE "bustan"."quizzes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar NOT NULL,
	"title_ar" varchar NOT NULL,
	"title_en" varchar,
	"passing_score" integer DEFAULT 75,
	"time_limit" integer,
	"questions" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."quran_ayah_markers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"surah_number" integer NOT NULL,
	"ayah_number" integer NOT NULL,
	"marker_type" varchar NOT NULL,
	"marker_color" varchar DEFAULT 'blue',
	"is_active" boolean DEFAULT true,
	"priority" integer DEFAULT 0,
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "quran_ayah_markers_unique" UNIQUE("student_id","surah_number","ayah_number","marker_type")
);
--> statement-breakpoint
CREATE TABLE "bustan"."quran_memorization" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"surah_number" integer NOT NULL,
	"from_ayah" integer NOT NULL,
	"to_ayah" integer NOT NULL,
	"status" varchar DEFAULT 'in_progress',
	"mastery_level" integer DEFAULT 0,
	"last_reviewed" timestamp,
	"next_review_date" timestamp,
	"review_count" integer DEFAULT 0,
	"last_difficulty" varchar,
	"mistakes" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."quran_notes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"sheikh_id" varchar,
	"surah_number" integer NOT NULL,
	"ayah_number" integer NOT NULL,
	"note" text,
	"note_text" text,
	"note_type" varchar DEFAULT 'student',
	"tags" text,
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."quran_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"last_surah" integer DEFAULT 1,
	"last_ayah" integer DEFAULT 1,
	"bookmarked_verses" text,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "quran_progress_student_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "bustan"."quran_reading_stats" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"reading_date" date NOT NULL,
	"ayahs_read" integer DEFAULT 0,
	"pages_read" integer DEFAULT 0,
	"minutes_spent" integer DEFAULT 0,
	"surahs_completed" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "quran_reading_stats_student_date_unique" UNIQUE("student_id","reading_date")
);
--> statement-breakpoint
CREATE TABLE "bustan"."quran_recitation_attempts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"surah_number" integer NOT NULL,
	"from_ayah" integer NOT NULL,
	"to_ayah" integer NOT NULL,
	"attempt_date" timestamp DEFAULT now(),
	"total_ayahs" integer NOT NULL,
	"correct_ayahs" integer DEFAULT 0,
	"mistakes" text,
	"score" integer,
	"duration" integer,
	"is_completed" boolean DEFAULT false,
	"mode" varchar DEFAULT 'practice',
	"feedback" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."quran_word_highlights" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"surah_number" integer NOT NULL,
	"ayah_number" integer NOT NULL,
	"word_index" integer NOT NULL,
	"word_text" varchar NOT NULL,
	"highlight_color" varchar DEFAULT 'red',
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."room_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar NOT NULL,
	"joined_at" timestamp DEFAULT now(),
	"left_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."session_access" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"schedule_id" varchar NOT NULL,
	"session_date" date NOT NULL,
	"start_time" varchar NOT NULL,
	"end_time" varchar NOT NULL,
	"zoom_link" varchar NOT NULL,
	"is_enabled" boolean DEFAULT false,
	"enabled_by" varchar,
	"enabled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "bustan"."session_access_control" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"session_date" date NOT NULL,
	"session_time" varchar NOT NULL,
	"is_enabled" boolean DEFAULT false,
	"enabled_at" timestamp,
	"enabled_by" varchar,
	"expires_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bustan"."student_errors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"sheikh_id" varchar,
	"surah_number" integer NOT NULL,
	"surah_name" varchar NOT NULL,
	"ayah_number" integer NOT NULL,
	"word_index" integer,
	"error_type" varchar DEFAULT 'recitation',
	"error_description" text,
	"sheikh_note" text,
	"severity" varchar DEFAULT 'medium',
	"is_resolved" boolean DEFAULT false,
	"resolved_date" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."student_notes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"author_id" varchar NOT NULL,
	"note" text NOT NULL,
	"note_type" varchar DEFAULT 'general',
	"is_private" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."student_payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar DEFAULT 'SAR',
	"payment_date" timestamp DEFAULT now(),
	"payment_method" varchar DEFAULT 'whatsapp',
	"subscription_period" varchar DEFAULT 'monthly',
	"sessions_included" integer NOT NULL,
	"sessions_remaining" integer NOT NULL,
	"expiry_date" date,
	"status" varchar DEFAULT 'active',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."student_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"session_number" integer NOT NULL,
	"session_date" date NOT NULL,
	"session_time" varchar,
	"evaluation_grade" varchar,
	"next_session_date" date,
	"new_material" text,
	"review_material" text,
	"notes" text,
	"attended" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."students" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"student_name" varchar NOT NULL,
	"password_hash" varchar NOT NULL,
	"phone_number" varchar,
	"date_of_birth" date,
	"grade" varchar,
	"monthly_sessions_count" integer DEFAULT 0,
	"monthly_price" numeric(10, 2) DEFAULT '0',
	"is_paid" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"memorized_surahs" text,
	"current_level" varchar DEFAULT 'beginner',
	"notes" text,
	"whatsapp_contact" varchar DEFAULT '+966532441566',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."supervisors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"name" varchar NOT NULL,
	"whatsapp_number" varchar NOT NULL,
	"zoom_link" varchar,
	"specialization" varchar,
	"experience" text,
	"qualifications" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."trip_enrollments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"trip_id" varchar NOT NULL,
	"enrollment_date" timestamp DEFAULT now(),
	"status" varchar DEFAULT 'enrolled',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "trip_enrollments_user_trip_unique" UNIQUE("user_id","trip_id")
);
--> statement-breakpoint
CREATE TABLE "bustan"."trips" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_ar" varchar NOT NULL,
	"title_en" varchar,
	"description_ar" text,
	"description_en" text,
	"trip_date" date NOT NULL,
	"location" varchar NOT NULL,
	"capacity" integer DEFAULT 50,
	"current_enrollments" integer DEFAULT 0,
	"price" integer DEFAULT 0,
	"image_url" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bustan"."users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" varchar DEFAULT 'student',
	"password_hash" varchar,
	"phone_number" varchar,
	"age" integer,
	"education_level" varchar,
	"quran_experience" varchar,
	"learning_goals" text,
	"preferred_time" varchar,
	"whatsapp_number" varchar,
	"is_active" boolean DEFAULT true,
	"registration_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bustan"."certificates" ADD CONSTRAINT "certificates_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."certificates" ADD CONSTRAINT "certificates_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "bustan"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."certificates" ADD CONSTRAINT "certificates_exam_attempt_id_exam_attempts_id_fk" FOREIGN KEY ("exam_attempt_id") REFERENCES "bustan"."exam_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."certificates" ADD CONSTRAINT "certificates_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."class_schedules" ADD CONSTRAINT "class_schedules_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."course_enrollments" ADD CONSTRAINT "course_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "bustan"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."course_modules" ADD CONSTRAINT "course_modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "bustan"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."courses" ADD CONSTRAINT "courses_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "bustan"."instructors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."daily_assignments" ADD CONSTRAINT "daily_assignments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."daily_assignments" ADD CONSTRAINT "daily_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."exam_attempts" ADD CONSTRAINT "exam_attempts_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."exam_attempts" ADD CONSTRAINT "exam_attempts_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "bustan"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."exam_questions" ADD CONSTRAINT "exam_questions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "bustan"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."live_annotations" ADD CONSTRAINT "live_annotations_room_id_live_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "bustan"."live_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."live_annotations" ADD CONSTRAINT "live_annotations_sheikh_id_users_id_fk" FOREIGN KEY ("sheikh_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."live_annotations" ADD CONSTRAINT "live_annotations_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."live_rooms" ADD CONSTRAINT "live_rooms_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."live_rooms" ADD CONSTRAINT "live_rooms_sheikh_id_users_id_fk" FOREIGN KEY ("sheikh_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "bustan"."quizzes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."quizzes" ADD CONSTRAINT "quizzes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "bustan"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."quran_ayah_markers" ADD CONSTRAINT "quran_ayah_markers_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."quran_memorization" ADD CONSTRAINT "quran_memorization_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."quran_notes" ADD CONSTRAINT "quran_notes_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."quran_notes" ADD CONSTRAINT "quran_notes_sheikh_id_users_id_fk" FOREIGN KEY ("sheikh_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."quran_progress" ADD CONSTRAINT "quran_progress_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."quran_reading_stats" ADD CONSTRAINT "quran_reading_stats_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."quran_recitation_attempts" ADD CONSTRAINT "quran_recitation_attempts_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."quran_word_highlights" ADD CONSTRAINT "quran_word_highlights_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."room_participants" ADD CONSTRAINT "room_participants_room_id_live_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "bustan"."live_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."room_participants" ADD CONSTRAINT "room_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."session_access" ADD CONSTRAINT "session_access_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."session_access" ADD CONSTRAINT "session_access_schedule_id_class_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "bustan"."class_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."session_access" ADD CONSTRAINT "session_access_enabled_by_users_id_fk" FOREIGN KEY ("enabled_by") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."session_access_control" ADD CONSTRAINT "session_access_control_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."session_access_control" ADD CONSTRAINT "session_access_control_enabled_by_users_id_fk" FOREIGN KEY ("enabled_by") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."student_errors" ADD CONSTRAINT "student_errors_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."student_errors" ADD CONSTRAINT "student_errors_sheikh_id_users_id_fk" FOREIGN KEY ("sheikh_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."student_notes" ADD CONSTRAINT "student_notes_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."student_notes" ADD CONSTRAINT "student_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."student_payments" ADD CONSTRAINT "student_payments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."student_sessions" ADD CONSTRAINT "student_sessions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "bustan"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."supervisors" ADD CONSTRAINT "supervisors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."trip_enrollments" ADD CONSTRAINT "trip_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "bustan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bustan"."trip_enrollments" ADD CONSTRAINT "trip_enrollments_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "bustan"."trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "certificates_code_idx" ON "bustan"."certificates" USING btree ("code");--> statement-breakpoint
CREATE INDEX "certificates_verification_token_idx" ON "bustan"."certificates" USING btree ("verification_token");--> statement-breakpoint
CREATE INDEX "certificates_number_idx" ON "bustan"."certificates" USING btree ("certificate_number");--> statement-breakpoint
CREATE INDEX "live_annotations_room_idx" ON "bustan"."live_annotations" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "live_annotations_student_idx" ON "bustan"."live_annotations" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "live_annotations_surah_ayah_idx" ON "bustan"."live_annotations" USING btree ("surah_number","ayah_number");--> statement-breakpoint
CREATE INDEX "live_rooms_student_idx" ON "bustan"."live_rooms" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "live_rooms_sheikh_idx" ON "bustan"."live_rooms" USING btree ("sheikh_id");--> statement-breakpoint
CREATE INDEX "live_rooms_token_idx" ON "bustan"."live_rooms" USING btree ("room_token");--> statement-breakpoint
CREATE INDEX "quran_ayah_markers_student_idx" ON "bustan"."quran_ayah_markers" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "quran_ayah_markers_surah_ayah_idx" ON "bustan"."quran_ayah_markers" USING btree ("surah_number","ayah_number");--> statement-breakpoint
CREATE INDEX "quran_notes_student_idx" ON "bustan"."quran_notes" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "quran_notes_sheikh_idx" ON "bustan"."quran_notes" USING btree ("sheikh_id");--> statement-breakpoint
CREATE INDEX "quran_notes_surah_ayah_idx" ON "bustan"."quran_notes" USING btree ("surah_number","ayah_number");--> statement-breakpoint
CREATE INDEX "quran_recitation_attempts_student_idx" ON "bustan"."quran_recitation_attempts" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "quran_recitation_attempts_date_idx" ON "bustan"."quran_recitation_attempts" USING btree ("attempt_date");--> statement-breakpoint
CREATE INDEX "quran_recitation_attempts_student_surah_date_idx" ON "bustan"."quran_recitation_attempts" USING btree ("student_id","surah_number","attempt_date");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "bustan"."sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "student_errors_student_idx" ON "bustan"."student_errors" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_errors_surah_ayah_idx" ON "bustan"."student_errors" USING btree ("surah_number","ayah_number");