import {
  users,
  courses,
  instructors,
  courseEnrollments,
  contactMessages,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type Instructor,
  type InsertInstructor,
  type CourseEnrollment,
  type InsertEnrollment,
  type ContactMessage,
  type InsertContactMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, data: Partial<User>): Promise<User>;
  
  // Course operations
  getCourses(): Promise<Course[]>;
  getActiveCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course>;
  
  // Instructor operations
  getInstructors(): Promise<Instructor[]>;
  getActiveInstructors(): Promise<Instructor[]>;
  getInstructor(id: string): Promise<Instructor | undefined>;
  createInstructor(instructor: InsertInstructor): Promise<Instructor>;
  
  // Enrollment operations
  enrollUserInCourse(enrollment: InsertEnrollment): Promise<CourseEnrollment>;
  getUserEnrollments(userId: string): Promise<CourseEnrollment[]>;
  getCourseEnrollments(courseId: string): Promise<CourseEnrollment[]>;
  
  // Contact operations
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses).orderBy(desc(courses.startDate));
  }

  async getActiveCourses(): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(eq(courses.isActive, true))
      .orderBy(desc(courses.startDate));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...course, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  // Instructor operations
  async getInstructors(): Promise<Instructor[]> {
    return await db.select().from(instructors);
  }

  async getActiveInstructors(): Promise<Instructor[]> {
    return await db.select().from(instructors).where(eq(instructors.isActive, true));
  }

  async getInstructor(id: string): Promise<Instructor | undefined> {
    const [instructor] = await db.select().from(instructors).where(eq(instructors.id, id));
    return instructor;
  }

  async createInstructor(instructor: InsertInstructor): Promise<Instructor> {
    const [newInstructor] = await db.insert(instructors).values(instructor).returning();
    return newInstructor;
  }

  // Enrollment operations
  async enrollUserInCourse(enrollment: InsertEnrollment): Promise<CourseEnrollment> {
    const [newEnrollment] = await db.insert(courseEnrollments).values(enrollment).returning();
    
    // Update course current students count
    await db
      .update(courses)
      .set({
        currentStudents: await this.getCourseEnrollmentCount(enrollment.courseId),
        updatedAt: new Date(),
      })
      .where(eq(courses.id, enrollment.courseId));
    
    return newEnrollment;
  }

  async getUserEnrollments(userId: string): Promise<CourseEnrollment[]> {
    return await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.userId, userId))
      .orderBy(desc(courseEnrollments.enrollmentDate));
  }

  async getCourseEnrollments(courseId: string): Promise<CourseEnrollment[]> {
    return await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.courseId, courseId));
  }

  private async getCourseEnrollmentCount(courseId: string): Promise<number> {
    const enrollments = await this.getCourseEnrollments(courseId);
    return enrollments.filter(e => e.status === 'enrolled').length;
  }

  // Contact operations
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
  }
}

export const storage = new DatabaseStorage();
