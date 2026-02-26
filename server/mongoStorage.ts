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
} from "./models";
import { hashPassword, verifyPassword } from "./authUtils";
import { isMongoConnected } from "./mongodb";
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

  async getContactMessages(): Promise<ContactMessageType[]> {
    if (!this.isDbAvailable()) return [];
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
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
    const now = new Date();
    const result = await SessionAccess.deleteMany({
      sessionDate: { $lt: now },
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
    
    const students = await Student.find({ sheikhId, isActive: true });
    const studentIds = students.map(s => s._id);
    
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
    
    const accesses = await SessionAccess.find({
      studentId: { $in: studentIds },
      ...dateQuery
    }).populate('studentId');
    
    return accesses.map(access => {
      const student = access.studentId as any;
      return {
        ...toPlainObject<SessionAccessType>(access),
        studentName: student?.studentName || 'Unknown',
        studentPhone: student?.phoneNumber || null,
      } as SheikhSessionView;
    });
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
    const newNotification = await Notification.create(cleanData(notification) as any);
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

  // Halaqa stub methods - MongoDB storage uses PostgreSQL for halaqat data
  async getHalaqat(): Promise<any[]> { return []; }
  async getActiveHalaqat(): Promise<any[]> { return []; }
  async getHalaqa(id: string): Promise<any> { return undefined; }
  async getTeacherHalaqat(teacherId: string): Promise<any[]> { return []; }
  async createHalaqa(halaqa: any): Promise<any> { throw new Error("Halaqat operations require PostgreSQL"); }
  async updateHalaqa(id: string, halaqa: any): Promise<any> { throw new Error("Halaqat operations require PostgreSQL"); }
  async deleteHalaqa(id: string): Promise<void> { throw new Error("Halaqat operations require PostgreSQL"); }
  async getHalaqaMembers(halaqaId: string): Promise<any[]> { return []; }
  async getStudentHalaqat(studentId: string): Promise<any[]> { return []; }
  async addHalaqaMember(member: any): Promise<any> { throw new Error("Halaqat operations require PostgreSQL"); }
  async removeHalaqaMember(halaqaId: string, studentId: string): Promise<void> { throw new Error("Halaqat operations require PostgreSQL"); }
  async updateHalaqaMember(halaqaId: string, studentId: string, updates: any): Promise<any> { throw new Error("Halaqat operations require PostgreSQL"); }
  async getHalaqaSchedules(halaqaId: string): Promise<any[]> { return []; }
  async createHalaqaSchedule(schedule: any): Promise<any> { throw new Error("Halaqat operations require PostgreSQL"); }
  async updateHalaqaSchedule(id: string, schedule: any): Promise<any> { throw new Error("Halaqat operations require PostgreSQL"); }
  async deleteHalaqaSchedule(id: string): Promise<void> { throw new Error("Halaqat operations require PostgreSQL"); }
  async getHalaqaAttendance(halaqaId: string, date?: string): Promise<any[]> { return []; }
  async getStudentHalaqaAttendance(studentId: string): Promise<any[]> { return []; }
  async recordHalaqaAttendance(attendance: any): Promise<any> { throw new Error("Halaqat operations require PostgreSQL"); }
  async updateHalaqaAttendance(id: string, updates: any): Promise<any> { throw new Error("Halaqat operations require PostgreSQL"); }

  // Homework stub methods - MongoDB storage uses PostgreSQL for homework data
  async getHomework(id: string): Promise<any> { return undefined; }
  async getHomeworksByTeacher(teacherId: string): Promise<any[]> { return []; }
  async getHomeworksForStudent(studentId: string): Promise<any[]> { return []; }
  async getHomeworksByHalaqa(halaqaId: string): Promise<any[]> { return []; }
  async createHomework(homework: any): Promise<any> { throw new Error("Homework operations require PostgreSQL"); }
  async updateHomework(id: string, updates: any): Promise<any> { throw new Error("Homework operations require PostgreSQL"); }
  async deleteHomework(id: string): Promise<void> { throw new Error("Homework operations require PostgreSQL"); }
  
  // Homework submission stub methods
  async getHomeworkSubmissions(homeworkId: string): Promise<any[]> { return []; }
  async getStudentSubmission(homeworkId: string, studentId: string): Promise<any> { return undefined; }
  async getStudentSubmissions(studentId: string): Promise<any[]> { return []; }
  async createHomeworkSubmission(submission: any): Promise<any> { throw new Error("Homework operations require PostgreSQL"); }
  async updateHomeworkSubmission(id: string, updates: any): Promise<any> { throw new Error("Homework operations require PostgreSQL"); }
  async gradeHomeworkSubmission(id: string, grading: any): Promise<any> { throw new Error("Homework operations require PostgreSQL"); }
  
  // Student evaluation stub methods
  async getStudentEvaluations(studentId: string): Promise<any[]> { return []; }
  async getStudentEvaluation(id: string): Promise<any> { return undefined; }
  async createStudentEvaluation(evaluation: any): Promise<any> { throw new Error("Evaluation operations require PostgreSQL"); }
  async updateStudentEvaluation(id: string, updates: any): Promise<any> { throw new Error("Evaluation operations require PostgreSQL"); }
  
  // Parent report stub methods
  async getParentReports(studentId: string): Promise<any[]> { return []; }
  async getParentReport(id: string): Promise<any> { return undefined; }
  async createParentReport(report: any): Promise<any> { throw new Error("Parent report operations require PostgreSQL"); }
  async updateParentReport(id: string, updates: any): Promise<any> { throw new Error("Parent report operations require PostgreSQL"); }

  // Subscription plan stub methods - uses JSON fallback
  async getSubscriptionPlans(): Promise<any[]> { return []; }
  async getActiveSubscriptionPlans(): Promise<any[]> { return []; }
  async getSubscriptionPlan(id: string): Promise<any> { return undefined; }
  async createSubscriptionPlan(plan: any): Promise<any> { throw new Error("Subscription operations require PostgreSQL or JSON fallback"); }
  async updateSubscriptionPlan(id: string, plan: any): Promise<any> { throw new Error("Subscription operations require PostgreSQL or JSON fallback"); }
  async deleteSubscriptionPlan(id: string): Promise<void> { throw new Error("Subscription operations require PostgreSQL or JSON fallback"); }

  // Subscription stub methods
  async getSubscription(id: string): Promise<any> { return undefined; }
  async getUserActiveSubscription(userId: string): Promise<any> { return undefined; }
  async getUserSubscriptions(userId: string): Promise<any[]> { return []; }
  async getAllSubscriptions(filters: any): Promise<any[]> { return []; }
  async createSubscription(subscription: any): Promise<any> { throw new Error("Subscription operations require PostgreSQL"); }
  async cancelSubscription(id: string): Promise<any> { throw new Error("Subscription operations require PostgreSQL"); }

  // Payment transaction stub methods
  async getUserPaymentTransactions(userId: string): Promise<any[]> { return []; }
  async getAllPaymentTransactions(filters: any): Promise<any[]> { return []; }
  async createPaymentTransaction(transaction: any): Promise<any> { throw new Error("Payment operations require PostgreSQL"); }

  // Payment gateway settings stub methods
  async getEnabledPaymentGateways(): Promise<any[]> { return []; }
  async getAllPaymentGatewaySettings(): Promise<any[]> { return []; }
  async updatePaymentGatewaySettings(gateway: string, settings: any): Promise<any> { throw new Error("Payment gateway operations require PostgreSQL"); }
}

export const mongoStorage = new MongoDBStorage();
