import {
  users,
  courses,
  instructors,
  courseEnrollments,
  courseModules,
  courseStages,
  courseUploads,
  examQuestions,
  examAttempts,
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
  liveAnnotations,
  liveRooms,
  roomParticipants,
  messages,
  notifications,
  shoppingCart,
  subscriptionPlans,
  subscriptions,
  paymentTransactions,
  paymentGatewaySettings,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type Instructor,
  type InsertInstructor,
  type CourseEnrollment,
  type InsertEnrollment,
  type CourseModule,
  type InsertCourseModule,
  type CourseStage,
  type InsertCourseStage,
  type CourseUpload,
  type InsertCourseUpload,
  type ExamQuestion,
  type InsertExamQuestion,
  type ExamAttempt,
  type InsertExamAttempt,
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
  type LiveAnnotation,
  type InsertLiveAnnotation,
  type LiveRoom,
  type InsertLiveRoom,
  type RoomParticipant,
  type InsertRoomParticipant,
  type Message,
  type InsertMessage,
  type Notification,
  type InsertNotification,
  type ShoppingCartItem,
  type InsertShoppingCartItem,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type Subscription,
  type InsertSubscription,
  type PaymentTransaction,
  type InsertPaymentTransaction,
  type PaymentGatewaySettings,
  type InsertPaymentGatewaySettings,
} from "@shared/schema";
import { db } from "./db";
import { jsonStorage } from "./jsonStorage";
import { hashPassword, verifyPassword } from "./authUtils";
import { eq, and, gte, lte, lt, desc, sql } from "drizzle-orm";

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
  deleteCourse(id: string): Promise<void>;
  archiveCourse(id: string): Promise<Course>;
  
  // Course module operations
  getCourseModules(courseId: string): Promise<CourseModule[]>;
  getCourseModule(id: string): Promise<CourseModule | undefined>;
  createCourseModule(module: InsertCourseModule): Promise<CourseModule>;
  updateCourseModule(id: string, module: Partial<InsertCourseModule>): Promise<CourseModule>;
  deleteCourseModule(id: string): Promise<void>;
  
  // Course stage operations
  getCourseStages(moduleId: string): Promise<CourseStage[]>;
  getCourseStage(id: string): Promise<CourseStage | undefined>;
  createCourseStage(stage: InsertCourseStage): Promise<CourseStage>;
  updateCourseStage(id: string, stage: Partial<InsertCourseStage>): Promise<CourseStage>;
  deleteCourseStage(id: string): Promise<void>;
  
  // Course upload operations
  getCourseUploads(stageId: string): Promise<CourseUpload[]>;
  getCourseUpload(id: string): Promise<CourseUpload | undefined>;
  createCourseUpload(upload: InsertCourseUpload): Promise<CourseUpload>;
  updateCourseUpload(id: string, upload: Partial<InsertCourseUpload>): Promise<CourseUpload>;
  deleteCourseUpload(id: string): Promise<void>;
  
  // Exam question operations
  getExamQuestions(courseId: string): Promise<ExamQuestion[]>;
  getExamQuestion(id: string): Promise<ExamQuestion | undefined>;
  createExamQuestion(question: InsertExamQuestion): Promise<ExamQuestion>;
  updateExamQuestion(id: string, question: Partial<InsertExamQuestion>): Promise<ExamQuestion>;
  deleteExamQuestion(id: string): Promise<void>;
  
  // Exam attempt operations
  getStudentExamAttempts(studentId: string, courseId?: string): Promise<ExamAttempt[]>;
  getExamAttempt(id: string): Promise<ExamAttempt | undefined>;
  createExamAttempt(attempt: InsertExamAttempt): Promise<ExamAttempt>;
  updateExamAttempt(id: string, attempt: Partial<InsertExamAttempt>): Promise<ExamAttempt>;
  
  // Instructor operations
  getInstructors(): Promise<Instructor[]>;
  getActiveInstructors(): Promise<Instructor[]>;
  getInstructor(id: string): Promise<Instructor | undefined>;
  createInstructor(instructor: InsertInstructor): Promise<Instructor>;
  
  // Enrollment operations
  enrollUserInCourse(enrollment: InsertEnrollment): Promise<CourseEnrollment>;
  getUserEnrollments(userId: string): Promise<CourseEnrollment[]>;
  getCourseEnrollments(courseId: string): Promise<CourseEnrollment[]>;
  updateEnrollmentProgress(userId: string, courseId: string, progress: number): Promise<CourseEnrollment>;
  
  // Contact operations
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  
  // Student operations
  createStudent(student: InsertStudent): Promise<Student>;
  getAllStudents(): Promise<Student[]>;
  deleteAllStudents(): Promise<number>;
  getStudent(id: string): Promise<Student | undefined>;
  authenticateStudent(studentName: string, password: string): Promise<Student | undefined>;
  
  // Enrollment payment operations
  createEnrollment(enrollment: any): Promise<any>;
  createPayment(payment: any): Promise<any>;
  getEnrollmentsByUser(userId: string): Promise<any[]>;
  updateEnrollmentStatus(enrollmentId: string, status: string): Promise<any>;
  
  // Student session operations
  createStudentSession(session: InsertStudentSession): Promise<StudentSession>;
  getStudentSessions(studentId: string): Promise<StudentSession[]>;
  updateStudentSessionAttendance(sessionId: string, attended: boolean): Promise<StudentSession>;
  
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
  updateStudentError(errorId: string, updates: Partial<InsertStudentError>): Promise<StudentError>;
  deleteStudentError(errorId: string): Promise<void>;
  
  // Student payment operations
  createStudentPayment(payment: InsertStudentPayment): Promise<StudentPayment>;
  getStudentPayments(studentId: string): Promise<StudentPayment[]>;
  getAllPayments(): Promise<StudentPayment[]>;
  
  // Class schedule operations
  createClassSchedule(schedule: InsertClassSchedule): Promise<ClassSchedule>;
  getStudentSchedules(studentId: string): Promise<ClassSchedule[]>;
  updateClassSchedule(id: string, updates: Partial<InsertClassSchedule>): Promise<ClassSchedule>;
  deleteClassSchedule(id: string): Promise<void>;
  
  // Bulk export operations
  getAllCourses(): Promise<Course[]>;
  getAllInstructors(): Promise<Instructor[]>;
  getAllEnrollments(): Promise<CourseEnrollment[]>;
  getAllStudentSessions(): Promise<StudentSession[]>;
  getAllStudentErrors(): Promise<StudentError[]>;
  
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
  
  // Message operations
  getMessagesForUser(userId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
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
  upsertSessionAccess(access: InsertSessionAccess): Promise<SessionAccess>;
  cleanupExpiredSessions(): Promise<number>;
  
  // Live annotation operations
  createLiveAnnotation(annotation: InsertLiveAnnotation): Promise<LiveAnnotation>;
  getStudentAnnotations(studentId: string, surahNumber?: number, ayahNumber?: number): Promise<LiveAnnotation[]>;
  getAnnotationsByAyah(studentId: string, surahNumber: number, ayahNumber: number): Promise<LiveAnnotation[]>;
  updateLiveAnnotation(id: string, updates: Partial<InsertLiveAnnotation>): Promise<LiveAnnotation>;
  deleteLiveAnnotation(id: string): Promise<void>;
  getSessionAccess(studentId: string, sessionDate: string): Promise<SessionAccess | undefined>;
  getAllSessionAccess(studentId: string): Promise<SessionAccess[]>;
  
  // Shopping cart operations
  addToCart(item: InsertShoppingCartItem): Promise<ShoppingCartItem>;
  getCartItems(userId: string): Promise<ShoppingCartItem[]>;
  removeFromCart(userId: string, courseId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  getSheikhSessions(sheikhId: string, range?: 'upcoming' | 'past' | 'today'): Promise<import('@shared/schema').SheikhSessionView[]>;
  
  // Live room operations
  createOrGetLiveRoom(studentId: string, sheikhId: string, sessionDate: Date, sessionTime: string): Promise<LiveRoom>;
  createOrActivateLiveRoom(studentId: string, sheikhId: string, sessionDate: Date, sessionTime: string): Promise<LiveRoom>;
  getLiveRoomByToken(roomToken: string): Promise<LiveRoom | undefined>;
  getLiveRoomsByStudent(studentId: string): Promise<LiveRoom[]>;
  getAllLiveRooms(): Promise<LiveRoom[]>;
  updateLiveRoomStatus(roomId: string, status: string): Promise<LiveRoom>;
  updateLiveRoom(roomId: string, updates: Partial<LiveRoom>): Promise<LiveRoom>;
  addRoomParticipant(participant: InsertRoomParticipant): Promise<RoomParticipant>;
  removeRoomParticipant(roomId: string, userId: string): Promise<void>;
  getRoomParticipants(roomId: string): Promise<RoomParticipant[]>;
  
  // Notification operations
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string, userId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(id: string, userId: string): Promise<void>;
  
  // Subscription plan operations
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: string, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan>;
  deleteSubscriptionPlan(id: string): Promise<void>;
  
  // Subscription operations
  getSubscription(id: string): Promise<Subscription | undefined>;
  getUserActiveSubscription(userId: string): Promise<Subscription | undefined>;
  getUserSubscriptions(userId: string): Promise<Subscription[]>;
  getAllSubscriptions(filters: { status?: string; page?: number; limit?: number }): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription>;
  cancelSubscription(id: string, reason?: string): Promise<Subscription>;
  
  // Payment transaction operations
  getUserPaymentTransactions(userId: string): Promise<PaymentTransaction[]>;
  getAllPaymentTransactions(filters: { status?: string; gateway?: string; page?: number; limit?: number }): Promise<PaymentTransaction[]>;
  createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction>;
  updatePaymentTransaction(id: string, transaction: Partial<InsertPaymentTransaction>): Promise<PaymentTransaction>;
  
  // Payment gateway settings operations
  getEnabledPaymentGateways(): Promise<PaymentGatewaySettings[]>;
  getAllPaymentGatewaySettings(): Promise<PaymentGatewaySettings[]>;
  updatePaymentGatewaySettings(gateway: string, settings: Partial<InsertPaymentGatewaySettings>): Promise<PaymentGatewaySettings>;
  
  // Admin dashboard operations
  getDashboardStats(): Promise<{
    totalStudents: number;
    totalTeachers: number;
    totalGroups: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    pendingPayments: number;
  }>;
  getStudentsCount(): Promise<number>;
  getTeachersCount(): Promise<number>;
  getGroupsCount(): Promise<number>;
  getSubscriptionStats(): Promise<{ active: number; expired: number; pending: number; cancelled: number }>;
  getAttendanceReport(filters: { date?: string; startDate?: string; endDate?: string }): Promise<any>;
  getRevenueReport(filters: { period: string; startDate?: string; endDate?: string }): Promise<any>;
  getOverduePayments(): Promise<any[]>;
  getStudentProgressReport(filters: { studentId?: string; teacherId?: string }): Promise<any>;
  getTeachers(): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User>;
  updateUserStatus(id: string, isActive: boolean): Promise<User>;
  getContactMessages(filters: { isRead?: boolean; page?: number; limit?: number }): Promise<ContactMessage[]>;
  markMessageAsRead(id: string): Promise<ContactMessage>;
  assignStudentToTeacher(teacherId: string, studentId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  private isDbAvailable(): boolean {
    return db !== null;
  }

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    if (this.isDbAvailable()) {
      const [user] = await db!.select().from(users).where(eq(users.id, id));
      return user;
    }

    // JSON fallback - try to read from users.json
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.find(u => u.id === id);
    } catch {
      return undefined;
    }
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
    if (this.isDbAvailable()) {
      return await db!.select().from(users).where(eq(users.isActive, true));
    }

    // JSON fallback - try to read from users.json
    try {
      const usersData = await jsonStorage.readJSON('users.json');
      return Array.isArray(usersData) ? usersData.filter(u => u.isActive !== false) : [];
    } catch {
      return [];
    }
  }

  async updateUserProfile(id: string, data: Partial<User>): Promise<User> {
    if (this.isDbAvailable()) {
      const [user] = await db!
        .update(users)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return user;
    }

    // JSON fallback
    const allUsers = await this.getAllUsers();
    const userIndex = allUsers.findIndex(u => u.id === id);
    if (userIndex === -1) throw new Error("User not found");
    
    const updated = { ...allUsers[userIndex], ...data, updatedAt: new Date() };
    const updatedUsers = [...allUsers.slice(0, userIndex), updated, ...allUsers.slice(userIndex + 1)];
    await jsonStorage.writeJSON('users.json', updatedUsers);
    return updated;
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    if (this.isDbAvailable()) {
      const [user] = await db!
        .select()
        .from(users)
        .where(eq(users.phoneNumber, phoneNumber));
      return user;
    }

    // JSON fallback
    const allUsers = await this.getAllUsers();
    return allUsers.find(u => u.phoneNumber === phoneNumber);
  }

  async createUserWithPhone(data: { firstName: string; phoneNumber: string; passwordHash: string; role: string }): Promise<User> {
    if (this.isDbAvailable()) {
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

    // JSON fallback for development/testing
    const newUser: User = {
      id: `user_${Date.now()}`,
      firstName: data.firstName,
      phoneNumber: data.phoneNumber,
      passwordHash: data.passwordHash,
      role: data.role as any,
      email: null,
      isActive: true,
      registrationCompleted: true,
      emailVerified: false,
    };
    
    const allUsers = await this.getAllUsers();
    const updatedUsers = [...allUsers, newUser];
    await jsonStorage.writeJSON('users.json', updatedUsers);
    return newUser;
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

  async deleteCourse(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("Course deletion not available in JSON mode");
    }
    await db!.delete(courses).where(eq(courses.id, id));
  }

  async archiveCourse(id: string): Promise<Course> {
    if (!this.isDbAvailable()) {
      throw new Error("Course archival not available in JSON mode");
    }
    const [archivedCourse] = await db!
      .update(courses)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return archivedCourse;
  }

  // Course module operations
  async getCourseModules(courseId: string): Promise<CourseModule[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId))
      .orderBy(courseModules.orderIndex);
  }

  async getCourseModule(id: string): Promise<CourseModule | undefined> {
    if (!this.isDbAvailable()) {
      return undefined;
    }
    const [module] = await db!.select().from(courseModules).where(eq(courseModules.id, id));
    return module;
  }

  async createCourseModule(module: InsertCourseModule): Promise<CourseModule> {
    if (!this.isDbAvailable()) {
      throw new Error("Course module creation not available in JSON mode");
    }
    const [newModule] = await db!.insert(courseModules).values(module).returning();
    return newModule;
  }

  async updateCourseModule(id: string, module: Partial<InsertCourseModule>): Promise<CourseModule> {
    if (!this.isDbAvailable()) {
      throw new Error("Course module updates not available in JSON mode");
    }
    const [updatedModule] = await db!
      .update(courseModules)
      .set({ ...module, updatedAt: new Date() })
      .where(eq(courseModules.id, id))
      .returning();
    return updatedModule;
  }

  async deleteCourseModule(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("Course module deletion not available in JSON mode");
    }
    await db!.delete(courseModules).where(eq(courseModules.id, id));
  }

  // Course stage operations
  async getCourseStages(moduleId: string): Promise<CourseStage[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!
      .select()
      .from(courseStages)
      .where(eq(courseStages.moduleId, moduleId))
      .orderBy(courseStages.orderIndex);
  }

  async getCourseStage(id: string): Promise<CourseStage | undefined> {
    if (!this.isDbAvailable()) {
      return undefined;
    }
    const [stage] = await db!.select().from(courseStages).where(eq(courseStages.id, id));
    return stage;
  }

  async createCourseStage(stage: InsertCourseStage): Promise<CourseStage> {
    if (!this.isDbAvailable()) {
      throw new Error("Course stage creation not available in JSON mode");
    }
    const [newStage] = await db!.insert(courseStages).values(stage).returning();
    return newStage;
  }

  async updateCourseStage(id: string, stage: Partial<InsertCourseStage>): Promise<CourseStage> {
    if (!this.isDbAvailable()) {
      throw new Error("Course stage updates not available in JSON mode");
    }
    const [updatedStage] = await db!
      .update(courseStages)
      .set({ ...stage, updatedAt: new Date() })
      .where(eq(courseStages.id, id))
      .returning();
    return updatedStage;
  }

  async deleteCourseStage(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("Course stage deletion not available in JSON mode");
    }
    await db!.delete(courseStages).where(eq(courseStages.id, id));
  }

  // Course upload operations
  async getCourseUploads(stageId: string): Promise<CourseUpload[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!
      .select()
      .from(courseUploads)
      .where(eq(courseUploads.stageId, stageId))
      .orderBy(courseUploads.createdAt);
  }

  async getCourseUpload(id: string): Promise<CourseUpload | undefined> {
    if (!this.isDbAvailable()) {
      return undefined;
    }
    const [upload] = await db!.select().from(courseUploads).where(eq(courseUploads.id, id));
    return upload;
  }

  async createCourseUpload(upload: InsertCourseUpload): Promise<CourseUpload> {
    if (!this.isDbAvailable()) {
      throw new Error("Course upload creation not available in JSON mode");
    }
    const [newUpload] = await db!.insert(courseUploads).values(upload).returning();
    return newUpload;
  }

  async updateCourseUpload(id: string, upload: Partial<InsertCourseUpload>): Promise<CourseUpload> {
    if (!this.isDbAvailable()) {
      throw new Error("Course upload updates not available in JSON mode");
    }
    const [updatedUpload] = await db!
      .update(courseUploads)
      .set({ ...upload, updatedAt: new Date() })
      .where(eq(courseUploads.id, id))
      .returning();
    return updatedUpload;
  }

  async deleteCourseUpload(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("Course upload deletion not available in JSON mode");
    }
    await db!.delete(courseUploads).where(eq(courseUploads.id, id));
  }

  // Exam question operations
  async getExamQuestions(courseId: string): Promise<ExamQuestion[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!
      .select()
      .from(examQuestions)
      .where(eq(examQuestions.courseId, courseId));
  }

  async getExamQuestion(id: string): Promise<ExamQuestion | undefined> {
    if (!this.isDbAvailable()) {
      return undefined;
    }
    const [question] = await db!.select().from(examQuestions).where(eq(examQuestions.id, id));
    return question;
  }

  async createExamQuestion(question: InsertExamQuestion): Promise<ExamQuestion> {
    if (!this.isDbAvailable()) {
      throw new Error("Exam question creation not available in JSON mode");
    }
    const [newQuestion] = await db!.insert(examQuestions).values(question).returning();
    return newQuestion;
  }

  async updateExamQuestion(id: string, question: Partial<InsertExamQuestion>): Promise<ExamQuestion> {
    if (!this.isDbAvailable()) {
      throw new Error("Exam question updates not available in JSON mode");
    }
    const [updatedQuestion] = await db!
      .update(examQuestions)
      .set(question)
      .where(eq(examQuestions.id, id))
      .returning();
    return updatedQuestion;
  }

  async deleteExamQuestion(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("Exam question deletion not available in JSON mode");
    }
    await db!.delete(examQuestions).where(eq(examQuestions.id, id));
  }

  // Exam attempt operations
  async getStudentExamAttempts(studentId: string, courseId?: string): Promise<ExamAttempt[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    if (courseId) {
      return await db!
        .select()
        .from(examAttempts)
        .where(and(eq(examAttempts.studentId, studentId), eq(examAttempts.courseId, courseId)))
        .orderBy(desc(examAttempts.createdAt));
    }
    return await db!
      .select()
      .from(examAttempts)
      .where(eq(examAttempts.studentId, studentId))
      .orderBy(desc(examAttempts.createdAt));
  }

  async getExamAttempt(id: string): Promise<ExamAttempt | undefined> {
    if (!this.isDbAvailable()) {
      return undefined;
    }
    const [attempt] = await db!.select().from(examAttempts).where(eq(examAttempts.id, id));
    return attempt;
  }

  async createExamAttempt(attempt: InsertExamAttempt): Promise<ExamAttempt> {
    if (!this.isDbAvailable()) {
      throw new Error("Exam attempt creation not available in JSON mode");
    }
    const [newAttempt] = await db!.insert(examAttempts).values(attempt).returning();
    return newAttempt;
  }

  async updateExamAttempt(id: string, attempt: Partial<InsertExamAttempt>): Promise<ExamAttempt> {
    if (!this.isDbAvailable()) {
      throw new Error("Exam attempt updates not available in JSON mode");
    }
    const [updatedAttempt] = await db!
      .update(examAttempts)
      .set(attempt)
      .where(eq(examAttempts.id, id))
      .returning();
    return updatedAttempt;
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

  async updateEnrollmentProgress(userId: string, courseId: string, progress: number): Promise<CourseEnrollment> {
    if (!this.isDbAvailable()) {
      throw new Error("Enrollment progress update not available in JSON mode");
    }
    const [updatedEnrollment] = await db!
      .update(courseEnrollments)
      .set({
        progress,
        updatedAt: new Date(),
      })
      .where(and(
        eq(courseEnrollments.userId, userId),
        eq(courseEnrollments.courseId, courseId)
      ))
      .returning();
    
    if (!updatedEnrollment) {
      throw new Error("Enrollment not found");
    }
    
    return updatedEnrollment;
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
        whatsappContact: '+966532441566',
        sheikhId: null,
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
        whatsappContact: '+966532441566',
        sheikhId: null,
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
        sheikhId: null,
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
        sheikhId: null,
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

  async updateStudentSessionAttendance(sessionId: string, attended: boolean): Promise<StudentSession> {
    if (!this.isDbAvailable()) {
      throw new Error("Session attendance update not available in JSON mode");
    }
    const [updatedSession] = await db!
      .update(studentSessions)
      .set({ attended })
      .where(eq(studentSessions.id, sessionId))
      .returning();
    
    if (!updatedSession) {
      throw new Error("Session not found");
    }
    
    return updatedSession;
  }

  // Student error operations
  async createStudentError(error: InsertStudentError): Promise<StudentError> {
    if (!this.isDbAvailable()) {
      const errorData: StudentError = {
        id: `error_${Date.now()}`,
        studentId: error.studentId,
        sheikhId: error.sheikhId || null,
        surahNumber: error.surahNumber,
        surahName: error.surahName,
        ayahNumber: error.ayahNumber,
        wordIndex: error.wordIndex || null,
        errorType: error.errorType ?? 'recitation',
        errorDescription: error.errorDescription || null,
        sheikhNote: error.sheikhNote || null,
        severity: error.severity ?? 'medium',
        isResolved: error.isResolved ?? false,
        resolvedDate: error.resolvedDate ? (typeof error.resolvedDate === 'string' ? error.resolvedDate : new Date().toISOString().split('T')[0]) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
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

  async updateStudentError(errorId: string, updates: Partial<InsertStudentError>): Promise<StudentError> {
    if (!this.isDbAvailable()) {
      throw new Error('Database not available');
    }

    const [updated] = await db!
      .update(studentErrors)
      .set(updates as any)
      .where(eq(studentErrors.id, errorId))
      .returning();
    
    return updated;
  }

  async deleteStudentError(errorId: string): Promise<void> {
    if (!this.isDbAvailable()) {
      // JSON fallback: read all students, find and remove the error, then save
      const students = await jsonStorage.readJSON('data/students.json');
      let errorFound = false;
      const updatedStudents = students.map((student: any) => {
        if (student.errors && Array.isArray(student.errors)) {
          const originalLength = student.errors.length;
          student.errors = student.errors.filter((e: any) => e.id !== errorId);
          if (student.errors.length < originalLength) {
            errorFound = true;
          }
        }
        return student;
      });
      if (errorFound) {
        await jsonStorage.writeJSON('data/students.json', updatedStudents);
      }
      return;
    }
    await db!.delete(studentErrors).where(eq(studentErrors.id, errorId));
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

  async getAllPayments(): Promise<StudentPayment[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!
      .select()
      .from(studentPayments)
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
    
    return allMemorization.filter((mem: QuranMemorization) => {
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

  async upsertSessionAccess(access: InsertSessionAccess): Promise<SessionAccess> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    
    // Check if session access exists for this student, schedule and date
    const existing = await db!.select().from(sessionAccess)
      .where(and(
        eq(sessionAccess.studentId, access.studentId),
        eq(sessionAccess.scheduleId, access.scheduleId!),
        eq(sessionAccess.sessionDate, access.sessionDate)
      ));
    
    if (existing.length > 0) {
      // Update existing session access
      const [updated] = await db!.update(sessionAccess)
        .set({
          ...access,
          enabledAt: new Date(),
        })
        .where(eq(sessionAccess.id, existing[0].id))
        .returning();
      return updated;
    } else {
      // Insert new session access
      const [newAccess] = await db!.insert(sessionAccess).values({
        ...access,
        enabledAt: new Date(),
      }).returning();
      return newAccess;
    }
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
    // Select only existing columns explicitly
    return db!
      .select({
        id: sessionAccess.id,
        studentId: sessionAccess.studentId,
        scheduleId: sessionAccess.scheduleId,
        sessionDate: sessionAccess.sessionDate,
        startTime: sessionAccess.startTime,
        endTime: sessionAccess.endTime,
        zoomLink: sessionAccess.zoomLink,
        isEnabled: sessionAccess.isEnabled,
        enabledBy: sessionAccess.enabledBy,
        enabledAt: sessionAccess.enabledAt,
      })
      .from(sessionAccess)
      .where(eq(sessionAccess.studentId, studentId))
      .orderBy(desc(sessionAccess.sessionDate));
  }

  async cleanupExpiredSessions(): Promise<number> {
    if (!this.isDbAvailable()) {
      return 0;
    }
    
    try {
      const { lte, lt } = await import('drizzle-orm');
      
      // حذف الحصص التي انتهت (تاريخها + وقتها أقدم من الوقت الحالي)
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5); // HH:mm
      
      // حذف الحصص من الأيام الماضية (قبل اليوم)
      const deletedOldDays = await db!.delete(sessionAccess)
        .where(lt(sessionAccess.sessionDate, today))
        .returning({ id: sessionAccess.id });
      
      // حذف الحصص من اليوم الحالي التي انتهى وقتها
      const deletedToday = await db!.delete(sessionAccess)
        .where(
          and(
            eq(sessionAccess.sessionDate, today),
            lte(sessionAccess.endTime, currentTime)
          )
        )
        .returning({ id: sessionAccess.id });
      
      // حذف LiveRooms المنتهية (التي أقدم من 24 ساعة)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const deletedRooms = await db!.delete(liveRooms)
        .where(lt(liveRooms.sessionDate, oneDayAgo))
        .returning({ id: liveRooms.id });
      
      const totalDeleted = deletedOldDays.length + deletedToday.length + deletedRooms.length;
      
      if (totalDeleted > 0) {
        console.log(`🗑️  تم تنظيف ${totalDeleted} حصة منتهية (${deletedOldDays.length + deletedToday.length} حصص + ${deletedRooms.length} غرف مباشرة)`);
      }
      
      return totalDeleted;
    } catch (error) {
      console.error('❌ خطأ في تنظيف الحصص المنتهية:', error);
      return 0;
    }
  }

  async getSheikhSessions(sheikhId: string, range?: 'upcoming' | 'past' | 'today'): Promise<import('@shared/schema').SheikhSessionView[]> {
    if (!this.isDbAvailable()) {
      return [];
    }

    // Get all schedules for students assigned to this sheikh
    const schedules = await db!
      .select({
        scheduleId: classSchedules.id,
        studentId: classSchedules.studentId,
        dayOfWeek: classSchedules.dayOfWeek,
        startTime: classSchedules.startTime,
        endTime: classSchedules.endTime,
        studentName: students.studentName,
        studentPhone: students.phoneNumber,
      })
      .from(classSchedules)
      .innerJoin(students, eq(classSchedules.studentId, students.id))
      .where(and(
        eq(students.sheikhId, sheikhId),
        eq(classSchedules.isActive, true)
      ));

    // Expand schedules into concrete dates for next 4 weeks
    const today = new Date();
    const fourWeeksLater = new Date(today);
    fourWeeksLater.setDate(today.getDate() + 28);

    const expandedSessions: Array<{
      scheduleId: string;
      studentId: string;
      sessionDate: string;
      startTime: string;
      endTime: string;
      studentName: string;
      studentPhone: string | null;
    }> = [];

    for (const schedule of schedules) {
      // Find all occurrences of this schedule in the next 4 weeks
      const currentDate = new Date(today);
      while (currentDate <= fourWeeksLater) {
        if (currentDate.getDay() === schedule.dayOfWeek) {
          expandedSessions.push({
            scheduleId: schedule.scheduleId,
            studentId: schedule.studentId,
            sessionDate: currentDate.toISOString().split('T')[0],
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            studentName: schedule.studentName,
            studentPhone: schedule.studentPhone,
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Get all sessionAccess entries for these schedules
    const sessionAccessMap = new Map<string, any>();
    const scheduleIds = [...new Set(expandedSessions.map(s => s.scheduleId))];
    
    if (scheduleIds.length > 0) {
      const accessRecords = await db!
        .select()
        .from(sessionAccess)
        .where(sql`${sessionAccess.scheduleId} IN (${sql.join(scheduleIds.map(id => sql`${id}`), sql`, `)})`);

      for (const record of accessRecords) {
        const key = `${record.scheduleId}-${record.sessionDate}`;
        sessionAccessMap.set(key, record);
      }
    }

    // Helper to normalize date to YYYY-MM-DD format
    const normalizeDate = (date: Date | string): string => {
      if (typeof date === 'string') {
        return date.split('T')[0];
      }
      return date.toISOString().split('T')[0];
    };

    // Get live rooms for matching sessions
    const roomsMap = new Map<string, any>();
    const studentIds = [...new Set(expandedSessions.map(s => s.studentId))];
    
    if (studentIds.length > 0) {
      const rooms = await db!
        .select()
        .from(liveRooms)
        .where(sql`${liveRooms.studentId} IN (${sql.join(studentIds.map(id => sql`${id}`), sql`, `)})`);

      for (const room of rooms) {
        if (room.sessionDate) {
          const normalizedDate = normalizeDate(room.sessionDate);
          const key = `${room.studentId}-${normalizedDate}`;
          roomsMap.set(key, room);
        }
      }
    }

    // Merge expanded sessions with sessionAccess and liveRooms
    const mergedSessions = expandedSessions.map(session => {
      const accessKey = `${session.scheduleId}-${session.sessionDate}`;
      const access = sessionAccessMap.get(accessKey);
      
      const normalizedSessionDate = normalizeDate(session.sessionDate);
      const roomKey = `${session.studentId}-${normalizedSessionDate}`;
      const room = roomsMap.get(roomKey);

      return {
        id: access?.id || `${session.scheduleId}-${session.sessionDate}`,
        studentId: session.studentId,
        scheduleId: session.scheduleId,
        sessionDate: session.sessionDate,
        startTime: session.startTime,
        endTime: session.endTime,
        zoomLink: access?.zoomLink || null,
        isEnabled: access?.isEnabled || false,
        enabledBy: access?.enabledBy || null,
        enabledAt: access?.enabledAt || null,
        studentName: session.studentName,
        studentPhone: session.studentPhone,
        roomToken: room?.roomToken || null,
        roomId: room?.id || null,
        roomStatus: room?.status || null,
      };
    });

    // Filter by range
    const todayStr = today.toISOString().split('T')[0];
    let filteredSessions = mergedSessions;

    if (range === 'today') {
      filteredSessions = mergedSessions.filter(s => s.sessionDate === todayStr);
    } else if (range === 'upcoming') {
      filteredSessions = mergedSessions.filter(s => s.sessionDate >= todayStr);
    } else if (range === 'past') {
      filteredSessions = mergedSessions.filter(s => s.sessionDate < todayStr);
    }

    // Sort by date
    filteredSessions.sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));

    return filteredSessions;
  }

  // Live annotation operations
  async createLiveAnnotation(annotation: InsertLiveAnnotation): Promise<LiveAnnotation> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const [newAnnotation] = await db!.insert(liveAnnotations).values(annotation).returning();
    return newAnnotation;
  }

  async getStudentAnnotations(studentId: string, surahNumber?: number, ayahNumber?: number): Promise<LiveAnnotation[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    
    // Build predicates array for cleaner composition
    const predicates = [eq(liveAnnotations.studentId, studentId)];
    
    if (surahNumber) {
      predicates.push(eq(liveAnnotations.surahNumber, surahNumber));
    }
    
    if (ayahNumber) {
      predicates.push(eq(liveAnnotations.ayahNumber, ayahNumber));
    }
    
    return db!.select().from(liveAnnotations)
      .where(and(...predicates))
      .orderBy(desc(liveAnnotations.createdAt));
  }

  async getAnnotationsByAyah(studentId: string, surahNumber: number, ayahNumber: number): Promise<LiveAnnotation[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    
    return db!.select().from(liveAnnotations)
      .where(and(
        eq(liveAnnotations.studentId, studentId),
        eq(liveAnnotations.surahNumber, surahNumber),
        eq(liveAnnotations.ayahNumber, ayahNumber)
      ))
      .orderBy(desc(liveAnnotations.createdAt));
  }

  async updateLiveAnnotation(id: string, updates: Partial<InsertLiveAnnotation>): Promise<LiveAnnotation> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const [updated] = await db!.update(liveAnnotations)
      .set(updates)
      .where(eq(liveAnnotations.id, id))
      .returning();
    return updated;
  }

  async deleteLiveAnnotation(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    await db!.delete(liveAnnotations).where(eq(liveAnnotations.id, id));
  }

  // Live room operations
  async createOrGetLiveRoom(studentId: string, sheikhId: string, sessionDate: Date, sessionTime: string): Promise<LiveRoom> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    
    // Normalize sessionDate to YYYY-MM-DD string format
    const normalizedDate = typeof sessionDate === 'string' 
      ? sessionDate.split('T')[0] 
      : sessionDate.toISOString().split('T')[0];
    
    // First try to find existing room by checking date match
    const existingRooms = await db!
      .select()
      .from(liveRooms)
      .where(
        and(
          eq(liveRooms.studentId, studentId),
          eq(liveRooms.sheikhId, sheikhId),
          eq(liveRooms.sessionTime, sessionTime)
        )
      );
    
    // Filter by date in JavaScript to avoid SQL date comparison issues
    const matchingRoom = existingRooms.find(room => {
      const roomDate = room.sessionDate instanceof Date 
        ? room.sessionDate.toISOString().split('T')[0]
        : String(room.sessionDate).split('T')[0];
      return roomDate === normalizedDate;
    });
    
    if (matchingRoom) {
      return matchingRoom;
    }
    
    // Create new room if none exists - only use columns that exist in database
    const [newRoom] = await db!
      .insert(liveRooms)
      .values({
        studentId,
        sheikhId,
        sessionDate: new Date(normalizedDate),
        sessionTime,
        status: 'scheduled',
        isEnabled: false,
      })
      .returning();
    
    return newRoom;
  }

  async createOrActivateLiveRoom(studentId: string, sheikhId: string, sessionDate: Date, sessionTime: string): Promise<LiveRoom> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    
    // First create or get the room
    const room = await this.createOrGetLiveRoom(studentId, sheikhId, sessionDate, sessionTime);
    
    // Then activate it
    const activatedRoom = await this.updateLiveRoomStatus(room.id, 'active');
    
    return activatedRoom;
  }

  async getLiveRoomByToken(roomToken: string): Promise<LiveRoom | undefined> {
    if (!this.isDbAvailable()) {
      return undefined;
    }
    const [room] = await db!.select().from(liveRooms).where(eq(liveRooms.roomToken, roomToken));
    return room;
  }

  async getLiveRoomsByStudent(studentId: string): Promise<LiveRoom[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    // Select only existing columns explicitly
    return db!
      .select({
        id: liveRooms.id,
        studentId: liveRooms.studentId,
        sheikhId: liveRooms.sheikhId,
        sessionDate: liveRooms.sessionDate,
        sessionTime: liveRooms.sessionTime,
        roomToken: liveRooms.roomToken,
        status: liveRooms.status,
        startedAt: liveRooms.startedAt,
        endedAt: liveRooms.endedAt,
        duration: liveRooms.duration,
        isEnabled: liveRooms.isEnabled,
        enabledAt: liveRooms.enabledAt,
        notes: liveRooms.notes,
        createdAt: liveRooms.createdAt,
        updatedAt: liveRooms.updatedAt,
      })
      .from(liveRooms)
      .where(eq(liveRooms.studentId, studentId))
      .orderBy(desc(liveRooms.sessionDate));
  }

  async getAllLiveRooms(): Promise<LiveRoom[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return db!.select().from(liveRooms).orderBy(desc(liveRooms.sessionDate));
  }

  async updateLiveRoomStatus(roomId: string, status: string): Promise<LiveRoom> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const updates: any = { 
      status, 
      updatedAt: new Date() 
    };
    
    // If activating the room, also set isEnabled and enabledAt
    if (status === 'active') {
      updates.isEnabled = true;
      updates.enabledAt = new Date();
    } else if (status === 'scheduled' || status === 'ended') {
      // Clear enablement when room is deactivated
      updates.isEnabled = false;
      updates.enabledAt = null;
    }
    
    const [updatedRoom] = await db!
      .update(liveRooms)
      .set(updates)
      .where(eq(liveRooms.id, roomId))
      .returning();
    return updatedRoom;
  }

  async updateLiveRoom(roomId: string, updates: Partial<LiveRoom>): Promise<LiveRoom> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    const [updatedRoom] = await db!
      .update(liveRooms)
      .set(updateData)
      .where(eq(liveRooms.id, roomId))
      .returning();
    return updatedRoom;
  }

  async addRoomParticipant(participant: InsertRoomParticipant): Promise<RoomParticipant> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    const [newParticipant] = await db!.insert(roomParticipants).values(participant).returning();
    return newParticipant;
  }

  async removeRoomParticipant(roomId: string, userId: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("Database not available");
    }
    await db!
      .update(roomParticipants)
      .set({ isActive: false, leftAt: new Date() })
      .where(and(eq(roomParticipants.roomId, roomId), eq(roomParticipants.userId, userId)));
  }

  async getRoomParticipants(roomId: string): Promise<RoomParticipant[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return db!.select().from(roomParticipants).where(eq(roomParticipants.roomId, roomId));
  }

  // Bulk export operations
  async getAllCourses(): Promise<Course[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!.select().from(courses).orderBy(desc(courses.createdAt));
  }

  async getAllInstructors(): Promise<Instructor[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!.select().from(instructors).orderBy(desc(instructors.createdAt));
  }

  async getAllEnrollments(): Promise<CourseEnrollment[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!.select().from(courseEnrollments).orderBy(desc(courseEnrollments.createdAt));
  }

  async getAllStudentSessions(): Promise<StudentSession[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!.select().from(studentSessions).orderBy(desc(studentSessions.createdAt));
  }

  async getAllStudentErrors(): Promise<StudentError[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    return await db!.select().from(studentErrors).orderBy(desc(studentErrors.createdAt));
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<CourseEnrollment> {
    if (!this.isDbAvailable()) {
      return {
        id: `enrollment_${Date.now()}`,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        enrollmentDate: new Date(),
        status: enrollment.status || 'enrolled',
        progress: enrollment.progress || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    const [newEnrollment] = await db!.insert(courseEnrollments).values(enrollment).returning();
    return newEnrollment;
  }

  async createPayment(payment: InsertStudentPayment): Promise<StudentPayment> {
    return this.createStudentPayment(payment);
  }

  // Message operations
  async getMessagesForUser(userId: string): Promise<Message[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    
    // Get messages where user is sender or receiver
    const userMessages = await db!
      .select()
      .from(messages)
      .where(
        sql`${messages.senderId} = ${userId} OR ${messages.receiverId} = ${userId} OR ${messages.isGroupMessage} = true`
      )
      .orderBy(desc(messages.createdAt));
    
    return userMessages;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    if (!this.isDbAvailable()) {
      const mockMessage: Message = {
        id: `msg_${Date.now()}`,
        senderId: message.senderId,
        receiverId: message.receiverId || null,
        content: message.content,
        messageType: message.messageType || 'text',
        isRead: false,
        readAt: null,
        isGroupMessage: message.isGroupMessage || false,
        roomId: message.roomId || null,
        createdAt: new Date(),
      };
      return mockMessage;
    }
    
    const [newMessage] = await db!.insert(messages).values(message).returning();
    return newMessage;
  }

  // Shopping cart operations
  async addToCart(item: InsertShoppingCartItem): Promise<ShoppingCartItem> {
    if (!this.isDbAvailable()) {
      const mockCartItem: ShoppingCartItem = {
        id: `cart_${Date.now()}`,
        userId: item.userId,
        courseId: item.courseId,
        addedAt: new Date(),
        createdAt: new Date(),
      };
      return mockCartItem;
    }
    
    // Check if item already exists in cart (prevent duplicates)
    const existingItem = await db!
      .select()
      .from(shoppingCart)
      .where(and(
        eq(shoppingCart.userId, item.userId),
        eq(shoppingCart.courseId, item.courseId)
      ))
      .limit(1);
    
    if (existingItem.length > 0) {
      // Item already in cart, return existing item
      return existingItem[0];
    }
    
    const [newCartItem] = await db!.insert(shoppingCart).values(item).returning();
    return newCartItem;
  }

  async getCartItems(userId: string): Promise<ShoppingCartItem[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    
    const cartItems = await db!
      .select()
      .from(shoppingCart)
      .where(eq(shoppingCart.userId, userId))
      .orderBy(desc(shoppingCart.addedAt));
    
    return cartItems;
  }

  async removeFromCart(userId: string, courseId: string): Promise<void> {
    if (!this.isDbAvailable()) {
      return;
    }
    
    await db!
      .delete(shoppingCart)
      .where(and(
        eq(shoppingCart.userId, userId),
        eq(shoppingCart.courseId, courseId)
      ));
  }

  async clearCart(userId: string): Promise<void> {
    if (!this.isDbAvailable()) {
      return;
    }
    
    await db!
      .delete(shoppingCart)
      .where(eq(shoppingCart.userId, userId));
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    if (!this.isDbAvailable()) {
      return [];
    }
    
    const userNotifications = await db!
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    
    return userNotifications;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    if (!this.isDbAvailable()) {
      const mockNotification: Notification = {
        id: `notif_${Date.now()}`,
        ...notification,
        titleEn: notification.titleEn || null,
        messageEn: notification.messageEn || null,
        isRead: false,
        readAt: null,
        actionUrl: notification.actionUrl || null,
        createdAt: new Date(),
      };
      return mockNotification;
    }
    
    const [newNotification] = await db!.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string, userId: string): Promise<void> {
    if (!this.isDbAvailable()) {
      return;
    }
    
    await db!
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    if (!this.isDbAvailable()) {
      return;
    }
    
    await db!
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.userId, userId));
  }

  async deleteNotification(id: string, userId: string): Promise<void> {
    if (!this.isDbAvailable()) {
      return;
    }
    
    await db!
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  // Subscription plan operations
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    if (!this.isDbAvailable()) return [];
    const plans = await db!.select().from(subscriptionPlans).orderBy(subscriptionPlans.sortOrder);
    return plans;
  }

  async getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    if (!this.isDbAvailable()) return [];
    const plans = await db!.select().from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.sortOrder);
    return plans;
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const [plan] = await db!.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    if (!this.isDbAvailable()) throw new Error("Database not available");
    const [newPlan] = await db!.insert(subscriptionPlans).values(plan).returning();
    return newPlan;
  }

  async updateSubscriptionPlan(id: string, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan> {
    if (!this.isDbAvailable()) throw new Error("Database not available");
    const [updated] = await db!.update(subscriptionPlans).set({ ...plan, updatedAt: new Date() })
      .where(eq(subscriptionPlans.id, id)).returning();
    return updated;
  }

  async deleteSubscriptionPlan(id: string): Promise<void> {
    if (!this.isDbAvailable()) return;
    await db!.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
  }

  // Subscription operations
  async getSubscription(id: string): Promise<Subscription | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const [subscription] = await db!.select().from(subscriptions).where(eq(subscriptions.id, id));
    return subscription;
  }

  async getUserActiveSubscription(userId: string): Promise<Subscription | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const [subscription] = await db!.select().from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')));
    return subscription;
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    if (!this.isDbAvailable()) return [];
    const subs = await db!.select().from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt));
    return subs;
  }

  async getAllSubscriptions(filters: { status?: string; page?: number; limit?: number }): Promise<Subscription[]> {
    if (!this.isDbAvailable()) return [];
    let query = db!.select().from(subscriptions);
    if (filters.status) {
      query = query.where(eq(subscriptions.status, filters.status)) as any;
    }
    const subs = await query.orderBy(desc(subscriptions.createdAt))
      .limit(filters.limit || 20)
      .offset(((filters.page || 1) - 1) * (filters.limit || 20));
    return subs;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    if (!this.isDbAvailable()) throw new Error("Database not available");
    const [newSub] = await db!.insert(subscriptions).values(subscription).returning();
    return newSub;
  }

  async updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription> {
    if (!this.isDbAvailable()) throw new Error("Database not available");
    const [updated] = await db!.update(subscriptions).set({ ...subscription, updatedAt: new Date() })
      .where(eq(subscriptions.id, id)).returning();
    return updated;
  }

  async cancelSubscription(id: string, reason?: string): Promise<Subscription> {
    if (!this.isDbAvailable()) throw new Error("Database not available");
    const [updated] = await db!.update(subscriptions).set({
      status: 'cancelled',
      cancellationReason: reason || null,
      cancelledAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(subscriptions.id, id)).returning();
    return updated;
  }

  // Payment transaction operations
  async getUserPaymentTransactions(userId: string): Promise<PaymentTransaction[]> {
    if (!this.isDbAvailable()) return [];
    const transactions = await db!.select().from(paymentTransactions)
      .where(eq(paymentTransactions.userId, userId))
      .orderBy(desc(paymentTransactions.createdAt));
    return transactions;
  }

  async getAllPaymentTransactions(filters: { status?: string; gateway?: string; page?: number; limit?: number }): Promise<PaymentTransaction[]> {
    if (!this.isDbAvailable()) return [];
    let query = db!.select().from(paymentTransactions);
    const conditions = [];
    if (filters.status) conditions.push(eq(paymentTransactions.status, filters.status));
    if (filters.gateway) conditions.push(eq(paymentTransactions.paymentGateway, filters.gateway));
    if (conditions.length > 0) query = query.where(and(...conditions)) as any;
    const transactions = await query.orderBy(desc(paymentTransactions.createdAt))
      .limit(filters.limit || 20)
      .offset(((filters.page || 1) - 1) * (filters.limit || 20));
    return transactions;
  }

  async createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction> {
    if (!this.isDbAvailable()) throw new Error("Database not available");
    const [newTransaction] = await db!.insert(paymentTransactions).values(transaction).returning();
    return newTransaction;
  }

  async updatePaymentTransaction(id: string, transaction: Partial<InsertPaymentTransaction>): Promise<PaymentTransaction> {
    if (!this.isDbAvailable()) throw new Error("Database not available");
    const [updated] = await db!.update(paymentTransactions).set({ ...transaction, updatedAt: new Date() })
      .where(eq(paymentTransactions.id, id)).returning();
    return updated;
  }

  // Payment gateway settings operations
  async getEnabledPaymentGateways(): Promise<PaymentGatewaySettings[]> {
    if (!this.isDbAvailable()) return [];
    const gateways = await db!.select().from(paymentGatewaySettings)
      .where(eq(paymentGatewaySettings.isEnabled, true))
      .orderBy(paymentGatewaySettings.sortOrder);
    return gateways;
  }

  async getAllPaymentGatewaySettings(): Promise<PaymentGatewaySettings[]> {
    if (!this.isDbAvailable()) return [];
    const gateways = await db!.select().from(paymentGatewaySettings).orderBy(paymentGatewaySettings.sortOrder);
    return gateways;
  }

  async updatePaymentGatewaySettings(gateway: string, settings: Partial<InsertPaymentGatewaySettings>): Promise<PaymentGatewaySettings> {
    if (!this.isDbAvailable()) throw new Error("Database not available");
    const [updated] = await db!.update(paymentGatewaySettings).set({ ...settings, updatedAt: new Date() })
      .where(eq(paymentGatewaySettings.gateway, gateway)).returning();
    return updated;
  }

  // Admin dashboard operations
  async getDashboardStats(): Promise<{
    totalStudents: number;
    totalTeachers: number;
    totalGroups: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    pendingPayments: number;
  }> {
    const totalStudents = await this.getStudentsCount();
    const totalTeachers = await this.getTeachersCount();
    const totalGroups = await this.getGroupsCount();
    const subscriptionStats = await this.getSubscriptionStats();
    return {
      totalStudents,
      totalTeachers,
      totalGroups,
      activeSubscriptions: subscriptionStats.active,
      monthlyRevenue: 0,
      pendingPayments: subscriptionStats.pending,
    };
  }

  async getStudentsCount(): Promise<number> {
    if (!this.isDbAvailable()) return 0;
    const result = await db!.select({ count: sql<number>`count(*)` }).from(students);
    return Number(result[0]?.count || 0);
  }

  async getTeachersCount(): Promise<number> {
    if (!this.isDbAvailable()) return 0;
    const result = await db!.select({ count: sql<number>`count(*)` }).from(users)
      .where(eq(users.role, 'teacher'));
    return Number(result[0]?.count || 0);
  }

  async getGroupsCount(): Promise<number> {
    if (!this.isDbAvailable()) return 0;
    const result = await db!.select({ count: sql<number>`count(*)` }).from(courses);
    return Number(result[0]?.count || 0);
  }

  async getSubscriptionStats(): Promise<{ active: number; expired: number; pending: number; cancelled: number }> {
    if (!this.isDbAvailable()) return { active: 0, expired: 0, pending: 0, cancelled: 0 };
    const allSubs = await db!.select().from(subscriptions);
    return {
      active: allSubs.filter(s => s.status === 'active').length,
      expired: allSubs.filter(s => s.status === 'expired').length,
      pending: allSubs.filter(s => s.status === 'pending').length,
      cancelled: allSubs.filter(s => s.status === 'cancelled').length,
    };
  }

  async getAttendanceReport(filters: { date?: string; startDate?: string; endDate?: string }): Promise<any> {
    if (!this.isDbAvailable()) return { sessions: [], summary: { total: 0, attended: 0, absent: 0 } };
    const sessions = await db!.select().from(studentSessions);
    return {
      sessions,
      summary: {
        total: sessions.length,
        attended: sessions.filter(s => s.attended).length,
        absent: sessions.filter(s => !s.attended).length,
      },
    };
  }

  async getRevenueReport(filters: { period: string; startDate?: string; endDate?: string }): Promise<any> {
    if (!this.isDbAvailable()) return { total: 0, transactions: [] };
    const transactions = await db!.select().from(paymentTransactions)
      .where(eq(paymentTransactions.status, 'completed'));
    const total = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return { total, transactions };
  }

  async getOverduePayments(): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    const overdue = await db!.select().from(subscriptions)
      .where(eq(subscriptions.status, 'payment_overdue'));
    return overdue;
  }

  async getStudentProgressReport(filters: { studentId?: string; teacherId?: string }): Promise<any> {
    if (!this.isDbAvailable()) return { students: [], summary: {} };
    let studentsData = await db!.select().from(students);
    if (filters.studentId) {
      studentsData = studentsData.filter(s => s.id === filters.studentId);
    }
    if (filters.teacherId) {
      studentsData = studentsData.filter(s => s.sheikhId === filters.teacherId);
    }
    return { students: studentsData, summary: { totalStudents: studentsData.length } };
  }

  async getTeachers(): Promise<User[]> {
    if (!this.isDbAvailable()) return [];
    const teachers = await db!.select().from(users).where(eq(users.role, 'teacher'));
    return teachers;
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    if (!this.isDbAvailable()) throw new Error("Database not available");
    const [updated] = await db!.update(users).set({ role, updatedAt: new Date() })
      .where(eq(users.id, id)).returning();
    return updated;
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    if (!this.isDbAvailable()) throw new Error("Database not available");
    const [updated] = await db!.update(users).set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, id)).returning();
    return updated;
  }

  async getContactMessages(filters: { isRead?: boolean; page?: number; limit?: number }): Promise<ContactMessage[]> {
    if (!this.isDbAvailable()) return [];
    let query = db!.select().from(contactMessages);
    if (filters.isRead !== undefined) {
      query = query.where(eq(contactMessages.isRead, filters.isRead)) as any;
    }
    const messages = await query.orderBy(desc(contactMessages.createdAt))
      .limit(filters.limit || 20)
      .offset(((filters.page || 1) - 1) * (filters.limit || 20));
    return messages;
  }

  async markMessageAsRead(id: string): Promise<ContactMessage> {
    if (!this.isDbAvailable()) throw new Error("Database not available");
    const [updated] = await db!.update(contactMessages).set({ isRead: true })
      .where(eq(contactMessages.id, id)).returning();
    return updated;
  }

  async assignStudentToTeacher(teacherId: string, studentId: string): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("Database not available");
    const [updated] = await db!.update(students).set({ sheikhId: teacherId, updatedAt: new Date() })
      .where(eq(students.id, studentId)).returning();
    return updated;
  }
}

import { MongoDBStorage } from "./mongoStorage";
import { isMongoConnected } from "./mongodb";

// Use MongoDB if available, otherwise use DatabaseStorage with JSON fallback
export const storage = (() => {
  // Try to use MongoDB if connected
  if (isMongoConnected()) {
    console.log("✅ Using MongoDB storage");
    return new MongoDBStorage();
  }
  
  // Fallback to DatabaseStorage (which uses jsonStorage as last resort)
  console.log("⚠️ MongoDB not available, using JSON storage fallback");
  return new DatabaseStorage();
})();
