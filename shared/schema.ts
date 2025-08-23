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
