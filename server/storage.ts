import {
  users,
  courses,
  instructors,
  courseEnrollments,
  contactMessages,
  students,
  studentSessions,
  studentErrors,
  studentPayments,
  classSchedules,
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
  type Student,
  type InsertStudent,
  type StudentSession,
  type InsertStudentSession,
  type StudentError,
  type InsertStudentError,
  type StudentPayment,
  type InsertStudentPayment,
  type ClassSchedule,
  type InsertClassSchedule,
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
  
  // Student operations
  createStudent(student: InsertStudent): Promise<Student>;
  getAllStudents(): Promise<Student[]>;
  getStudent(id: string): Promise<Student | undefined>;
  authenticateStudent(studentName: string, password: string): Promise<Student | undefined>;
  
  // Student session operations
  createStudentSession(session: InsertStudentSession): Promise<StudentSession>;
  getStudentSessions(studentId: string): Promise<StudentSession[]>;
  
  // Student error operations
  createStudentError(error: InsertStudentError): Promise<StudentError>;
  getStudentErrors(studentId: string): Promise<StudentError[]>;
  
  // Student payment operations
  createStudentPayment(payment: InsertStudentPayment): Promise<StudentPayment>;
  getStudentPayments(studentId: string): Promise<StudentPayment[]>;
  
  // Class schedule operations
  createClassSchedule(schedule: InsertClassSchedule): Promise<ClassSchedule>;
  getStudentSchedules(studentId: string): Promise<ClassSchedule[]>;
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

  // Student operations
  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students).orderBy(desc(students.createdAt));
  }

  async getStudent(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async authenticateStudent(studentName: string, password: string): Promise<Student | undefined> {
    const [student] = await db
      .select()
      .from(students)
      .where(and(eq(students.studentName, studentName), eq(students.password, password)));
    return student;
  }

  // Student session operations
  async createStudentSession(session: InsertStudentSession): Promise<StudentSession> {
    const [newSession] = await db.insert(studentSessions).values(session).returning();
    return newSession;
  }

  async getStudentSessions(studentId: string): Promise<StudentSession[]> {
    return await db
      .select()
      .from(studentSessions)
      .where(eq(studentSessions.studentId, studentId))
      .orderBy(desc(studentSessions.sessionDate));
  }

  // Student error operations
  async createStudentError(error: InsertStudentError): Promise<StudentError> {
    const [newError] = await db.insert(studentErrors).values(error).returning();
    return newError;
  }

  async getStudentErrors(studentId: string): Promise<StudentError[]> {
    return await db
      .select()
      .from(studentErrors)
      .where(eq(studentErrors.studentId, studentId))
      .orderBy(desc(studentErrors.createdAt));
  }

  // Student payment operations
  async createStudentPayment(payment: InsertStudentPayment): Promise<StudentPayment> {
    const [newPayment] = await db.insert(studentPayments).values(payment).returning();
    return newPayment;
  }

  async getStudentPayments(studentId: string): Promise<StudentPayment[]> {
    return await db
      .select()
      .from(studentPayments)
      .where(eq(studentPayments.studentId, studentId))
      .orderBy(desc(studentPayments.paymentDate));
  }

  // Class schedule operations
  async createClassSchedule(schedule: InsertClassSchedule): Promise<ClassSchedule> {
    const [newSchedule] = await db.insert(classSchedules).values(schedule).returning();
    return newSchedule;
  }

  async getStudentSchedules(studentId: string): Promise<ClassSchedule[]> {
    return await db
      .select()
      .from(classSchedules)
      .where(eq(classSchedules.studentId, studentId))
      .orderBy(classSchedules.dayOfWeek);
  }
}

export const storage = new DatabaseStorage();
