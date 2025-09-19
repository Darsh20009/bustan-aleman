import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  date,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Additional fields for Islamic education platform
  role: varchar("role").default("student"), // student, supervisor, admin
  passwordHash: varchar("password_hash"), // Secure password storage for all roles
  phoneNumber: varchar("phone_number"),
  age: integer("age"),
  educationLevel: varchar("education_level"),
  quranExperience: varchar("quran_experience"),
  learningGoals: text("learning_goals"),
  preferredTime: varchar("preferred_time"),
  whatsappNumber: varchar("whatsapp_number"),
  isActive: boolean("is_active").default(true),
  registrationCompleted: boolean("registration_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Courses table
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleAr: varchar("title_ar").notNull(),
  titleEn: varchar("title_en"),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  instructorId: varchar("instructor_id").references(() => instructors.id),
  level: varchar("level").notNull(), // beginner, intermediate, advanced
  category: varchar("category").notNull(), // quran, fiqh, ramadan
  maxStudents: integer("max_students").default(50),
  currentStudents: integer("current_students").default(0),
  price: integer("price").default(0), // in cents
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Instructors table
export const instructors = pgTable("instructors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nameAr: varchar("name_ar").notNull(),
  nameEn: varchar("name_en"),
  titleAr: varchar("title_ar"),
  titleEn: varchar("title_en"),
  bioAr: text("bio_ar"),
  bioEn: text("bio_en"),
  profileImageUrl: varchar("profile_image_url"),
  qualifications: text("qualifications"),
  experience: text("experience"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course Enrollments table
export const courseEnrollments = pgTable("course_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  enrollmentDate: timestamp("enrollment_date").defaultNow(),
  status: varchar("status").default("enrolled"), // enrolled, completed, dropped
  progress: integer("progress").default(0), // percentage
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Students table for detailed student management
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  studentName: varchar("student_name").notNull(),
  passwordHash: varchar("password_hash").notNull(), // Hashed password for security
  dateOfBirth: date("date_of_birth"),
  grade: varchar("grade"), // الصف الدراسي
  monthlySessionsCount: integer("monthly_sessions_count").default(0),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).default("0"),
  isPaid: boolean("is_paid").default(false),
  isActive: boolean("is_active").default(true),
  memorizedSurahs: text("memorized_surahs"), // JSON string of memorized surahs
  currentLevel: varchar("current_level").default("beginner"), // beginner, intermediate, advanced
  notes: text("notes"), // ملاحظات عامة
  zoomLink: varchar("zoom_link"),
  whatsappContact: varchar("whatsapp_contact").default("+966532441566"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Student sessions/classes table
export const studentSessions = pgTable("student_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  sessionNumber: integer("session_number").notNull(),
  sessionDate: date("session_date").notNull(),
  sessionTime: varchar("session_time"), // e.g., "4:00 PM"
  evaluationGrade: varchar("evaluation_grade"), // ممتاز، جيد جداً، جيد، مقبول
  nextSessionDate: date("next_session_date"),
  newMaterial: text("new_material"), // الجديد
  reviewMaterial: text("review_material"), // المراجعة
  notes: text("notes"),
  attended: boolean("attended").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student recitation errors table
export const studentErrors = pgTable("student_errors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  surah: varchar("surah").notNull(),
  ayahNumber: integer("ayah_number").notNull(),
  errorType: varchar("error_type").default("recitation"), // recitation, memorization
  errorDescription: text("error_description"),
  isResolved: boolean("is_resolved").default(false),
  resolvedDate: date("resolved_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student payments and subscriptions
export const studentPayments = pgTable("student_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("SAR"),
  paymentDate: timestamp("payment_date").defaultNow(),
  paymentMethod: varchar("payment_method").default("whatsapp"), // whatsapp, bank, cash
  subscriptionPeriod: varchar("subscription_period").default("monthly"), // monthly, quarterly, yearly
  sessionsIncluded: integer("sessions_included").notNull(),
  sessionsRemaining: integer("sessions_remaining").notNull(),
  expiryDate: date("expiry_date"),
  status: varchar("status").default("active"), // active, expired, pending
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Class schedules
export const classSchedules = pgTable("class_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday=0)
  startTime: varchar("start_time").notNull(), // HH:MM format
  endTime: varchar("end_time").notNull(), // HH:MM format
  zoomLink: varchar("zoom_link"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Educational trips table
export const trips = pgTable("trips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleAr: varchar("title_ar").notNull(),
  titleEn: varchar("title_en"),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  tripDate: date("trip_date").notNull(),
  location: varchar("location").notNull(),
  capacity: integer("capacity").default(50),
  currentEnrollments: integer("current_enrollments").default(0),
  price: integer("price").default(0), // in halalas (smallest SAR unit)
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trip enrollments table
export const tripEnrollments = pgTable("trip_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tripId: varchar("trip_id").references(() => trips.id).notNull(),
  enrollmentDate: timestamp("enrollment_date").defaultNow(),
  status: varchar("status").default("enrolled"), // enrolled, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("trip_enrollments_user_trip_unique").on(table.userId, table.tripId),
]);

// Quran notes table - for students to save notes on verses
export const quranNotes = pgTable("quran_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  surahNumber: integer("surah_number").notNull(),
  ayahNumber: integer("ayah_number").notNull(),
  note: text("note").notNull(),
  tags: text("tags"), // JSON string of tags
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quran progress table - to track reading progress
export const quranProgress = pgTable("quran_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  lastSurah: integer("last_surah").default(1),
  lastAyah: integer("last_ayah").default(1),
  bookmarkedVerses: text("bookmarked_verses"), // JSON string of bookmarked verses
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique("quran_progress_student_unique").on(table.studentId),
]);

// Certificates table - for course completion and achievements
export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  courseId: varchar("course_id").references(() => courses.id),
  titleAr: varchar("title_ar").notNull(),
  titleEn: varchar("title_en"),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  issuedAt: timestamp("issued_at").defaultNow(),
  code: varchar("code").unique().notNull().default(sql`gen_random_uuid()`), // UUID for QR verification
  grade: varchar("grade"), // ممتاز، جيد جداً، جيد
  teacherName: varchar("teacher_name"),
  qrImageDataUrl: text("qr_image_data_url"), // Base64 QR code image
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("certificates_code_idx").on(table.code),
]);

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  phoneNumber: true,
  age: true,
  educationLevel: true,
  quranExperience: true,
  learningGoals: true,
  preferredTime: true,
  whatsappNumber: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInstructorSchema = createInsertSchema(instructors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(courseEnrollments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentSessionSchema = createInsertSchema(studentSessions).omit({
  id: true,
  createdAt: true,
});

export const insertStudentErrorSchema = createInsertSchema(studentErrors).omit({
  id: true,
  createdAt: true,
});

export const insertStudentPaymentSchema = createInsertSchema(studentPayments).omit({
  id: true,
  createdAt: true,
});

export const insertClassScheduleSchema = createInsertSchema(classSchedules).omit({
  id: true,
  createdAt: true,
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTripEnrollmentSchema = createInsertSchema(tripEnrollments).omit({
  id: true,
  createdAt: true,
});

export const insertQuranNoteSchema = createInsertSchema(quranNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuranProgressSchema = createInsertSchema(quranProgress).omit({
  id: true,
  updatedAt: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  createdAt: true,
  code: true, // Auto-generated UUID
});

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Instructor = typeof instructors.$inferSelect;
export type InsertInstructor = z.infer<typeof insertInstructorSchema>;
export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type StudentSession = typeof studentSessions.$inferSelect;
export type InsertStudentSession = z.infer<typeof insertStudentSessionSchema>;
export type StudentError = typeof studentErrors.$inferSelect;
export type InsertStudentError = z.infer<typeof insertStudentErrorSchema>;
export type StudentPayment = typeof studentPayments.$inferSelect;
export type InsertStudentPayment = z.infer<typeof insertStudentPaymentSchema>;
export type ClassSchedule = typeof classSchedules.$inferSelect;
export type InsertClassSchedule = z.infer<typeof insertClassScheduleSchema>;

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type TripEnrollment = typeof tripEnrollments.$inferSelect;
export type InsertTripEnrollment = z.infer<typeof insertTripEnrollmentSchema>;
export type QuranNote = typeof quranNotes.$inferSelect;
export type InsertQuranNote = z.infer<typeof insertQuranNoteSchema>;
export type QuranProgress = typeof quranProgress.$inferSelect;
export type InsertQuranProgress = z.infer<typeof insertQuranProgressSchema>;
export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
