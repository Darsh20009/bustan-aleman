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
  supervisors,
  studentNotes,
  certificates,
  quranProgress,
  quranWordHighlights,
  quranMemorization,
  quranReadingStats,
  quranAyahMarkers,
  quranRecitationAttempts,
  quranNotes,
  sessionAccess,
  dailyAssignments,
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
  type Supervisor,
  type InsertSupervisor,
  type StudentNote,
  type InsertStudentNote,
  type Certificate,
  type InsertCertificate,
  type QuranProgress,
  type InsertQuranProgress,
  type QuranWordHighlight,
  type InsertQuranWordHighlight,
  type QuranMemorization,
  type InsertQuranMemorization,
  type QuranReadingStats,
  type InsertQuranReadingStats,
  type QuranAyahMarker,
  type InsertQuranAyahMarker,
  type QuranRecitationAttempt,
  type InsertQuranRecitationAttempt,
  type QuranNote,
  type InsertQuranNote,
  type SessionAccess,
  type InsertSessionAccess,
  type DailyAssignment,
  type InsertDailyAssignment,
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
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  createUserWithPhone(data: { firstName: string; phoneNumber: string; passwordHash: string; role: string }): Promise<User>;
  
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
  
  // Student progress operations
  getQuranProgress(studentId: string): Promise<QuranProgress | undefined>;
  createQuranProgress(progress: InsertQuranProgress): Promise<QuranProgress>;
  updateQuranProgress(studentId: string, updates: Partial<QuranProgress>): Promise<QuranProgress>;
  
  // Student note operations
  createStudentNote(note: InsertStudentNote): Promise<StudentNote>;
  getStudentNotes(studentId: string): Promise<StudentNote[]>;
  
  // Certificate operations
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  getCertificate(id: string): Promise<Certificate | undefined>;
  getCertificateByToken(token: string): Promise<Certificate | undefined>;
  getStudentCertificates(studentId: string): Promise<Certificate[]>;
  getAllCertificates(): Promise<Certificate[]>;
  
  // Additional student operations
  updateStudent(id: string, updates: Partial<Student>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;
  updateStudentMemorization(userId: string, memorization: Array<{surah: number, ayat: number[]}>): Promise<void>;
  
  // Student error operations
  createStudentError(error: InsertStudentError): Promise<StudentError>;
  getStudentErrors(studentId: string): Promise<StudentError[]>;
  
  // Student payment operations
  createStudentPayment(payment: InsertStudentPayment): Promise<StudentPayment>;
  getStudentPayments(studentId: string): Promise<StudentPayment[]>;
  
  // Class schedule operations
  createClassSchedule(schedule: InsertClassSchedule): Promise<ClassSchedule>;
  getStudentSchedules(studentId: string): Promise<ClassSchedule[]>;
  updateClassSchedule(id: string, updates: Partial<InsertClassSchedule>): Promise<ClassSchedule>;
  deleteClassSchedule(id: string): Promise<void>;
  
  // Supervisor operations
  createSupervisor(supervisor: InsertSupervisor): Promise<Supervisor>;
  getSupervisors(): Promise<Supervisor[]>;
  getSupervisor(id: string): Promise<Supervisor | undefined>;

  // Telegram operations
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createTelegramUser(userData: {
    telegramId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    age: number;
    email: string;
    role: string;
    isActive: boolean;
    registrationCompleted: boolean;
  }): Promise<User>;
  
  // Quran word highlights operations
  createWordHighlight(highlight: InsertQuranWordHighlight): Promise<QuranWordHighlight>;
  getWordHighlights(studentId: string, surahNumber: number, ayahNumber: number): Promise<QuranWordHighlight[]>;
  getAllWordHighlights(studentId: string): Promise<QuranWordHighlight[]>;
  updateWordHighlight(id: string, updates: Partial<InsertQuranWordHighlight>): Promise<QuranWordHighlight>;
  deleteWordHighlight(id: string): Promise<void>;
  deleteWordHighlightByLocation(studentId: string, surahNumber: number, ayahNumber: number, wordIndex: number): Promise<void>;
  
  // Quran memorization operations
  createMemorization(memorization: InsertQuranMemorization): Promise<QuranMemorization>;
  getStudentMemorization(studentId: string): Promise<QuranMemorization[]>;
  updateMemorization(id: string, updates: Partial<InsertQuranMemorization>): Promise<QuranMemorization>;
  deleteMemorization(id: string): Promise<void>;
  getDueReviews(studentId: string, untilDate?: Date): Promise<QuranMemorization[]>;
  updateReviewOutcome(id: string, reviewData: { difficulty: 'easy' | 'medium' | 'hard'; reviewCount: number; lastReviewed: Date; nextReviewDate: Date; masteryLevel: number; status: string }): Promise<QuranMemorization>;
  
  // Quran reading statistics operations
  createOrUpdateReadingStats(stats: InsertQuranReadingStats): Promise<QuranReadingStats>;
  getStudentReadingStats(studentId: string, startDate?: string, endDate?: string): Promise<QuranReadingStats[]>;
  getTodayReadingStats(studentId: string): Promise<QuranReadingStats | undefined>;
  
  // Quran ayah markers operations
  createAyahMarker(marker: InsertQuranAyahMarker): Promise<QuranAyahMarker>;
  getStudentAyahMarkers(studentId: string): Promise<QuranAyahMarker[]>;
  updateAyahMarker(id: string, updates: Partial<InsertQuranAyahMarker>): Promise<QuranAyahMarker>;
  deleteAyahMarker(id: string): Promise<void>;
  
  // Quran recitation attempts operations
  createRecitationAttempt(attempt: InsertQuranRecitationAttempt): Promise<QuranRecitationAttempt>;
  getStudentRecitationAttempts(studentId: string): Promise<QuranRecitationAttempt[]>;
  
  // Daily assignments operations
  createDailyAssignment(assignment: InsertDailyAssignment): Promise<DailyAssignment>;
  getDailyAssignment(studentId: string, date: string): Promise<DailyAssignment | undefined>;
  getDailyAssignments(studentId: string): Promise<DailyAssignment[]>;
  getAllDailyAssignments(): Promise<DailyAssignment[]>;
  
  // Session access operations
  enableSessionAccess(access: InsertSessionAccess): Promise<SessionAccess>;
  getSessionAccess(studentId: string, sessionDate: string): Promise<SessionAccess | undefined>;
  getAllSessionAccess(studentId: string): Promise<SessionAccess[]>;
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

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    if (!this.isDbAvailable()) {
      return undefined;
    }
    const [user] = await db!
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber));
    return user;
  }

  async createUserWithPhone(data: { firstName: string; phoneNumber: string; passwordHash: string; role: string }): Promise<User> {
    if (!this.isDbAvailable()) {
      throw new Error("User creation not available in JSON mode");
    }
    const [user] = await db!
      .insert(users)
      .values({
        firstName: data.firstName,
        phoneNumber: data.phoneNumber,
        passwordHash: data.passwordHash,
        role: data.role,
        isActive: true,
        registrationCompleted: true,
      })
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
        isActive: student.isActive ?? true,
      });
      // Convert JSON student to Student type
      const convertedStudent: Student = {
        id: jsonStudent.id,
        userId: null,
        studentName: jsonStudent.studentName,
        passwordHash: jsonStudent.password,
        phoneNumber: jsonStudent.phone || null,
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
        createdAt: new Date(),
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
        phoneNumber: jsonStudent.phone || null,
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
        createdAt: new Date(),
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
        passwordHash: jsonStudent.password,
        phoneNumber: jsonStudent.phone || null,
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
        createdAt: new Date(),
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
        phoneNumber: jsonStudent.phone || null,
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
        createdAt: new Date(),
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
        sessionDate: typeof session.sessionDate === 'string' ? session.sessionDate : new Date().toISOString().split('T')[0],
        sessionTime: session.sessionTime || null,
        evaluationGrade: session.evaluationGrade || null,
        nextSessionDate: session.nextSessionDate ? (typeof session.nextSessionDate === 'string' ? session.nextSessionDate : new Date().toISOString().split('T')[0]) : null,
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
        resolvedDate: error.resolvedDate ? (typeof error.resolvedDate === 'string' ? error.resolvedDate : new Date().toISOString().split('T')[0]) : null,
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
        expiryDate: payment.expiryDate ? (typeof payment.expiryDate === 'string' ? payment.expiryDate : new Date().toISOString().split('T')[0]) : null,
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

  async updateClassSchedule(id: string, updates: Partial<InsertClassSchedule>): Promise<ClassSchedule> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const [updated] = await db!
      .update(classSchedules)
      .set(updates)
      .where(eq(classSchedules.id, id))
      .returning();
    return updated;
  }

  async deleteClassSchedule(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    await db!.delete(classSchedules).where(eq(classSchedules.id, id));
  }

  // Supervisor operations
  async createSupervisor(supervisor: InsertSupervisor): Promise<Supervisor> {
    if (!this.isDbAvailable()) {
      const supervisorData: Supervisor = {
        id: `supervisor_${Date.now()}`,
        userId: supervisor.userId || null,
        name: supervisor.name,
        whatsappNumber: supervisor.whatsappNumber,
        zoomLink: supervisor.zoomLink || null,
        specialization: supervisor.specialization || null,
        experience: supervisor.experience || null,
        qualifications: supervisor.qualifications || null,
        isActive: supervisor.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return supervisorData;
    }
    const [newSupervisor] = await db!.insert(supervisors).values(supervisor).returning();
    return newSupervisor;
  }

  async getSupervisors(): Promise<Supervisor[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!.select().from(supervisors).where(eq(supervisors.isActive, true));
  }

  async getSupervisor(id: string): Promise<Supervisor | undefined> {
    if (!this.isDbAvailable()) {
      return undefined;
    }
    const [supervisor] = await db!.select().from(supervisors).where(eq(supervisors.id, id));
    return supervisor;
  }

  // Student progress operations
  async getQuranProgress(studentId: string): Promise<QuranProgress | undefined> {
    if (!this.isDbAvailable()) {
      return undefined;
    }
    const [progress] = await db!.select().from(quranProgress).where(eq(quranProgress.studentId, studentId));
    return progress;
  }

  async createQuranProgress(progress: InsertQuranProgress): Promise<QuranProgress> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const [newProgress] = await db!.insert(quranProgress).values(progress).returning();
    return newProgress;
  }

  async updateQuranProgress(studentId: string, updates: Partial<QuranProgress>): Promise<QuranProgress> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const [updatedProgress] = await db!.update(quranProgress).set(updates).where(eq(quranProgress.studentId, studentId)).returning();
    return updatedProgress;
  }

  // Student note operations
  async createStudentNote(note: InsertStudentNote): Promise<StudentNote> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const [newNote] = await db!.insert(studentNotes).values(note).returning();
    return newNote;
  }

  async getStudentNotes(studentId: string): Promise<StudentNote[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!.select().from(studentNotes).where(eq(studentNotes.studentId, studentId)).orderBy(desc(studentNotes.createdAt));
  }

  // Certificate operations
  async createCertificate(certificate: InsertCertificate): Promise<Certificate> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const [newCertificate] = await db!.insert(certificates).values(certificate).returning();
    return newCertificate;
  }

  async getCertificate(id: string): Promise<Certificate | undefined> {
    if (!this.isDbAvailable()) {
      return undefined;
    }
    const [certificate] = await db!.select().from(certificates).where(eq(certificates.id, id));
    return certificate;
  }

  async getCertificateByToken(token: string): Promise<Certificate | undefined> {
    if (!this.isDbAvailable()) {
      return undefined;
    }
    const [certificate] = await db!.select().from(certificates).where(eq(certificates.verificationToken, token));
    return certificate;
  }

  async getStudentCertificates(studentId: string): Promise<Certificate[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!.select().from(certificates).where(eq(certificates.studentId, studentId)).orderBy(desc(certificates.issuedAt));
  }

  async getAllCertificates(): Promise<Certificate[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!.select().from(certificates).orderBy(desc(certificates.issuedAt));
  }

  // Additional student operations
  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    if (!this.isDbAvailable()) {
      // Fallback to JSON storage for development
      const studentsData = await jsonStorage.readJSON('data/students.json');
      const studentIndex = studentsData.findIndex((s: any) => s.id === id);
      
      if (studentIndex === -1) {
        throw new Error("Student not found");
      }
      
      studentsData[studentIndex] = { ...studentsData[studentIndex], ...updates };
      await jsonStorage.writeJSON('data/students.json', studentsData);
      return studentsData[studentIndex];
    }
    
    const [updatedStudent] = await db!.update(students).set(updates).where(eq(students.id, id)).returning();
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      const studentsData = await jsonStorage.readJSON('data/students.json');
      const filteredStudents = studentsData.filter((s: any) => s.id !== id);
      await jsonStorage.writeJSON('data/students.json', filteredStudents);
      return;
    }
    
    await db!.delete(students).where(eq(students.id, id));
  }

  async updateStudentMemorization(userId: string, memorization: Array<{surah: number, ayat: number[]}>): Promise<void> {
    if (!this.isDbAvailable()) {
      // Fallback to JSON storage for development
      const studentsData = await jsonStorage.readJSON('data/students.json');
      const studentIndex = studentsData.findIndex((s: any) => s.userId === userId);
      
      if (studentIndex !== -1) {
        studentsData[studentIndex].memorizedSurahs = JSON.stringify(memorization);
        await jsonStorage.writeJSON('data/students.json', studentsData);
      }
      return;
    }
    
    // Update student record with memorization data
    const student = await this.getAllStudents().then(students => 
      students.find(s => s.userId === userId)
    );
    
    if (student) {
      await db!.update(students)
        .set({ memorizedSurahs: JSON.stringify(memorization) })
        .where(eq(students.id, student.id));
    }
  }

  // Telegram operations
  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    if (!this.isDbAvailable()) {
      return undefined;
    }
    // Search by email field which stores telegram user data
    const telegramEmail = `${telegramId}@telegram.user`;
    const [user] = await db!.select().from(users).where(eq(users.email, telegramEmail));
    return user;
  }

  async createTelegramUser(userData: {
    telegramId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    age: number;
    email: string;
    role: string;
    isActive: boolean;
    registrationCompleted: boolean;
  }): Promise<User> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available for telegram user creation");
    }
    
    const newUser: UpsertUser = {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      age: userData.age,
      role: userData.role,
      isActive: userData.isActive,
      registrationCompleted: userData.registrationCompleted,
    };
    
    const [user] = await db!.insert(users).values(newUser).returning();
    return user;
  }

  // Quran word highlights operations
  async createWordHighlight(highlight: InsertQuranWordHighlight): Promise<QuranWordHighlight> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const [newHighlight] = await db!.insert(quranWordHighlights).values(highlight).returning();
    return newHighlight;
  }

  async getWordHighlights(studentId: string, surahNumber: number, ayahNumber: number): Promise<QuranWordHighlight[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!.select().from(quranWordHighlights)
      .where(and(
        eq(quranWordHighlights.studentId, studentId),
        eq(quranWordHighlights.surahNumber, surahNumber),
        eq(quranWordHighlights.ayahNumber, ayahNumber)
      ));
  }

  async updateWordHighlight(id: string, updates: Partial<InsertQuranWordHighlight>): Promise<QuranWordHighlight> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const [updated] = await db!.update(quranWordHighlights).set(updates).where(eq(quranWordHighlights.id, id)).returning();
    return updated;
  }

  async deleteWordHighlight(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    await db!.delete(quranWordHighlights).where(eq(quranWordHighlights.id, id));
  }

  async getAllWordHighlights(studentId: string): Promise<QuranWordHighlight[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!.select().from(quranWordHighlights)
      .where(eq(quranWordHighlights.studentId, studentId))
      .orderBy(desc(quranWordHighlights.createdAt));
  }

  async deleteWordHighlightByLocation(
    studentId: string,
    surahNumber: number,
    ayahNumber: number,
    wordIndex: number
  ): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    await db!.delete(quranWordHighlights).where(and(
      eq(quranWordHighlights.studentId, studentId),
      eq(quranWordHighlights.surahNumber, surahNumber),
      eq(quranWordHighlights.ayahNumber, ayahNumber),
      eq(quranWordHighlights.wordIndex, wordIndex)
    ));
  }

  // Quran memorization operations
  async createMemorization(memorization: InsertQuranMemorization): Promise<QuranMemorization> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const [newMem] = await db!.insert(quranMemorization).values(memorization).returning();
    return newMem;
  }

  async getStudentMemorization(studentId: string): Promise<QuranMemorization[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!.select().from(quranMemorization)
      .where(eq(quranMemorization.studentId, studentId))
      .orderBy(desc(quranMemorization.createdAt));
  }

  async updateMemorization(id: string, updates: Partial<InsertQuranMemorization>): Promise<QuranMemorization> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const [updated] = await db!.update(quranMemorization).set(updates).where(eq(quranMemorization.id, id)).returning();
    return updated;
  }

  async deleteMemorization(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    await db!.delete(quranMemorization).where(eq(quranMemorization.id, id));
  }

  async getDueReviews(studentId: string, untilDate?: Date): Promise<QuranMemorization[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    
    const until = untilDate || new Date();
    until.setHours(23, 59, 59, 999);
    
    const allMemorization = await db!.select().from(quranMemorization)
      .where(eq(quranMemorization.studentId, studentId))
      .orderBy(desc(quranMemorization.nextReviewDate));
    
    return allMemorization.filter(mem => {
      if (mem.status === 'in_progress') return false;
      
      if (!mem.nextReviewDate) {
        return true;
      }
      
      const nextReview = new Date(mem.nextReviewDate);
      nextReview.setHours(0, 0, 0, 0);
      
      return nextReview <= until;
    });
  }

  async updateReviewOutcome(
    id: string,
    reviewData: {
      difficulty: 'easy' | 'medium' | 'hard';
      reviewCount: number;
      lastReviewed: Date;
      nextReviewDate: Date;
      masteryLevel: number;
      status: string;
    }
  ): Promise<QuranMemorization> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    
    const [updated] = await db!.update(quranMemorization)
      .set({
        lastReviewed: reviewData.lastReviewed,
        nextReviewDate: reviewData.nextReviewDate,
        lastDifficulty: reviewData.difficulty,
        reviewCount: reviewData.reviewCount,
        masteryLevel: reviewData.masteryLevel,
        status: reviewData.status,
        updatedAt: new Date(),
      })
      .where(eq(quranMemorization.id, id))
      .returning();
    
    return updated;
  }

  // Quran reading statistics operations
  async createOrUpdateReadingStats(stats: InsertQuranReadingStats): Promise<QuranReadingStats> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    
    // Check if stats already exist for this student and date
    const existing = await db!.select().from(quranReadingStats)
      .where(and(
        eq(quranReadingStats.studentId, stats.studentId),
        eq(quranReadingStats.readingDate, stats.readingDate)
      ));
    
    if (existing.length > 0) {
      // Update existing stats
      const [updated] = await db!.update(quranReadingStats)
        .set({
          ayahsRead: stats.ayahsRead,
          pagesRead: stats.pagesRead,
          minutesSpent: stats.minutesSpent,
          surahsCompleted: stats.surahsCompleted,
        })
        .where(eq(quranReadingStats.id, existing[0].id))
        .returning();
      return updated;
    } else {
      // Create new stats
      const [newStats] = await db!.insert(quranReadingStats).values(stats).returning();
      return newStats;
    }
  }

  async getStudentReadingStats(studentId: string, startDate?: string, endDate?: string): Promise<QuranReadingStats[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    
    let query = db!.select().from(quranReadingStats)
      .where(eq(quranReadingStats.studentId, studentId))
      .$dynamic();
    
    if (startDate && endDate) {
      query = query.where(and(
        gte(quranReadingStats.readingDate, startDate),
        lte(quranReadingStats.readingDate, endDate)
      ));
    }
    
    return await query.orderBy(desc(quranReadingStats.readingDate));
  }

  async getTodayReadingStats(studentId: string): Promise<QuranReadingStats | undefined> {
    if (!this.isDbAvailable()) {
      return undefined;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const [stats] = await db!.select().from(quranReadingStats)
      .where(and(
        eq(quranReadingStats.studentId, studentId),
        eq(quranReadingStats.readingDate, today)
      ));
    
    return stats;
  }

  // Quran ayah markers operations
  async createAyahMarker(marker: InsertQuranAyahMarker): Promise<QuranAyahMarker> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const [newMarker] = await db!.insert(quranAyahMarkers).values(marker).returning();
    return newMarker;
  }

  async getStudentAyahMarkers(studentId: string): Promise<QuranAyahMarker[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return db!.select().from(quranAyahMarkers).where(eq(quranAyahMarkers.studentId, studentId));
  }

  async updateAyahMarker(id: string, updates: Partial<InsertQuranAyahMarker>): Promise<QuranAyahMarker> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const [updated] = await db!.update(quranAyahMarkers).set(updates).where(eq(quranAyahMarkers.id, id)).returning();
    return updated;
  }

  async deleteAyahMarker(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    await db!.delete(quranAyahMarkers).where(eq(quranAyahMarkers.id, id));
  }

  // Quran notes operations
  async createQuranNote(note: InsertQuranNote): Promise<QuranNote> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const [newNote] = await db!.insert(quranNotes).values(note).returning();
    return newNote;
  }

  async getStudentQuranNotes(studentId: string, surahNumber?: number, ayahNumber?: number): Promise<QuranNote[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    
    let query = db!.select().from(quranNotes).where(eq(quranNotes.studentId, studentId)).$dynamic();
    
    if (surahNumber !== undefined && ayahNumber !== undefined) {
      query = query.where(and(
        eq(quranNotes.surahNumber, surahNumber),
        eq(quranNotes.ayahNumber, ayahNumber)
      ));
    }
    
    return await query.orderBy(desc(quranNotes.createdAt));
  }

  async updateQuranNote(id: string, updates: Partial<InsertQuranNote>): Promise<QuranNote> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const [updated] = await db!.update(quranNotes).set(updates).where(eq(quranNotes.id, id)).returning();
    return updated;
  }

  async deleteQuranNote(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    await db!.delete(quranNotes).where(eq(quranNotes.id, id));
  }

  // Quran recitation attempts operations
  async createRecitationAttempt(attempt: InsertQuranRecitationAttempt): Promise<QuranRecitationAttempt> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const [newAttempt] = await db!.insert(quranRecitationAttempts).values(attempt).returning();
    return newAttempt;
  }

  async getStudentRecitationAttempts(studentId: string): Promise<QuranRecitationAttempt[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return db!.select().from(quranRecitationAttempts).where(eq(quranRecitationAttempts.studentId, studentId));
  }

  // Daily assignments operations
  async createDailyAssignment(assignment: InsertDailyAssignment): Promise<DailyAssignment> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const [newAssignment] = await db!.insert(dailyAssignments).values(assignment).returning();
    return newAssignment;
  }

  async getDailyAssignment(studentId: string, date: string): Promise<DailyAssignment | undefined> {
    if (!this.isDbAvailable()) {
      return undefined;
    }
    const [assignment] = await db!.select().from(dailyAssignments)
      .where(and(eq(dailyAssignments.studentId, studentId), eq(dailyAssignments.assignmentDate, date)));
    return assignment;
  }

  async getDailyAssignments(studentId: string): Promise<DailyAssignment[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return db!.select().from(dailyAssignments).where(eq(dailyAssignments.studentId, studentId)).orderBy(desc(dailyAssignments.assignmentDate));
  }

  async getAllDailyAssignments(): Promise<DailyAssignment[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return db!.select().from(dailyAssignments).orderBy(desc(dailyAssignments.assignmentDate));
  }

  // Session access operations
  async enableSessionAccess(access: InsertSessionAccess): Promise<SessionAccess> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const [newAccess] = await db!.insert(sessionAccess).values(access).returning();
    return newAccess;
  }

  async getSessionAccess(studentId: string, sessionDate: string): Promise<SessionAccess | undefined> {
    if (!this.isDbAvailable()) {
      return undefined;
    }
    const [access] = await db!.select().from(sessionAccess)
      .where(and(eq(sessionAccess.studentId, studentId), eq(sessionAccess.sessionDate, sessionDate)));
    return access;
  }

  async getAllSessionAccess(studentId: string): Promise<SessionAccess[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return db!.select().from(sessionAccess).where(eq(sessionAccess.studentId, studentId)).orderBy(desc(sessionAccess.sessionDate));
  }
}

export const storage = new DatabaseStorage();
