// @ts-nocheck
import { IStorage } from "./storage";
import {
  User,
  Student,
  Course,
  Instructor,
  CourseEnrollment,
  CourseModule,
  CourseStage,
  CourseUpload,
  ExamQuestion,
  ExamAttempt,
  ContactMessage,
  StudentSession,
  StudentError,
  StudentPayment,
  ClassSchedule,
  Supervisor,
  StudentNote,
  Certificate,
  QuranProgress,
  QuranWordHighlight,
  QuranMemorization,
  QuranReadingStats,
  QuranAyahMarker,
  QuranRecitationAttempt,
  QuranNote,
  SessionAccess,
  DailyAssignment,
  LiveAnnotation,
  LiveRoom,
  RoomParticipant,
  Message,
  Notification,
  ShoppingCart,
  Halaqa,
  HalaqaMember,
  HalaqaSchedule,
  HalaqaAttendance,
  Homework,
  HomeworkSubmission,
  StudentEvaluation,
  ParentReport,
  SubscriptionPlan,
  Subscription,
  PaymentTransaction,
  PaymentGatewaySettings,
  BankTransferRequest,
  LessonReminder,
  AcademySettings,
  Quiz,
} from "./models";
import { hashPassword, verifyPassword } from "./authUtils";
import { isMongoConnected } from "./mongodb";
import { SUBSCRIPTION_PLANS, getPlanById } from "./subscriptionPlansData";
import type {
  User as UserType,
  UpsertUser,
  Course as CourseType,
  InsertCourse,
  Instructor as InstructorType,
  InsertInstructor,
  CourseEnrollment as CourseEnrollmentType,
  InsertEnrollment,
  CourseModule as CourseModuleType,
  InsertCourseModule,
  CourseStage as CourseStageType,
  InsertCourseStage,
  CourseUpload as CourseUploadType,
  InsertCourseUpload,
  ExamQuestion as ExamQuestionType,
  InsertExamQuestion,
  ExamAttempt as ExamAttemptType,
  InsertExamAttempt,
  ContactMessage as ContactMessageType,
  InsertContactMessage,
  Student as StudentType,
  InsertStudent,
  StudentSession as StudentSessionType,
  InsertStudentSession,
  StudentError as StudentErrorType,
  InsertStudentError,
  StudentPayment as StudentPaymentType,
  InsertStudentPayment,
  ClassSchedule as ClassScheduleType,
  InsertClassSchedule,
  Supervisor as SupervisorType,
  InsertSupervisor,
  StudentNote as StudentNoteType,
  InsertStudentNote,
  Certificate as CertificateType,
  InsertCertificate,
  QuranProgress as QuranProgressType,
  InsertQuranProgress,
  QuranWordHighlight as QuranWordHighlightType,
  InsertQuranWordHighlight,
  QuranMemorization as QuranMemorizationType,
  InsertQuranMemorization,
  QuranReadingStats as QuranReadingStatsType,
  InsertQuranReadingStats,
  QuranAyahMarker as QuranAyahMarkerType,
  InsertQuranAyahMarker,
  QuranRecitationAttempt as QuranRecitationAttemptType,
  InsertQuranRecitationAttempt,
  QuranNote as QuranNoteType,
  InsertQuranNote,
  SessionAccess as SessionAccessType,
  InsertSessionAccess,
  DailyAssignment as DailyAssignmentType,
  InsertDailyAssignment,
  LiveAnnotation as LiveAnnotationType,
  InsertLiveAnnotation,
  LiveRoom as LiveRoomType,
  InsertLiveRoom,
  RoomParticipant as RoomParticipantType,
  InsertRoomParticipant,
  Message as MessageType,
  InsertMessage,
  Notification as NotificationType,
  InsertNotification,
  ShoppingCartItem,
  InsertShoppingCartItem,
  SheikhSessionView,
} from "@shared/schema";

function toPlainObject<T>(doc: any): T {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id?.toString() || obj.id;
  delete obj._id;
  delete obj.__v;
  return obj as T;
}

function toPlainArray<T>(docs: any[]): T[] {
  return docs.map(doc => toPlainObject<T>(doc));
}

function cleanData(data: any): any {
  const cleaned: any = {};
  for (const key in data) {
    if (data[key] !== null && data[key] !== undefined) {
      cleaned[key] = data[key];
    }
  }
  return cleaned;
}

export class MongoDBStorage implements IStorage {
  private isDbAvailable(): boolean {
    return isMongoConnected();
  }

  async getUser(id: string): Promise<UserType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const user = await User.findById(id);
    return user ? toPlainObject<UserType>(user) : undefined;
  }

  async getAllUsers(): Promise<UserType[]> {
    if (!this.isDbAvailable()) return [];
    const users = await User.find({ isActive: true });
    return toPlainArray<UserType>(users);
  }

  async upsertUser(userData: UpsertUser): Promise<UserType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const user = await User.findByIdAndUpdate(
      userData.id,
      { ...userData, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return toPlainObject<UserType>(user);
  }

  async updateUserProfile(id: string, data: Partial<UserType>): Promise<UserType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const user = await User.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
    if (!user) throw new Error("User not found");
    return toPlainObject<UserType>(user);
  }

  async getUserByPhone(phoneNumber: string): Promise<UserType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const user = await User.findOne({ phoneNumber });
    return user ? toPlainObject<UserType>(user) : undefined;
  }

  async createUserWithPhone(data: { firstName: string; phoneNumber: string; passwordHash: string; role: string }): Promise<UserType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const user = await User.create({
      firstName: data.firstName,
      phoneNumber: data.phoneNumber,
      passwordHash: data.passwordHash,
      role: data.role,
      isActive: true,
      registrationCompleted: true,
    });
    return toPlainObject<UserType>(user);
  }

  async getCourses(): Promise<CourseType[]> {
    if (!this.isDbAvailable()) return [];
    const courses = await Course.find().sort({ startDate: -1 });
    return toPlainArray<CourseType>(courses);
  }

  async getActiveCourses(): Promise<CourseType[]> {
    if (!this.isDbAvailable()) return [];
    const courses = await Course.find({ isActive: true }).sort({ startDate: -1 });
    return toPlainArray<CourseType>(courses);
  }

  async getCourse(id: string): Promise<CourseType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const course = await Course.findById(id);
    return course ? toPlainObject<CourseType>(course) : undefined;
  }

  async createCourse(course: InsertCourse): Promise<CourseType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newCourse = await Course.create(cleanData(course) as any);
    return toPlainObject<CourseType>(newCourse);
  }

  async updateCourse(id: string, course: Partial<InsertCourse>): Promise<CourseType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { ...course, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedCourse) throw new Error("Course not found");
    return toPlainObject<CourseType>(updatedCourse);
  }

  async deleteCourse(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await Course.findByIdAndDelete(id);
  }

  async archiveCourse(id: string): Promise<CourseType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const archivedCourse = await Course.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );
    if (!archivedCourse) throw new Error("Course not found");
    return toPlainObject<CourseType>(archivedCourse);
  }

  async getCourseModules(courseId: string): Promise<CourseModuleType[]> {
    if (!this.isDbAvailable()) return [];
    const modules = await CourseModule.find({ courseId }).sort({ orderIndex: 1 });
    return toPlainArray<CourseModuleType>(modules);
  }

  async getCourseModule(id: string): Promise<CourseModuleType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const module = await CourseModule.findById(id);
    return module ? toPlainObject<CourseModuleType>(module) : undefined;
  }

  async createCourseModule(module: InsertCourseModule): Promise<CourseModuleType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newModule = await CourseModule.create(cleanData(module) as any);
    return toPlainObject<CourseModuleType>(newModule);
  }

  async updateCourseModule(id: string, module: Partial<InsertCourseModule>): Promise<CourseModuleType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const updatedModule = await CourseModule.findByIdAndUpdate(
      id,
      { ...module, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedModule) throw new Error("Course module not found");
    return toPlainObject<CourseModuleType>(updatedModule);
  }

  async deleteCourseModule(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await CourseModule.findByIdAndDelete(id);
  }

  async getCourseStages(moduleId: string): Promise<CourseStageType[]> {
    if (!this.isDbAvailable()) return [];
    const stages = await CourseStage.find({ moduleId }).sort({ orderIndex: 1 });
    return toPlainArray<CourseStageType>(stages);
  }

  async getCourseStage(id: string): Promise<CourseStageType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const stage = await CourseStage.findById(id);
    return stage ? toPlainObject<CourseStageType>(stage) : undefined;
  }

  async createCourseStage(stage: InsertCourseStage): Promise<CourseStageType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newStage = await CourseStage.create(cleanData(stage) as any);
    return toPlainObject<CourseStageType>(newStage);
  }

  async updateCourseStage(id: string, stage: Partial<InsertCourseStage>): Promise<CourseStageType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const updatedStage = await CourseStage.findByIdAndUpdate(
      id,
      { ...stage, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedStage) throw new Error("Course stage not found");
    return toPlainObject<CourseStageType>(updatedStage);
  }

  async deleteCourseStage(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await CourseStage.findByIdAndDelete(id);
  }

  async getCourseUploads(stageId: string): Promise<CourseUploadType[]> {
    if (!this.isDbAvailable()) return [];
    const uploads = await CourseUpload.find({ stageId }).sort({ createdAt: 1 });
    return toPlainArray<CourseUploadType>(uploads);
  }

  async getCourseUpload(id: string): Promise<CourseUploadType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const upload = await CourseUpload.findById(id);
    return upload ? toPlainObject<CourseUploadType>(upload) : undefined;
  }

  async createCourseUpload(upload: InsertCourseUpload): Promise<CourseUploadType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newUpload = await CourseUpload.create(cleanData(upload) as any);
    return toPlainObject<CourseUploadType>(newUpload);
  }

  async updateCourseUpload(id: string, upload: Partial<InsertCourseUpload>): Promise<CourseUploadType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const updatedUpload = await CourseUpload.findByIdAndUpdate(
      id,
      { ...upload, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedUpload) throw new Error("Course upload not found");
    return toPlainObject<CourseUploadType>(updatedUpload);
  }

  async deleteCourseUpload(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await CourseUpload.findByIdAndDelete(id);
  }

  async getExamQuestions(courseId: string): Promise<ExamQuestionType[]> {
    if (!this.isDbAvailable()) return [];
    const questions = await ExamQuestion.find({ courseId }).sort({ orderIndex: 1 });
    return toPlainArray<ExamQuestionType>(questions);
  }

  async getExamQuestion(id: string): Promise<ExamQuestionType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const question = await ExamQuestion.findById(id);
    return question ? toPlainObject<ExamQuestionType>(question) : undefined;
  }

  async createExamQuestion(question: InsertExamQuestion): Promise<ExamQuestionType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newQuestion = await ExamQuestion.create(cleanData(question) as any);
    return toPlainObject<ExamQuestionType>(newQuestion);
  }

  async updateExamQuestion(id: string, question: Partial<InsertExamQuestion>): Promise<ExamQuestionType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const updatedQuestion = await ExamQuestion.findByIdAndUpdate(id, question, { new: true });
    if (!updatedQuestion) throw new Error("Exam question not found");
    return toPlainObject<ExamQuestionType>(updatedQuestion);
  }

  async deleteExamQuestion(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await ExamQuestion.findByIdAndDelete(id);
  }

  async getStudentExamAttempts(studentId: string, courseId?: string): Promise<ExamAttemptType[]> {
    if (!this.isDbAvailable()) return [];
    const query: any = { studentId };
    if (courseId) query.courseId = courseId;
    const attempts = await ExamAttempt.find(query).sort({ createdAt: -1 });
    return toPlainArray<ExamAttemptType>(attempts);
  }

  async getExamAttempt(id: string): Promise<ExamAttemptType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const attempt = await ExamAttempt.findById(id);
    return attempt ? toPlainObject<ExamAttemptType>(attempt) : undefined;
  }

  async createExamAttempt(attempt: InsertExamAttempt): Promise<ExamAttemptType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newAttempt = await ExamAttempt.create(cleanData(attempt) as any);
    return toPlainObject<ExamAttemptType>(newAttempt);
  }

  async updateExamAttempt(id: string, attempt: Partial<InsertExamAttempt>): Promise<ExamAttemptType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const updatedAttempt = await ExamAttempt.findByIdAndUpdate(id, attempt, { new: true });
    if (!updatedAttempt) throw new Error("Exam attempt not found");
    return toPlainObject<ExamAttemptType>(updatedAttempt);
  }

  async getInstructors(): Promise<InstructorType[]> {
    if (!this.isDbAvailable()) return [];
    const instructors = await Instructor.find();
    return toPlainArray<InstructorType>(instructors);
  }

  async getActiveInstructors(): Promise<InstructorType[]> {
    if (!this.isDbAvailable()) return [];
    const instructors = await Instructor.find({ isActive: true });
    return toPlainArray<InstructorType>(instructors);
  }

  async getInstructor(id: string): Promise<InstructorType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const instructor = await Instructor.findById(id);
    return instructor ? toPlainObject<InstructorType>(instructor) : undefined;
  }

  async createInstructor(instructor: InsertInstructor): Promise<InstructorType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newInstructor = await Instructor.create(cleanData(instructor) as any);
    return toPlainObject<InstructorType>(newInstructor);
  }

  async enrollUserInCourse(enrollment: InsertEnrollment): Promise<CourseEnrollmentType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newEnrollment = await CourseEnrollment.create(cleanData(enrollment) as any);
    return toPlainObject<CourseEnrollmentType>(newEnrollment);
  }

  async getUserEnrollments(userId: string): Promise<CourseEnrollmentType[]> {
    if (!this.isDbAvailable()) return [];
    const enrollments = await CourseEnrollment.find({ userId });
    return toPlainArray<CourseEnrollmentType>(enrollments);
  }

  async getCourseEnrollments(courseId: string): Promise<CourseEnrollmentType[]> {
    if (!this.isDbAvailable()) return [];
    const enrollments = await CourseEnrollment.find({ courseId });
    return toPlainArray<CourseEnrollmentType>(enrollments);
  }

  async updateEnrollmentProgress(userId: string, courseId: string, progress: number): Promise<CourseEnrollmentType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const enrollment = await CourseEnrollment.findOneAndUpdate(
      { userId, courseId },
      { progress, updatedAt: new Date() },
      { new: true }
    );
    if (!enrollment) throw new Error("Enrollment not found");
    return toPlainObject<CourseEnrollmentType>(enrollment);
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessageType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newMessage = await ContactMessage.create(cleanData(message) as any);
    return toPlainObject<ContactMessageType>(newMessage);
  }

  async getContactMessages(filters?: { isRead?: boolean; page?: number; limit?: number }): Promise<ContactMessageType[]> {
    if (!this.isDbAvailable()) return [];
    const query: any = {};
    if (filters?.isRead !== undefined) query.isRead = filters.isRead;
    const skip = filters?.page && filters?.limit ? (filters.page - 1) * filters.limit : 0;
    const limitVal = filters?.limit || 100;
    const messages = await ContactMessage.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitVal);
    return toPlainArray<ContactMessageType>(messages);
  }

  async createStudent(student: InsertStudent): Promise<StudentType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const hashedPassword = await hashPassword(student.passwordHash);
    const newStudent = await Student.create(cleanData({ ...student, passwordHash: hashedPassword }) as any);
    return toPlainObject<StudentType>(newStudent);
  }

  async getAllStudents(): Promise<StudentType[]> {
    if (!this.isDbAvailable()) return [];
    const students = await Student.find({ isActive: true });
    return toPlainArray<StudentType>(students);
  }

  async deleteAllStudents(): Promise<number> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const result = await Student.deleteMany({});
    return result.deletedCount || 0;
  }

  async getStudent(id: string): Promise<StudentType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const student = await Student.findById(id);
    return student ? toPlainObject<StudentType>(student) : undefined;
  }

  async authenticateStudent(studentName: string, password: string): Promise<StudentType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const student = await Student.findOne({ studentName, isActive: true });
    if (!student) return undefined;
    const isValid = await verifyPassword(password, student.passwordHash);
    if (!isValid) return undefined;
    return toPlainObject<StudentType>(student);
  }

  async createStudentSession(session: InsertStudentSession): Promise<StudentSessionType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newSession = await StudentSession.create(cleanData(session) as any);
    return toPlainObject<StudentSessionType>(newSession);
  }

  async getStudentSessions(studentId: string): Promise<StudentSessionType[]> {
    if (!this.isDbAvailable()) return [];
    const sessions = await StudentSession.find({ studentId }).sort({ sessionDate: -1 });
    return toPlainArray<StudentSessionType>(sessions);
  }

  async updateStudentSessionAttendance(sessionId: string, attended: boolean): Promise<StudentSessionType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const session = await StudentSession.findByIdAndUpdate(sessionId, { attended }, { new: true });
    if (!session) throw new Error("Session not found");
    return toPlainObject<StudentSessionType>(session);
  }

  async getQuranProgress(studentId: string): Promise<QuranProgressType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const progress = await QuranProgress.findOne({ studentId });
    return progress ? toPlainObject<QuranProgressType>(progress) : undefined;
  }

  async createQuranProgress(progress: InsertQuranProgress): Promise<QuranProgressType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newProgress = await QuranProgress.create(cleanData(progress) as any);
    return toPlainObject<QuranProgressType>(newProgress);
  }

  async updateQuranProgress(studentId: string, updates: Partial<QuranProgressType>): Promise<QuranProgressType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const progress = await QuranProgress.findOneAndUpdate(
      { studentId },
      { ...updates, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    return toPlainObject<QuranProgressType>(progress);
  }

  async createStudentNote(note: InsertStudentNote): Promise<StudentNoteType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newNote = await StudentNote.create(cleanData(note) as any);
    return toPlainObject<StudentNoteType>(newNote);
  }

  async getStudentNotes(studentId: string): Promise<StudentNoteType[]> {
    if (!this.isDbAvailable()) return [];
    const notes = await StudentNote.find({ studentId }).sort({ createdAt: -1 });
    return toPlainArray<StudentNoteType>(notes);
  }

  async createCertificate(certificate: InsertCertificate): Promise<CertificateType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newCertificate = await Certificate.create(certificate);
    return toPlainObject<CertificateType>(newCertificate);
  }

  async getCertificate(id: string): Promise<CertificateType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const certificate = await Certificate.findById(id);
    return certificate ? toPlainObject<CertificateType>(certificate) : undefined;
  }

  async getCertificateByToken(token: string): Promise<CertificateType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const certificate = await Certificate.findOne({ verificationToken: token });
    return certificate ? toPlainObject<CertificateType>(certificate) : undefined;
  }

  async getStudentCertificates(studentId: string): Promise<CertificateType[]> {
    if (!this.isDbAvailable()) return [];
    const certificates = await Certificate.find({ studentId });
    return toPlainArray<CertificateType>(certificates);
  }

  async getAllCertificates(): Promise<CertificateType[]> {
    if (!this.isDbAvailable()) return [];
    const certificates = await Certificate.find();
    return toPlainArray<CertificateType>(certificates);
  }

  async updateStudent(id: string, updates: Partial<StudentType>): Promise<StudentType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const student = await Student.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    if (!student) throw new Error("Student not found");
    return toPlainObject<StudentType>(student);
  }

  async deleteStudent(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await Student.findByIdAndUpdate(id, { isActive: false });
  }

  async updateStudentMemorization(userId: string, memorization: Array<{surah: number, ayat: number[]}>): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await Student.findOneAndUpdate(
      { userId },
      { memorizedSurahs: JSON.stringify(memorization), updatedAt: new Date() }
    );
  }

  async createStudentError(error: InsertStudentError): Promise<StudentErrorType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newError = await StudentError.create(cleanData(error) as any);
    return toPlainObject<StudentErrorType>(newError);
  }

  async getStudentErrors(studentId: string): Promise<StudentErrorType[]> {
    if (!this.isDbAvailable()) return [];
    const errors = await StudentError.find({ studentId }).sort({ createdAt: -1 });
    return toPlainArray<StudentErrorType>(errors);
  }

  async deleteStudentError(errorId: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await StudentError.findByIdAndDelete(errorId);
  }

  async createStudentPayment(payment: InsertStudentPayment): Promise<StudentPaymentType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newPayment = await StudentPayment.create(cleanData(payment) as any);
    return toPlainObject<StudentPaymentType>(newPayment);
  }

  async getStudentPayments(studentId: string): Promise<StudentPaymentType[]> {
    if (!this.isDbAvailable()) return [];
    const payments = await StudentPayment.find({ studentId }).sort({ paymentDate: -1 });
    return toPlainArray<StudentPaymentType>(payments);
  }

  async getAllPayments(): Promise<StudentPaymentType[]> {
    if (!this.isDbAvailable()) return [];
    const payments = await StudentPayment.find().sort({ paymentDate: -1 });
    return toPlainArray<StudentPaymentType>(payments);
  }

  async createClassSchedule(schedule: InsertClassSchedule): Promise<ClassScheduleType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newSchedule = await ClassSchedule.create(cleanData(schedule) as any);
    return toPlainObject<ClassScheduleType>(newSchedule);
  }

  async getStudentSchedules(studentId: string): Promise<ClassScheduleType[]> {
    if (!this.isDbAvailable()) return [];
    const schedules = await ClassSchedule.find({ studentId, isActive: true });
    return toPlainArray<ClassScheduleType>(schedules);
  }

  async updateClassSchedule(id: string, updates: Partial<InsertClassSchedule>): Promise<ClassScheduleType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const schedule = await ClassSchedule.findByIdAndUpdate(id, updates, { new: true });
    if (!schedule) throw new Error("Schedule not found");
    return toPlainObject<ClassScheduleType>(schedule);
  }

  async deleteClassSchedule(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await ClassSchedule.findByIdAndDelete(id);
  }

  async getAllCourses(): Promise<CourseType[]> {
    return this.getCourses();
  }

  async getAllInstructors(): Promise<InstructorType[]> {
    return this.getInstructors();
  }

  async getAllEnrollments(): Promise<CourseEnrollmentType[]> {
    if (!this.isDbAvailable()) return [];
    const enrollments = await CourseEnrollment.find();
    return toPlainArray<CourseEnrollmentType>(enrollments);
  }

  async getAllStudentSessions(): Promise<StudentSessionType[]> {
    if (!this.isDbAvailable()) return [];
    const sessions = await StudentSession.find();
    return toPlainArray<StudentSessionType>(sessions);
  }

  async getAllStudentErrors(): Promise<StudentErrorType[]> {
    if (!this.isDbAvailable()) return [];
    const errors = await StudentError.find();
    return toPlainArray<StudentErrorType>(errors);
  }

  async createSupervisor(supervisor: InsertSupervisor): Promise<SupervisorType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newSupervisor = await Supervisor.create(cleanData(supervisor) as any);
    return toPlainObject<SupervisorType>(newSupervisor);
  }

  async getSupervisors(): Promise<SupervisorType[]> {
    if (!this.isDbAvailable()) return [];
    const supervisors = await Supervisor.find({ isActive: true });
    return toPlainArray<SupervisorType>(supervisors);
  }

  async getSupervisor(id: string): Promise<SupervisorType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const supervisor = await Supervisor.findById(id);
    return supervisor ? toPlainObject<SupervisorType>(supervisor) : undefined;
  }

  async getUserByTelegramId(telegramId: string): Promise<UserType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const user = await User.findOne({ phoneNumber: telegramId });
    return user ? toPlainObject<UserType>(user) : undefined;
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
  }): Promise<UserType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const user = await User.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      age: userData.age,
      email: userData.email,
      role: userData.role,
      isActive: userData.isActive,
      registrationCompleted: userData.registrationCompleted,
    });
    return toPlainObject<UserType>(user);
  }

  async createWordHighlight(highlight: InsertQuranWordHighlight): Promise<QuranWordHighlightType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newHighlight = await QuranWordHighlight.create(highlight);
    return toPlainObject<QuranWordHighlightType>(newHighlight);
  }

  async getWordHighlights(studentId: string, surahNumber: number, ayahNumber: number): Promise<QuranWordHighlightType[]> {
    if (!this.isDbAvailable()) return [];
    const highlights = await QuranWordHighlight.find({ studentId, surahNumber, ayahNumber });
    return toPlainArray<QuranWordHighlightType>(highlights);
  }

  async getAllWordHighlights(studentId: string): Promise<QuranWordHighlightType[]> {
    if (!this.isDbAvailable()) return [];
    const highlights = await QuranWordHighlight.find({ studentId });
    return toPlainArray<QuranWordHighlightType>(highlights);
  }

  async updateWordHighlight(id: string, updates: Partial<InsertQuranWordHighlight>): Promise<QuranWordHighlightType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const highlight = await QuranWordHighlight.findByIdAndUpdate(id, updates, { new: true });
    if (!highlight) throw new Error("Highlight not found");
    return toPlainObject<QuranWordHighlightType>(highlight);
  }

  async deleteWordHighlight(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await QuranWordHighlight.findByIdAndDelete(id);
  }

  async deleteWordHighlightByLocation(studentId: string, surahNumber: number, ayahNumber: number, wordIndex: number): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await QuranWordHighlight.findOneAndDelete({ studentId, surahNumber, ayahNumber, wordIndex });
  }

  async createMemorization(memorization: InsertQuranMemorization): Promise<QuranMemorizationType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newMemorization = await QuranMemorization.create(cleanData(memorization) as any);
    return toPlainObject<QuranMemorizationType>(newMemorization);
  }

  async getStudentMemorization(studentId: string): Promise<QuranMemorizationType[]> {
    if (!this.isDbAvailable()) return [];
    const memorizations = await QuranMemorization.find({ studentId });
    return toPlainArray<QuranMemorizationType>(memorizations);
  }

  async updateMemorization(id: string, updates: Partial<InsertQuranMemorization>): Promise<QuranMemorizationType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const memorization = await QuranMemorization.findByIdAndUpdate(id, updates, { new: true });
    if (!memorization) throw new Error("Memorization not found");
    return toPlainObject<QuranMemorizationType>(memorization);
  }

  async deleteMemorization(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await QuranMemorization.findByIdAndDelete(id);
  }

  async getDueReviews(studentId: string, untilDate?: Date): Promise<QuranMemorizationType[]> {
    if (!this.isDbAvailable()) return [];
    const query: any = { studentId };
    if (untilDate) {
      query.nextReviewDate = { $lte: untilDate };
    }
    const memorizations = await QuranMemorization.find(query);
    return toPlainArray<QuranMemorizationType>(memorizations);
  }

  async updateReviewOutcome(id: string, reviewData: { difficulty: 'easy' | 'medium' | 'hard'; reviewCount: number; lastReviewed: Date; nextReviewDate: Date; masteryLevel: number; status: string }): Promise<QuranMemorizationType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const memorization = await QuranMemorization.findByIdAndUpdate(id, reviewData, { new: true });
    if (!memorization) throw new Error("Memorization not found");
    return toPlainObject<QuranMemorizationType>(memorization);
  }

  async getMessagesForUser(userId: string): Promise<MessageType[]> {
    if (!this.isDbAvailable()) return [];
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });
    return toPlainArray<MessageType>(messages);
  }

  async createMessage(message: InsertMessage): Promise<MessageType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newMessage = await Message.create(cleanData(message) as any);
    return toPlainObject<MessageType>(newMessage);
  }

  async createOrUpdateReadingStats(stats: InsertQuranReadingStats): Promise<QuranReadingStatsType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const cleanedStats = cleanData(stats) as any;
    const result = await QuranReadingStats.findOneAndUpdate(
      { studentId: cleanedStats.studentId, readingDate: cleanedStats.readingDate },
      cleanedStats,
      { upsert: true, new: true }
    );
    return toPlainObject<QuranReadingStatsType>(result);
  }

  async getStudentReadingStats(studentId: string, startDate?: string, endDate?: string): Promise<QuranReadingStatsType[]> {
    if (!this.isDbAvailable()) return [];
    const query: any = { studentId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const stats = await QuranReadingStats.find(query).sort({ date: -1 });
    return toPlainArray<QuranReadingStatsType>(stats);
  }

  async getTodayReadingStats(studentId: string): Promise<QuranReadingStatsType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const stats = await QuranReadingStats.findOne({
      studentId,
      date: { $gte: today }
    });
    return stats ? toPlainObject<QuranReadingStatsType>(stats) : undefined;
  }

  async createAyahMarker(marker: InsertQuranAyahMarker): Promise<QuranAyahMarkerType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newMarker = await QuranAyahMarker.create(marker);
    return toPlainObject<QuranAyahMarkerType>(newMarker);
  }

  async getStudentAyahMarkers(studentId: string): Promise<QuranAyahMarkerType[]> {
    if (!this.isDbAvailable()) return [];
    const markers = await QuranAyahMarker.find({ studentId });
    return toPlainArray<QuranAyahMarkerType>(markers);
  }

  async updateAyahMarker(id: string, updates: Partial<InsertQuranAyahMarker>): Promise<QuranAyahMarkerType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const marker = await QuranAyahMarker.findByIdAndUpdate(id, updates, { new: true });
    if (!marker) throw new Error("Marker not found");
    return toPlainObject<QuranAyahMarkerType>(marker);
  }

  async deleteAyahMarker(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await QuranAyahMarker.findByIdAndDelete(id);
  }

  async createRecitationAttempt(attempt: InsertQuranRecitationAttempt): Promise<QuranRecitationAttemptType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newAttempt = await QuranRecitationAttempt.create(attempt);
    return toPlainObject<QuranRecitationAttemptType>(newAttempt);
  }

  async getStudentRecitationAttempts(studentId: string): Promise<QuranRecitationAttemptType[]> {
    if (!this.isDbAvailable()) return [];
    const attempts = await QuranRecitationAttempt.find({ studentId }).sort({ createdAt: -1 });
    return toPlainArray<QuranRecitationAttemptType>(attempts);
  }

  async createDailyAssignment(assignment: InsertDailyAssignment): Promise<DailyAssignmentType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newAssignment = await DailyAssignment.create(assignment);
    return toPlainObject<DailyAssignmentType>(newAssignment);
  }

  async getDailyAssignment(studentId: string, date: string): Promise<DailyAssignmentType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const assignment = await DailyAssignment.findOne({
      studentId,
      assignmentDate: new Date(date)
    });
    return assignment ? toPlainObject<DailyAssignmentType>(assignment) : undefined;
  }

  async getDailyAssignments(studentId: string): Promise<DailyAssignmentType[]> {
    if (!this.isDbAvailable()) return [];
    const assignments = await DailyAssignment.find({ studentId }).sort({ assignmentDate: -1 });
    return toPlainArray<DailyAssignmentType>(assignments);
  }

  async getAllDailyAssignments(): Promise<DailyAssignmentType[]> {
    if (!this.isDbAvailable()) return [];
    const assignments = await DailyAssignment.find().sort({ assignmentDate: -1 });
    return toPlainArray<DailyAssignmentType>(assignments);
  }

  async enableSessionAccess(access: InsertSessionAccess): Promise<SessionAccessType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newAccess = await SessionAccess.create({ ...access, isEnabled: true, enabledAt: new Date() });
    return toPlainObject<SessionAccessType>(newAccess);
  }

  async upsertSessionAccess(access: InsertSessionAccess): Promise<SessionAccessType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const result = await SessionAccess.findOneAndUpdate(
      { studentId: access.studentId, sessionDate: access.sessionDate },
      { ...access, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    return toPlainObject<SessionAccessType>(result);
  }

  async cleanupExpiredSessions(): Promise<number> {
    if (!this.isDbAvailable()) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = await SessionAccess.deleteMany({
      sessionDate: { $lt: today },
      isEnabled: false
    });
    return result.deletedCount || 0;
  }

  async createLiveAnnotation(annotation: InsertLiveAnnotation): Promise<LiveAnnotationType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newAnnotation = await LiveAnnotation.create(annotation);
    return toPlainObject<LiveAnnotationType>(newAnnotation);
  }

  async getStudentAnnotations(studentId: string, surahNumber?: number, ayahNumber?: number): Promise<LiveAnnotationType[]> {
    if (!this.isDbAvailable()) return [];
    const query: any = { studentId };
    if (surahNumber) query.surahNumber = surahNumber;
    if (ayahNumber) query.ayahNumber = ayahNumber;
    const annotations = await LiveAnnotation.find(query);
    return toPlainArray<LiveAnnotationType>(annotations);
  }

  async getAnnotationsByAyah(studentId: string, surahNumber: number, ayahNumber: number): Promise<LiveAnnotationType[]> {
    if (!this.isDbAvailable()) return [];
    const annotations = await LiveAnnotation.find({ studentId, surahNumber, ayahNumber });
    return toPlainArray<LiveAnnotationType>(annotations);
  }

  async updateLiveAnnotation(id: string, updates: Partial<InsertLiveAnnotation>): Promise<LiveAnnotationType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const annotation = await LiveAnnotation.findByIdAndUpdate(id, updates, { new: true });
    if (!annotation) throw new Error("Annotation not found");
    return toPlainObject<LiveAnnotationType>(annotation);
  }

  async deleteLiveAnnotation(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await LiveAnnotation.findByIdAndDelete(id);
  }

  async getSessionAccess(studentId: string, sessionDate: string): Promise<SessionAccessType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const access = await SessionAccess.findOne({
      studentId,
      sessionDate: new Date(sessionDate)
    });
    return access ? toPlainObject<SessionAccessType>(access) : undefined;
  }

  async getAllSessionAccess(studentId: string): Promise<SessionAccessType[]> {
    if (!this.isDbAvailable()) return [];
    const accesses = await SessionAccess.find({ studentId });
    return toPlainArray<SessionAccessType>(accesses);
  }

  async updateSessionAccess(id: string, updates: Partial<InsertSessionAccess>): Promise<SessionAccessType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const updated = await SessionAccess.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) throw new Error("Session access not found");
    return toPlainObject<SessionAccessType>(updated);
  }

  async getLiveRoomBySession(sessionId: string): Promise<LiveRoomType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    
    // Get session access first to find matching live room
    const session = await SessionAccess.findById(sessionId);
    if (!session) return undefined;
    
    // Find live room matching this session
    const room = await LiveRoom.findOne({
      studentId: session.studentId,
      sessionTime: session.startTime
    });
    
    return room ? toPlainObject<LiveRoomType>(room) : undefined;
  }

  async addToCart(item: InsertShoppingCartItem): Promise<ShoppingCartItem> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const cartItem = await ShoppingCart.create(item);
    return toPlainObject<ShoppingCartItem>(cartItem);
  }

  async getCartItems(userId: string): Promise<ShoppingCartItem[]> {
    if (!this.isDbAvailable()) return [];
    const items = await ShoppingCart.find({ userId });
    return toPlainArray<ShoppingCartItem>(items);
  }

  async removeFromCart(userId: string, courseId: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await ShoppingCart.findOneAndDelete({ userId, courseId });
  }

  async clearCart(userId: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await ShoppingCart.deleteMany({ userId });
  }

  async getSheikhSessions(sheikhId: string, range?: 'upcoming' | 'past' | 'today'): Promise<SheikhSessionView[]> {
    if (!this.isDbAvailable()) return [];
    
    // Get all active students - include both assigned and unassigned students
    const assignedStudents = await Student.find({ sheikhId, isActive: true });
    // Also include students with no sheikhId (unassigned) so their schedules show up
    const unassignedStudents = await Student.find({ 
      $or: [{ sheikhId: null }, { sheikhId: { $exists: false } }],
      isActive: true 
    });
    const studentIdSet = new Set<string>();
    const students: any[] = [];
    for (const s of [...assignedStudents, ...unassignedStudents]) {
      const sid = s._id.toString();
      if (!studentIdSet.has(sid)) {
        studentIdSet.add(sid);
        students.push(s);
      }
    }
    
    const studentIds = students.map(s => s._id);
    const studentMap = new Map(students.map(s => [s._id.toString(), s]));
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let dateQuery: any = {};
    if (range === 'upcoming') {
      dateQuery.sessionDate = { $gte: today };
    } else if (range === 'past') {
      dateQuery.sessionDate = { $lt: today };
    } else if (range === 'today') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateQuery.sessionDate = { $gte: today, $lt: tomorrow };
    }
    
    // Get session access records
    const accesses = await SessionAccess.find({
      studentId: { $in: studentIds },
      ...dateQuery
    });
    
    const results: SheikhSessionView[] = accesses.map(access => {
      const sid = access.studentId?.toString();
      const student = studentMap.get(sid || '');
      return {
        ...toPlainObject<SessionAccessType>(access),
        studentName: student?.studentName || 'Unknown',
        studentPhone: student?.phoneNumber || null,
      } as SheikhSessionView;
    });

    // Also generate sessions from class schedules for today/upcoming if no session access exists
    if (!range || range === 'today' || range === 'upcoming') {
      const todayDow = now.getDay();
      const schedules = await ClassSchedule.find({
        studentId: { $in: studentIds },
        isActive: true,
      });
      

      for (const sched of schedules) {
        const sid = sched.studentId?.toString();
        const student = studentMap.get(sid || '');
        
        // Calculate next occurrence
        let daysUntil = sched.dayOfWeek - todayDow;
        if (daysUntil < 0) daysUntil += 7;
        
        const sessionDate = new Date(today);
        sessionDate.setDate(today.getDate() + daysUntil);
        const dateStr = sessionDate.toISOString().split('T')[0];

        // Skip if session access already exists for this date + student
        const exists = results.some(r => {
          const rDate = typeof r.sessionDate === 'string' ? r.sessionDate : new Date(r.sessionDate).toISOString().split('T')[0];
          return r.studentId?.toString() === sid && rDate === dateStr;
        });
        
        if (!exists) {
          results.push({
            id: `sched_${sched._id}_${dateStr}`,
            studentId: sid || '',
            scheduleId: sched._id.toString(),
            sessionDate: dateStr,
            startTime: sched.startTime,
            endTime: sched.endTime,
            isEnabled: false,
            studentName: student?.studentName || 'Unknown',
            studentPhone: student?.phoneNumber || null,
          } as any);
        }
      }
    }

    return results;
  }

  async createOrGetLiveRoom(studentId: string, sheikhId: string, sessionDate: Date, sessionTime: string): Promise<LiveRoomType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    
    let room = await LiveRoom.findOne({ studentId, sheikhId, sessionDate });
    if (!room) {
      const roomToken = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      room = await LiveRoom.create({
        studentId,
        sheikhId,
        roomToken,
        sessionDate,
        sessionTime,
        status: 'waiting'
      });
    }
    return toPlainObject<LiveRoomType>(room);
  }

  async createOrActivateLiveRoom(studentId: string, sheikhId: string, sessionDate: Date, sessionTime: string): Promise<LiveRoomType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    
    let room = await LiveRoom.findOne({ studentId, sheikhId, sessionDate });
    if (room) {
      room = await LiveRoom.findByIdAndUpdate(
        room._id,
        { status: 'active', startedAt: new Date() },
        { new: true }
      );
    } else {
      const roomToken = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      room = await LiveRoom.create({
        studentId,
        sheikhId,
        roomToken,
        sessionDate,
        sessionTime,
        status: 'active',
        startedAt: new Date()
      });
    }
    return toPlainObject<LiveRoomType>(room!);
  }

  async getLiveRoomByToken(roomToken: string): Promise<LiveRoomType | undefined> {
    if (!this.isDbAvailable()) return undefined;
    const room = await LiveRoom.findOne({ roomToken });
    return room ? toPlainObject<LiveRoomType>(room) : undefined;
  }

  async getLiveRoomsByStudent(studentId: string): Promise<LiveRoomType[]> {
    if (!this.isDbAvailable()) return [];
    const rooms = await LiveRoom.find({ studentId });
    return toPlainArray<LiveRoomType>(rooms);
  }

  async getAllLiveRooms(): Promise<LiveRoomType[]> {
    if (!this.isDbAvailable()) return [];
    const rooms = await LiveRoom.find();
    return toPlainArray<LiveRoomType>(rooms);
  }

  async updateLiveRoomStatus(roomId: string, status: string): Promise<LiveRoomType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const updates: any = { status };
    if (status === 'ended') {
      updates.endedAt = new Date();
    }
    const room = await LiveRoom.findByIdAndUpdate(roomId, updates, { new: true });
    if (!room) throw new Error("Room not found");
    return toPlainObject<LiveRoomType>(room);
  }

  async updateLiveRoom(roomId: string, updates: Partial<LiveRoomType>): Promise<LiveRoomType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const room = await LiveRoom.findByIdAndUpdate(roomId, updates, { new: true });
    if (!room) throw new Error("Room not found");
    return toPlainObject<LiveRoomType>(room);
  }

  async addRoomParticipant(participant: InsertRoomParticipant): Promise<RoomParticipantType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const newParticipant = await RoomParticipant.create(cleanData(participant) as any);
    return toPlainObject<RoomParticipantType>(newParticipant);
  }

  async removeRoomParticipant(roomId: string, odules: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await RoomParticipant.findOneAndUpdate(
      { roomId, odules },
      { isActive: false, leftAt: new Date() }
    );
  }

  async getRoomParticipants(roomId: string): Promise<RoomParticipantType[]> {
    if (!this.isDbAvailable()) return [];
    const participants = await RoomParticipant.find({ roomId, isActive: true });
    return toPlainArray<RoomParticipantType>(participants);
  }

  async getNotifications(userId: string): Promise<NotificationType[]> {
    if (!this.isDbAvailable()) return [];
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    return toPlainArray<NotificationType>(notifications);
  }

  async createNotification(notification: InsertNotification): Promise<NotificationType> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    const data: any = cleanData(notification);
    if (!data.title && data.titleAr) data.title = data.titleAr;
    if (!data.message && data.messageAr) data.message = data.messageAr;
    const newNotification = await Notification.create(data);
    return toPlainObject<NotificationType>(newNotification);
  }

  async markNotificationAsRead(id: string, userId: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true, readAt: new Date() }
    );
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async deleteNotification(id: string, userId: string): Promise<void> {
    if (!this.isDbAvailable()) {
      throw new Error("MongoDB not available");
    }
    await Notification.findOneAndDelete({ _id: id, userId });
  }

  // Teacher methods
  async getTeachers(): Promise<UserType[]> {
    if (!this.isDbAvailable()) return [];
    const teachers = await User.find({ 
      role: { $in: ['teacher', 'supervisor'] },
      isActive: true 
    });
    return toPlainArray<UserType>(teachers);
  }

  async getTeachersCount(): Promise<number> {
    if (!this.isDbAvailable()) return 0;
    return await User.countDocuments({ 
      role: { $in: ['teacher', 'supervisor'] },
      isActive: true 
    });
  }

  // ─── Halaqa Operations ───────────────────────────────────────────────────────
  async getHalaqat(): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await Halaqa.find().sort({ createdAt: -1 }));
  }
  async getActiveHalaqat(): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await Halaqa.find({ isActive: true }).sort({ createdAt: -1 }));
  }
  async getHalaqa(id: string): Promise<any> {
    if (!this.isDbAvailable()) return undefined;
    const doc = await Halaqa.findById(id);
    return doc ? toPlainObject(doc) : undefined;
  }
  async getTeacherHalaqat(teacherId: string): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await Halaqa.find({ teacherId }).sort({ createdAt: -1 }));
  }
  async createHalaqa(halaqa: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await Halaqa.create(cleanData(halaqa));
    return toPlainObject(doc);
  }
  async updateHalaqa(id: string, updates: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await Halaqa.findByIdAndUpdate(id, { ...cleanData(updates), updatedAt: new Date() }, { new: true });
    if (!doc) throw new Error("Halaqa not found");
    return toPlainObject(doc);
  }
  async deleteHalaqa(id: string): Promise<void> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    await Halaqa.findByIdAndDelete(id);
  }
  async getHalaqaMembers(halaqaId: string): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await HalaqaMember.find({ halaqaId }));
  }
  async getStudentHalaqat(studentId: string): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await HalaqaMember.find({ studentId }));
  }
  async addHalaqaMember(member: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const existing = await HalaqaMember.findOneAndUpdate(
      { halaqaId: member.halaqaId, studentId: member.studentId },
      { $set: cleanData(member) },
      { upsert: true, new: true }
    );
    await Halaqa.findByIdAndUpdate(member.halaqaId, { $inc: { currentStudents: 1 } });
    return toPlainObject(existing);
  }
  async removeHalaqaMember(halaqaId: string, studentId: string): Promise<void> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    await HalaqaMember.deleteOne({ halaqaId, studentId });
    await Halaqa.findByIdAndUpdate(halaqaId, { $inc: { currentStudents: -1 } });
  }
  async updateHalaqaMember(halaqaId: string, studentId: string, updates: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await HalaqaMember.findOneAndUpdate({ halaqaId, studentId }, cleanData(updates), { new: true });
    if (!doc) throw new Error("Halaqa member not found");
    return toPlainObject(doc);
  }
  async getHalaqaSchedules(halaqaId: string): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await HalaqaSchedule.find({ halaqaId }));
  }
  async createHalaqaSchedule(schedule: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    return toPlainObject(await HalaqaSchedule.create(cleanData(schedule)));
  }
  async updateHalaqaSchedule(id: string, updates: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await HalaqaSchedule.findByIdAndUpdate(id, cleanData(updates), { new: true });
    if (!doc) throw new Error("Halaqa schedule not found");
    return toPlainObject(doc);
  }
  async deleteHalaqaSchedule(id: string): Promise<void> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    await HalaqaSchedule.findByIdAndDelete(id);
  }
  async getHalaqaAttendance(halaqaId: string, date?: string): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    const query: any = { halaqaId };
    if (date) query.sessionDate = date;
    return toPlainArray(await HalaqaAttendance.find(query));
  }
  async getStudentHalaqaAttendance(studentId: string): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await HalaqaAttendance.find({ studentId }).sort({ sessionDate: -1 }));
  }
  async recordHalaqaAttendance(attendance: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await HalaqaAttendance.findOneAndUpdate(
      { halaqaId: attendance.halaqaId, studentId: attendance.studentId, sessionDate: attendance.sessionDate },
      { $set: cleanData(attendance) },
      { upsert: true, new: true }
    );
    return toPlainObject(doc);
  }
  async updateHalaqaAttendance(id: string, updates: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await HalaqaAttendance.findByIdAndUpdate(id, cleanData(updates), { new: true });
    if (!doc) throw new Error("Attendance record not found");
    return toPlainObject(doc);
  }

  // ─── Homework Operations ─────────────────────────────────────────────────────
  async getHomework(id: string): Promise<any> {
    if (!this.isDbAvailable()) return undefined;
    const doc = await Homework.findById(id);
    return doc ? toPlainObject(doc) : undefined;
  }
  async getHomeworksByTeacher(teacherId: string): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await Homework.find({ createdBy: teacherId }).sort({ createdAt: -1 }));
  }
  async getHomeworksForStudent(studentId: string): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    const memberships = await HalaqaMember.find({ studentId });
    const halaqaIds = memberships.map(m => (m as any).halaqaId);
    return toPlainArray(await Homework.find({
      isActive: true,
      $or: [{ assignedTo: studentId }, { halaqaId: { $in: halaqaIds } }]
    }).sort({ dueDate: 1 }));
  }
  async getHomeworksByHalaqa(halaqaId: string): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await Homework.find({ halaqaId, isActive: true }).sort({ dueDate: 1 }));
  }
  async createHomework(homework: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    return toPlainObject(await Homework.create(cleanData(homework)));
  }
  async updateHomework(id: string, updates: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await Homework.findByIdAndUpdate(id, { ...cleanData(updates), updatedAt: new Date() }, { new: true });
    if (!doc) throw new Error("Homework not found");
    return toPlainObject(doc);
  }
  async deleteHomework(id: string): Promise<void> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    await Homework.findByIdAndDelete(id);
  }
  async getHomeworkSubmissions(homeworkId: string): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await HomeworkSubmission.find({ homeworkId }));
  }
  async getStudentSubmission(homeworkId: string, studentId: string): Promise<any> {
    if (!this.isDbAvailable()) return undefined;
    const doc = await HomeworkSubmission.findOne({ homeworkId, studentId });
    return doc ? toPlainObject(doc) : undefined;
  }
  async getStudentSubmissions(studentId: string): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await HomeworkSubmission.find({ studentId }).sort({ createdAt: -1 }));
  }
  async createHomeworkSubmission(submission: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await HomeworkSubmission.findOneAndUpdate(
      { homeworkId: submission.homeworkId, studentId: submission.studentId },
      { $set: { ...cleanData(submission), submittedAt: new Date(), status: 'submitted', updatedAt: new Date() } },
      { upsert: true, new: true }
    );
    return toPlainObject(doc);
  }
  async updateHomeworkSubmission(id: string, updates: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await HomeworkSubmission.findByIdAndUpdate(id, { ...cleanData(updates), updatedAt: new Date() }, { new: true });
    if (!doc) throw new Error("Submission not found");
    return toPlainObject(doc);
  }
  async gradeHomeworkSubmission(id: string, grading: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await HomeworkSubmission.findByIdAndUpdate(id, {
      grade: grading.grade,
      teacherFeedbackAr: grading.teacherFeedbackAr,
      teacherFeedbackEn: grading.teacherFeedbackEn,
      gradedBy: grading.gradedBy,
      gradedAt: grading.gradedAt || new Date(),
      status: grading.status || 'graded',
      updatedAt: new Date(),
    }, { new: true });
    if (!doc) throw new Error("Submission not found");
    return toPlainObject(doc);
  }

  // ─── Student Evaluation Operations ──────────────────────────────────────────
  async getStudentEvaluations(studentId: string): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await StudentEvaluation.find({ studentId }).sort({ evaluationDate: -1 }));
  }
  async getStudentEvaluation(id: string): Promise<any> {
    if (!this.isDbAvailable()) return undefined;
    const doc = await StudentEvaluation.findById(id);
    return doc ? toPlainObject(doc) : undefined;
  }
  async createStudentEvaluation(evaluation: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    return toPlainObject(await StudentEvaluation.create(cleanData(evaluation)));
  }
  async updateStudentEvaluation(id: string, updates: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await StudentEvaluation.findByIdAndUpdate(id, { ...cleanData(updates), updatedAt: new Date() }, { new: true });
    if (!doc) throw new Error("Evaluation not found");
    return toPlainObject(doc);
  }

  // ─── Parent Report Operations ────────────────────────────────────────────────
  async getParentReports(studentId: string): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await ParentReport.find({ studentId }).sort({ reportWeek: -1 }));
  }
  async getParentReport(id: string): Promise<any> {
    if (!this.isDbAvailable()) return undefined;
    const doc = await ParentReport.findById(id);
    return doc ? toPlainObject(doc) : undefined;
  }
  async createParentReport(report: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    return toPlainObject(await ParentReport.create(cleanData(report)));
  }
  async updateParentReport(id: string, updates: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await ParentReport.findByIdAndUpdate(id, cleanData(updates), { new: true });
    if (!doc) throw new Error("Parent report not found");
    return toPlainObject(doc);
  }

  // ─── Subscription Plan Operations ────────────────────────────────────────────
  private isObjectId(id: string): boolean {
    return /^[a-f\d]{24}$/i.test(id);
  }

  async getSubscriptionPlans(): Promise<any[]> {
    if (!this.isDbAvailable()) return SUBSCRIPTION_PLANS;
    const docs = await SubscriptionPlan.find().sort({ sortOrder: 1 });
    if (docs.length === 0) return SUBSCRIPTION_PLANS;
    return toPlainArray(docs);
  }
  async getActiveSubscriptionPlans(): Promise<any[]> {
    if (!this.isDbAvailable()) return SUBSCRIPTION_PLANS.filter(p => p.isActive);
    const docs = await SubscriptionPlan.find({ isActive: true }).sort({ sortOrder: 1 });
    if (docs.length === 0) return SUBSCRIPTION_PLANS.filter(p => p.isActive);
    return toPlainArray(docs);
  }
  async getSubscriptionPlan(id: string): Promise<any> {
    if (!this.isDbAvailable()) return getPlanById(id);
    try {
      if (this.isObjectId(id)) {
        const doc = await SubscriptionPlan.findById(id);
        if (doc) return toPlainObject(doc);
      }
    } catch {}
    const byStringId = await SubscriptionPlan.findOne({ planId: id } as any);
    if (byStringId) return toPlainObject(byStringId);
    return getPlanById(id) || undefined;
  }
  async createSubscriptionPlan(plan: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    return toPlainObject(await SubscriptionPlan.create(cleanData(plan)));
  }
  async updateSubscriptionPlan(id: string, updates: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    if (this.isObjectId(id)) {
      const doc = await SubscriptionPlan.findByIdAndUpdate(id, { ...cleanData(updates), updatedAt: new Date() }, { new: true });
      if (doc) return toPlainObject(doc);
    }
    throw new Error("Subscription plan not found");
  }
  async deleteSubscriptionPlan(id: string): Promise<void> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    if (this.isObjectId(id)) await SubscriptionPlan.findByIdAndDelete(id);
  }

  // ─── Subscription Operations ──────────────────────────────────────────────────
  async getSubscription(id: string): Promise<any> {
    if (!this.isDbAvailable()) return undefined;
    const doc = await Subscription.findById(id);
    return doc ? toPlainObject(doc) : undefined;
  }
  async getUserActiveSubscription(userId: string): Promise<any> {
    if (!this.isDbAvailable()) return undefined;
    const doc = await Subscription.findOne({ userId, status: 'active' }).sort({ createdAt: -1 });
    return doc ? toPlainObject(doc) : undefined;
  }
  async getUserSubscriptions(userId: string): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await Subscription.find({ userId }).sort({ createdAt: -1 }));
  }
  async getAllSubscriptions(filters: any): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    const query: any = {};
    if (filters?.status) query.status = filters.status;
    const limit = filters?.limit || 50;
    const skip = filters?.page ? (filters.page - 1) * limit : 0;
    return toPlainArray(await Subscription.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit));
  }
  async createSubscription(subscription: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    return toPlainObject(await Subscription.create(cleanData(subscription)));
  }
  async updateSubscription(id: string, updates: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await Subscription.findByIdAndUpdate(id, { ...cleanData(updates), updatedAt: new Date() }, { new: true });
    if (!doc) throw new Error("Subscription not found");
    return toPlainObject(doc);
  }
  async cancelSubscription(id: string, reason?: string): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await Subscription.findByIdAndUpdate(id, {
      status: 'cancelled',
      cancellationReason: reason,
      cancelledAt: new Date(),
      updatedAt: new Date(),
    }, { new: true });
    if (!doc) throw new Error("Subscription not found");
    return toPlainObject(doc);
  }

  // ─── Payment Transaction Operations ──────────────────────────────────────────
  async getUserPaymentTransactions(userId: string): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await PaymentTransaction.find({ userId }).sort({ createdAt: -1 }));
  }
  async getAllPaymentTransactions(filters: any): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    const query: any = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.gateway) query.paymentGateway = filters.gateway;
    const limit = filters?.limit || 50;
    const skip = filters?.page ? (filters.page - 1) * limit : 0;
    return toPlainArray(await PaymentTransaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit));
  }
  async createPaymentTransaction(transaction: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    return toPlainObject(await PaymentTransaction.create(cleanData(transaction)));
  }
  async updatePaymentTransaction(id: string, updates: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await PaymentTransaction.findByIdAndUpdate(id, { ...cleanData(updates), updatedAt: new Date() }, { new: true });
    if (!doc) throw new Error("Payment transaction not found");
    return toPlainObject(doc);
  }

  // ─── Payment Gateway Settings Operations ─────────────────────────────────────
  async getEnabledPaymentGateways(): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await PaymentGatewaySettings.find({ isEnabled: true }).sort({ sortOrder: 1 }));
  }
  async getAllPaymentGatewaySettings(): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await PaymentGatewaySettings.find().sort({ sortOrder: 1 }));
  }
  async updatePaymentGatewaySettings(gateway: string, settings: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await PaymentGatewaySettings.findOneAndUpdate(
      { gateway },
      { $set: { ...cleanData(settings), updatedAt: new Date() } },
      { upsert: true, new: true }
    );
    return toPlainObject(doc);
  }

  // ─── Bank Transfer Request Operations ────────────────────────────────────────
  async createBankTransferRequest(request: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    return toPlainObject(await BankTransferRequest.create(cleanData(request)));
  }
  async getBankTransferRequest(id: string): Promise<any> {
    if (!this.isDbAvailable()) return undefined;
    const doc = await BankTransferRequest.findById(id);
    return doc ? toPlainObject(doc) : undefined;
  }
  async getUserBankTransferRequests(userId: string): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await BankTransferRequest.find({ userId }).sort({ createdAt: -1 }));
  }
  async getAllBankTransferRequests(filters?: any): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    const query: any = {};
    if (filters?.status) query.status = filters.status;
    return toPlainArray(await BankTransferRequest.find(query).sort({ createdAt: -1 }));
  }
  async updateBankTransferRequest(id: string, updates: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await BankTransferRequest.findByIdAndUpdate(id, { ...cleanData(updates), updatedAt: new Date() }, { new: true });
    if (!doc) throw new Error("Bank transfer request not found");
    return toPlainObject(doc);
  }
  async approveBankTransferRequest(id: string, reviewedBy: string, notes?: string): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await BankTransferRequest.findByIdAndUpdate(id, {
      status: 'approved', reviewedBy, reviewNotes: notes, reviewedAt: new Date(), updatedAt: new Date()
    }, { new: true });
    if (!doc) throw new Error("Bank transfer request not found");
    return toPlainObject(doc);
  }
  async rejectBankTransferRequest(id: string, reviewedBy: string, reason: string): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await BankTransferRequest.findByIdAndUpdate(id, {
      status: 'rejected', reviewedBy, rejectionReason: reason, reviewedAt: new Date(), updatedAt: new Date()
    }, { new: true });
    if (!doc) throw new Error("Bank transfer request not found");
    return toPlainObject(doc);
  }

  // ─── Lesson Reminder Operations ───────────────────────────────────────────────
  async createLessonReminder(reminder: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    return toPlainObject(await LessonReminder.create(cleanData(reminder)));
  }
  async getLessonReminder(id: string): Promise<any> {
    if (!this.isDbAvailable()) return undefined;
    const doc = await LessonReminder.findById(id);
    return doc ? toPlainObject(doc) : undefined;
  }
  async getUserLessonReminders(userId: string): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await LessonReminder.find({ userId }).sort({ scheduledFor: 1 }));
  }
  async getPendingReminders(beforeTime: Date): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await LessonReminder.find({ status: 'pending', scheduledFor: { $lte: beforeTime } }));
  }
  async updateLessonReminder(id: string, updates: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await LessonReminder.findByIdAndUpdate(id, { ...cleanData(updates), updatedAt: new Date() }, { new: true });
    if (!doc) throw new Error("Reminder not found");
    return toPlainObject(doc);
  }
  async markReminderSent(id: string): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await LessonReminder.findByIdAndUpdate(id, { status: 'sent', sentAt: new Date(), updatedAt: new Date() }, { new: true });
    if (!doc) throw new Error("Reminder not found");
    return toPlainObject(doc);
  }
  async cancelReminder(id: string): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await LessonReminder.findByIdAndUpdate(id, { status: 'cancelled', updatedAt: new Date() }, { new: true });
    if (!doc) throw new Error("Reminder not found");
    return toPlainObject(doc);
  }
  async getPendingRemindersToSend(): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    return toPlainArray(await LessonReminder.find({
      status: 'pending',
      scheduledFor: { $lte: new Date() }
    }).limit(50));
  }

  // ─── Academy Settings ─────────────────────────────────────────────────────────
  async getAcademySettings(): Promise<any> {
    if (!this.isDbAvailable()) return {};
    const doc = await AcademySettings.findOne({ key: 'global' });
    return doc ? (doc as any).settings || {} : {};
  }
  async updateAcademySettings(settings: any): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const doc = await AcademySettings.findOneAndUpdate(
      { key: 'global' },
      { $set: { settings, updatedAt: new Date() } },
      { upsert: true, new: true }
    );
    return (doc as any).settings;
  }

  // ─── Dashboard & Statistics ───────────────────────────────────────────────────
  async getStudentsCount(): Promise<number> {
    if (!this.isDbAvailable()) return 0;
    return await Student.countDocuments();
  }

  async getGroupsCount(): Promise<number> {
    if (!this.isDbAvailable()) return 0;
    return await Halaqa.countDocuments();
  }

  async getSubscriptionStats(): Promise<{ active: number; expired: number; pending: number; cancelled: number }> {
    if (!this.isDbAvailable()) return { active: 0, expired: 0, pending: 0, cancelled: 0 };
    const [active, expired, pending, cancelled] = await Promise.all([
      Subscription.countDocuments({ status: 'active' }),
      Subscription.countDocuments({ status: 'expired' }),
      Subscription.countDocuments({ status: 'pending' }),
      Subscription.countDocuments({ status: 'cancelled' }),
    ]);
    return { active, expired, pending, cancelled };
  }

  async getDashboardStats(): Promise<{
    totalStudents: number;
    totalTeachers: number;
    totalGroups: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    pendingPayments: number;
  }> {
    const [totalStudents, totalTeachers, totalGroups, subStats] = await Promise.all([
      this.getStudentsCount(),
      this.getTeachersCount(),
      this.getGroupsCount(),
      this.getSubscriptionStats(),
    ]);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenue = await PaymentTransaction.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } },
    ]);
    return {
      totalStudents,
      totalTeachers,
      totalGroups,
      activeSubscriptions: subStats.active,
      monthlyRevenue: revenue[0]?.total || 0,
      pendingPayments: subStats.pending,
    };
  }

  async getAttendanceReport(filters: { date?: string; startDate?: string; endDate?: string }): Promise<any> {
    if (!this.isDbAvailable()) return { sessions: [], summary: { total: 0, attended: 0, absent: 0 } };
    const query: any = {};
    if (filters.date) {
      const d = new Date(filters.date);
      query.scheduledDate = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    } else if (filters.startDate || filters.endDate) {
      query.scheduledDate = {};
      if (filters.startDate) query.scheduledDate.$gte = new Date(filters.startDate);
      if (filters.endDate) query.scheduledDate.$lte = new Date(filters.endDate);
    }
    const sessions = await HalaqaAttendance.find(query).lean();
    const total = sessions.length;
    const attended = sessions.filter((s: any) => s.status === 'present').length;
    return {
      sessions: sessions.map(toPlainObject),
      summary: { total, attended, absent: total - attended },
    };
  }

  async getRevenueReport(filters: { period: string; startDate?: string; endDate?: string }): Promise<any> {
    if (!this.isDbAvailable()) return { total: 0, transactions: [] };
    const query: any = { status: 'completed' };
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    } else if (filters.period === 'monthly') {
      const now = new Date();
      query.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
    } else if (filters.period === 'yearly') {
      const now = new Date();
      query.createdAt = { $gte: new Date(now.getFullYear(), 0, 1) };
    }
    const transactions = await PaymentTransaction.find(query).lean();
    const total = transactions.reduce((sum: number, t: any) => sum + parseFloat(t.amount || '0'), 0);
    return { total, transactions: transactions.map(toPlainObject) };
  }

  async getOverduePayments(): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    const overdue = await Subscription.find({ status: 'payment_overdue' }).lean();
    return overdue.map(toPlainObject);
  }

  async getStudentProgressReport(filters: { studentId?: string; teacherId?: string }): Promise<any> {
    if (!this.isDbAvailable()) return { students: [], summary: {} };
    const query: any = {};
    if (filters.studentId) query._id = filters.studentId;
    if (filters.teacherId) query.sheikhId = filters.teacherId;
    const studentsData = await Student.find(query).lean();
    return {
      students: studentsData.map(toPlainObject),
      summary: { totalStudents: studentsData.length },
    };
  }

  // ─── User Management ──────────────────────────────────────────────────────────
  async updateUserRole(id: string, role: string): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const user = await User.findByIdAndUpdate(id, { role, updatedAt: new Date() }, { new: true }).lean();
    if (!user) throw new Error("User not found");
    return toPlainObject(user);
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const user = await User.findByIdAndUpdate(id, { isActive, updatedAt: new Date() }, { new: true }).lean();
    if (!user) throw new Error("User not found");
    return toPlainObject(user);
  }

  // ─── Contact Messages ─────────────────────────────────────────────────────────
  async markMessageAsRead(id: string): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const msg = await ContactMessage.findByIdAndUpdate(id, { isRead: true }, { new: true }).lean();
    if (!msg) throw new Error("Message not found");
    return toPlainObject(msg);
  }

  // ─── Teacher Management ───────────────────────────────────────────────────────
  async assignStudentToTeacher(teacherId: string, studentId: string): Promise<any> {
    if (!this.isDbAvailable()) throw new Error("MongoDB not available");
    const student = await Student.findByIdAndUpdate(
      studentId,
      { sheikhId: teacherId, updatedAt: new Date() },
      { new: true }
    ).lean();
    if (!student) throw new Error("Student not found");
    return toPlainObject(student);
  }

  // ─── Quizzes ──────────────────────────────────────────────────────────────────
  async getAllQuizzes(): Promise<any[]> {
    if (!this.isDbAvailable()) return [];
    const quizzes = await Quiz.find().lean();
    return quizzes.map(toPlainObject);
  }

  // ─── Student Creation ─────────────────────────────────────────────────────────
  async findOrCreateStudentForUser(userId: string, userData: { firstName?: string; phoneNumber?: string; passwordHash?: string }): Promise<any> {
    if (!this.isDbAvailable()) return null;
    let student = await Student.findOne({ userId }).lean();
    if (student) return toPlainObject(student);
    if (userData.phoneNumber) {
      student = await Student.findOne({ phoneNumber: userData.phoneNumber }).lean();
      if (student) {
        const updated = await Student.findByIdAndUpdate(
          (student as any)._id,
          { userId, updatedAt: new Date() },
          { new: true }
        ).lean();
        return toPlainObject(updated);
      }
    }
    const name = userData.firstName || 'طالب';
    const hashedPassword = userData.passwordHash
      ? (userData.passwordHash.startsWith('$2') ? userData.passwordHash : await hashPassword(userData.passwordHash))
      : await hashPassword('password123');
    const created = await Student.create({
      userId,
      studentName: name,
      phoneNumber: userData.phoneNumber || '',
      passwordHash: hashedPassword,
    });
    return toPlainObject(created);
  }

  // ─── Auto Mark Absent ─────────────────────────────────────────────────────────
  async autoMarkAbsentStudents(): Promise<number> {
    if (!this.isDbAvailable()) return 0;
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    const result = await HalaqaAttendance.updateMany(
      { status: 'pending', scheduledDate: { $lt: cutoff } },
      { $set: { status: 'absent', updatedAt: new Date() } }
    );
    return result.modifiedCount || 0;
  }
}

export const mongoStorage = new MongoDBStorage();
