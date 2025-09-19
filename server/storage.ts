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
import { jsonStorage } from "./jsonStorage";
import { hashPassword, verifyPassword } from "./authUtils";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
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
  private isDbAvailable(): boolean {
    return db !== null;
  }

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    if (!this.isDbAvailable()) {
      // Return undefined for now - auth will be handled by JSON storage
      return undefined;
    }
    const [user] = await db!.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!this.isDbAvailable()) {
      // Create a user object with default values for JSON storage fallback
      const user: User = {
        id: userData.id || `user_${Date.now()}`,
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        role: userData.role || 'student',
        passwordHash: userData.passwordHash || null,
        phoneNumber: userData.phoneNumber || null,
        age: userData.age || null,
        educationLevel: userData.educationLevel || null,
        quranExperience: userData.quranExperience || null,
        learningGoals: userData.learningGoals || null,
        preferredTime: userData.preferredTime || null,
        whatsappNumber: userData.whatsappNumber || null,
        isActive: userData.isActive ?? true,
        registrationCompleted: userData.registrationCompleted ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return user;
    }
    const [user] = await db!
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

  async getAllUsers(): Promise<User[]> {
    if (!this.isDbAvailable()) {
      // Return empty array for JSON storage fallback
      return [];
    }
    return await db!.select().from(users).where(eq(users.isActive, true));
  }

  async updateUserProfile(id: string, data: Partial<User>): Promise<User> {
    if (!this.isDbAvailable()) {
      // Return a dummy user for JSON storage fallback
      throw new Error("User profile updates not available in JSON mode");
    }
    const [user] = await db!
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!.select().from(courses).orderBy(desc(courses.startDate));
  }

  async getActiveCourses(): Promise<Course[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!
      .select()
      .from(courses)
      .where(eq(courses.isActive, true))
      .orderBy(desc(courses.startDate));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    if (!this.isDbAvailable()) {
      return undefined;
    }
    const [course] = await db!.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    if (!this.isDbAvailable()) {
      throw new Error("Course creation not available in JSON mode");
    }
    const [newCourse] = await db!.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course> {
    if (!this.isDbAvailable()) {
      throw new Error("Course updates not available in JSON mode");
    }
    const [updatedCourse] = await db!
      .update(courses)
      .set({ ...course, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  // Instructor operations
  async getInstructors(): Promise<Instructor[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!.select().from(instructors);
  }

  async getActiveInstructors(): Promise<Instructor[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!.select().from(instructors).where(eq(instructors.isActive, true));
  }

  async getInstructor(id: string): Promise<Instructor | undefined> {
    if (!this.isDbAvailable()) {
      return undefined;
    }
    const [instructor] = await db!.select().from(instructors).where(eq(instructors.id, id));
    return instructor;
  }

  async createInstructor(instructor: InsertInstructor): Promise<Instructor> {
    if (!this.isDbAvailable()) {
      throw new Error("Instructor creation not available in JSON mode");
    }
    const [newInstructor] = await db!.insert(instructors).values(instructor).returning();
    return newInstructor;
  }

  // Enrollment operations
  async enrollUserInCourse(enrollment: InsertEnrollment): Promise<CourseEnrollment> {
    if (!this.isDbAvailable()) {
      throw new Error("Enrollment not available in JSON mode");
    }
    const [newEnrollment] = await db!.insert(courseEnrollments).values(enrollment).returning();
    
    // Update course current students count
    await db!
      .update(courses)
      .set({
        currentStudents: await this.getCourseEnrollmentCount(enrollment.courseId),
        updatedAt: new Date(),
      })
      .where(eq(courses.id, enrollment.courseId));
    
    return newEnrollment;
  }

  async getUserEnrollments(userId: string): Promise<CourseEnrollment[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.userId, userId))
      .orderBy(desc(courseEnrollments.enrollmentDate));
  }

  async getCourseEnrollments(courseId: string): Promise<CourseEnrollment[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!
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
    if (!this.isDbAvailable()) {
      // Create a simple contact message object for JSON mode
      const contactMessage: ContactMessage = {
        id: `msg_${Date.now()}`,
        name: message.name,
        email: message.email,
        phone: message.phone || null,
        subject: message.subject,
        message: message.message,
        isRead: false,
        createdAt: new Date(),
      };
      return contactMessage;
    }
    const [newMessage] = await db!.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
  }

  // Student operations
  async createStudent(student: InsertStudent): Promise<Student> {
    if (!this.isDbAvailable()) {
      // Use JSON storage fallback
      const jsonStudent = await jsonStorage.createStudent({
        studentName: student.studentName || '',
        email: '',
        password: student.passwordHash || '',
        phone: '',
        dateOfBirth: student.dateOfBirth || new Date().toISOString().split('T')[0],
        age: 20,
        grade: student.grade || undefined,
        memorizedSurahs: student.memorizedSurahs ? JSON.parse(student.memorizedSurahs) : [],
        errors: [],
        sessions: [],
        payments: [],
        schedules: [],
        currentLevel: student.currentLevel || 'beginner',
        notes: student.notes || '',
        zoomLink: student.zoomLink || '',
        createdAt: new Date().toISOString(),
        isActive: student.isActive ?? true,
      });
      // Convert JSON student to Student type
      const convertedStudent: Student = {
        id: jsonStudent.id,
        userId: null,
        studentName: jsonStudent.studentName,
        passwordHash: jsonStudent.password,
        dateOfBirth: jsonStudent.dateOfBirth,
        grade: jsonStudent.grade || null,
        monthlySessionsCount: 0,
        monthlyPrice: "0",
        isPaid: false,
        isActive: jsonStudent.isActive,
        memorizedSurahs: JSON.stringify(jsonStudent.memorizedSurahs),
        currentLevel: jsonStudent.currentLevel || 'beginner',
        notes: jsonStudent.notes || null,
        zoomLink: jsonStudent.zoomLink || null,
        whatsappContact: '+966532441566',
        createdAt: new Date(jsonStudent.createdAt),
        updatedAt: new Date(),
      };
      return convertedStudent;
    }
    const [newStudent] = await db!.insert(students).values(student).returning();
    return newStudent;
  }

  async getAllStudents(): Promise<Student[]> {
    if (!this.isDbAvailable()) {
      // Use JSON storage fallback
      const jsonStudents = await jsonStorage.getAllStudents();
      return jsonStudents.map(jsonStudent => ({
        id: jsonStudent.id,
        userId: null,
        studentName: jsonStudent.studentName,
        passwordHash: jsonStudent.password,
        dateOfBirth: jsonStudent.dateOfBirth,
        grade: jsonStudent.grade || null,
        monthlySessionsCount: 0,
        monthlyPrice: "0",
        isPaid: false,
        isActive: jsonStudent.isActive,
        memorizedSurahs: JSON.stringify(jsonStudent.memorizedSurahs),
        currentLevel: jsonStudent.currentLevel || 'beginner',
        notes: jsonStudent.notes || null,
        zoomLink: jsonStudent.zoomLink || null,
        whatsappContact: '+966532441566',
        createdAt: new Date(jsonStudent.createdAt),
        updatedAt: new Date(),
      }));
    }
    return await db!.select().from(students).orderBy(desc(students.createdAt));
  }

  async getStudent(id: string): Promise<Student | undefined> {
    if (!this.isDbAvailable()) {
      // Use JSON storage fallback
      const jsonStudent = await jsonStorage.getStudent(id);
      if (!jsonStudent) return undefined;
      return {
        id: jsonStudent.id,
        userId: null,
        studentName: jsonStudent.studentName,
        password: jsonStudent.password,
        dateOfBirth: jsonStudent.dateOfBirth,
        grade: jsonStudent.grade || null,
        monthlySessionsCount: 0,
        monthlyPrice: "0",
        isPaid: false,
        isActive: jsonStudent.isActive,
        memorizedSurahs: JSON.stringify(jsonStudent.memorizedSurahs),
        currentLevel: jsonStudent.currentLevel || 'beginner',
        notes: jsonStudent.notes || null,
        zoomLink: jsonStudent.zoomLink || null,
        whatsappContact: '+966532441566',
        createdAt: new Date(jsonStudent.createdAt),
        updatedAt: new Date(),
      };
    }
    const [student] = await db!.select().from(students).where(eq(students.id, id));
    return student;
  }

  async authenticateStudent(studentName: string, password: string): Promise<Student | undefined> {
    if (!this.isDbAvailable()) {
      // Use JSON storage fallback
      const jsonStudent = await jsonStorage.authenticateStudent(studentName, password);
      if (!jsonStudent) return undefined;
      return {
        id: jsonStudent.id,
        userId: null,
        studentName: jsonStudent.studentName,
        passwordHash: jsonStudent.password,
        dateOfBirth: jsonStudent.dateOfBirth,
        grade: jsonStudent.grade || null,
        monthlySessionsCount: 0,
        monthlyPrice: "0",
        isPaid: false,
        isActive: jsonStudent.isActive,
        memorizedSurahs: JSON.stringify(jsonStudent.memorizedSurahs),
        currentLevel: jsonStudent.currentLevel || 'beginner',
        notes: jsonStudent.notes || null,
        zoomLink: jsonStudent.zoomLink || null,
        whatsappContact: '+966532441566',
        createdAt: new Date(jsonStudent.createdAt),
        updatedAt: new Date(),
      };
    }
    // Get student by name first, then verify password with bcrypt
    const [student] = await db!
      .select()
      .from(students)
      .where(eq(students.studentName, studentName));
    
    if (!student || !student.passwordHash) {
      return undefined;
    }
    
    // Verify password against hash
    const isValidPassword = await verifyPassword(password, student.passwordHash);
    return isValidPassword ? student : undefined;
  }

  // Student session operations
  async createStudentSession(session: InsertStudentSession): Promise<StudentSession> {
    if (!this.isDbAvailable()) {
      const sessionData: StudentSession = {
        id: `session_${Date.now()}`,
        studentId: session.studentId,
        sessionNumber: session.sessionNumber,
        sessionDate: typeof session.sessionDate === 'string' ? session.sessionDate : session.sessionDate.toISOString().split('T')[0],
        sessionTime: session.sessionTime || null,
        evaluationGrade: session.evaluationGrade || null,
        nextSessionDate: session.nextSessionDate ? (typeof session.nextSessionDate === 'string' ? session.nextSessionDate : session.nextSessionDate.toISOString().split('T')[0]) : null,
        newMaterial: session.newMaterial || null,
        reviewMaterial: session.reviewMaterial || null,
        notes: session.notes || null,
        attended: session.attended ?? false,
        createdAt: new Date(),
      };
      return sessionData;
    }
    const [newSession] = await db!.insert(studentSessions).values(session).returning();
    return newSession;
  }

  async getStudentSessions(studentId: string): Promise<StudentSession[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!
      .select()
      .from(studentSessions)
      .where(eq(studentSessions.studentId, studentId))
      .orderBy(desc(studentSessions.sessionDate));
  }

  // Student error operations
  async createStudentError(error: InsertStudentError): Promise<StudentError> {
    if (!this.isDbAvailable()) {
      const errorData: StudentError = {
        id: `error_${Date.now()}`,
        studentId: error.studentId,
        surah: error.surah,
        ayahNumber: error.ayahNumber,
        errorType: error.errorType ?? 'recitation',
        errorDescription: error.errorDescription || null,
        isResolved: error.isResolved ?? false,
        resolvedDate: error.resolvedDate ? (typeof error.resolvedDate === 'string' ? error.resolvedDate : error.resolvedDate.toISOString().split('T')[0]) : null,
        createdAt: new Date(),
      };
      return errorData;
    }
    const [newError] = await db!.insert(studentErrors).values(error).returning();
    return newError;
  }

  async getStudentErrors(studentId: string): Promise<StudentError[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!
      .select()
      .from(studentErrors)
      .where(eq(studentErrors.studentId, studentId))
      .orderBy(desc(studentErrors.createdAt));
  }

  // Student payment operations
  async createStudentPayment(payment: InsertStudentPayment): Promise<StudentPayment> {
    if (!this.isDbAvailable()) {
      const paymentData: StudentPayment = {
        id: `payment_${Date.now()}`,
        studentId: payment.studentId,
        amount: payment.amount,
        currency: payment.currency ?? 'SAR',
        paymentDate: new Date(),
        paymentMethod: payment.paymentMethod ?? 'whatsapp',
        subscriptionPeriod: payment.subscriptionPeriod ?? 'monthly',
        sessionsIncluded: payment.sessionsIncluded,
        sessionsRemaining: payment.sessionsRemaining,
        expiryDate: payment.expiryDate ? (typeof payment.expiryDate === 'string' ? payment.expiryDate : payment.expiryDate.toISOString().split('T')[0]) : null,
        status: payment.status ?? 'active',
        notes: payment.notes || null,
        createdAt: new Date(),
      };
      return paymentData;
    }
    const [newPayment] = await db!.insert(studentPayments).values(payment).returning();
    return newPayment;
  }

  async getStudentPayments(studentId: string): Promise<StudentPayment[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!
      .select()
      .from(studentPayments)
      .where(eq(studentPayments.studentId, studentId))
      .orderBy(desc(studentPayments.paymentDate));
  }

  // Class schedule operations
  async createClassSchedule(schedule: InsertClassSchedule): Promise<ClassSchedule> {
    if (!this.isDbAvailable()) {
      const scheduleData: ClassSchedule = {
        id: `schedule_${Date.now()}`,
        studentId: schedule.studentId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        zoomLink: schedule.zoomLink || null,
        isActive: schedule.isActive ?? true,
        createdAt: new Date(),
      };
      return scheduleData;
    }
    const [newSchedule] = await db!.insert(classSchedules).values(schedule).returning();
    return newSchedule;
  }

  async getStudentSchedules(studentId: string): Promise<ClassSchedule[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!
      .select()
      .from(classSchedules)
      .where(eq(classSchedules.studentId, studentId))
      .orderBy(classSchedules.dayOfWeek);
  }
}

export const storage = new DatabaseStorage();
