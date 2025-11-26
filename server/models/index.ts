import mongoose, { Schema, Document } from 'mongoose';

// Session Schema (for express-session)
const sessionSchema = new Schema({
  _id: { type: String, required: true },
  expires: { type: Date, required: true },
  session: { type: Schema.Types.Mixed, required: true },
});
export const Session = mongoose.model('Session', sessionSchema);

// User Schema
const userSchema = new Schema({
  email: { type: String, unique: true, sparse: true },
  firstName: String,
  lastName: String,
  profileImageUrl: String,
  role: { type: String, default: 'student' },
  passwordHash: String,
  phoneNumber: { type: String, sparse: true },
  age: Number,
  educationLevel: String,
  quranExperience: String,
  memorization_level: String,
  learningGoals: String,
  preferredTime: String,
  whatsappNumber: String,
  emailVerified: { type: Boolean, default: false },
  passwordResetToken: String,
  passwordResetExpiry: Date,
  isActive: { type: Boolean, default: true },
  registrationCompleted: { type: Boolean, default: false },
}, { timestamps: true });
userSchema.index({ phoneNumber: 1 });
userSchema.index({ email: 1 });
export const User = mongoose.model('User', userSchema);

// Instructor Schema
const instructorSchema = new Schema({
  nameAr: { type: String, required: true },
  nameEn: String,
  titleAr: String,
  titleEn: String,
  bioAr: String,
  bioEn: String,
  profileImageUrl: String,
  qualifications: String,
  experience: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const Instructor = mongoose.model('Instructor', instructorSchema);

// Course Schema
const courseSchema = new Schema({
  titleAr: { type: String, required: true },
  titleEn: String,
  descriptionAr: String,
  descriptionEn: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  instructorId: { type: Schema.Types.ObjectId, ref: 'Instructor' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  level: { type: String, required: true },
  category: { type: String, required: true },
  maxStudents: { type: Number, default: 50 },
  currentStudents: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  thumbnailUrl: String,
  primaryColor: { type: String, default: '#10b981' },
  secondaryColor: { type: String, default: '#f97316' },
  backgroundColor: { type: String, default: '#ffffff' },
  textColor: { type: String, default: '#1f2937' },
  selectedStudentIds: [{ type: String }],
  certificateTemplateUrl: String,
  generateCertificate: { type: Boolean, default: true },
  certificateType: { type: String, default: 'auto' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const Course = mongoose.model('Course', courseSchema);

// Course Enrollment Schema
const courseEnrollmentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  enrollmentDate: { type: Date, default: Date.now },
  status: { type: String, default: 'enrolled' },
  progress: { type: Number, default: 0 },
}, { timestamps: true });
courseEnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
export const CourseEnrollment = mongoose.model('CourseEnrollment', courseEnrollmentSchema);

// Course Module Schema
const courseModuleSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  titleAr: { type: String, required: true },
  titleEn: String,
  descriptionAr: String,
  descriptionEn: String,
  contentAr: String,
  contentEn: String,
  orderIndex: { type: Number, default: 0 },
  videoUrl: String,
  documentUrl: String,
  duration: Number,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const CourseModule = mongoose.model('CourseModule', courseModuleSchema);

// Course Stage Schema
const courseStageSchema = new Schema({
  moduleId: { type: Schema.Types.ObjectId, ref: 'CourseModule', required: true },
  titleAr: { type: String, required: true },
  titleEn: String,
  descriptionAr: String,
  descriptionEn: String,
  orderIndex: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },
  passingScore: { type: Number, default: 75 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const CourseStage = mongoose.model('CourseStage', courseStageSchema);

// Course Upload Schema
const courseUploadSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  stageId: { type: Schema.Types.ObjectId, ref: 'CourseStage' },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: Number,
  titleAr: String,
  titleEn: String,
  descriptionAr: String,
  descriptionEn: String,
  orderIndex: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const CourseUpload = mongoose.model('CourseUpload', courseUploadSchema);

// Contact Message Schema
const contactMessageSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  subject: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });
export const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

// Student Schema
const studentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  sheikhId: { type: Schema.Types.ObjectId, ref: 'User' },
  studentName: { type: String, required: true },
  passwordHash: { type: String, required: true },
  phoneNumber: String,
  dateOfBirth: Date,
  grade: String,
  monthlySessionsCount: { type: Number, default: 0 },
  monthlyPrice: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  memorizedSurahs: String,
  currentLevel: { type: String, default: 'beginner' },
  notes: String,
  whatsappContact: { type: String, default: '+966532441566' },
}, { timestamps: true });
studentSchema.index({ studentName: 1 });
studentSchema.index({ sheikhId: 1 });
export const Student = mongoose.model('Student', studentSchema);

// Student Session Schema
const studentSessionSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  sessionNumber: { type: Number, required: true },
  sessionDate: { type: Date, required: true },
  sessionTime: String,
  evaluationGrade: String,
  nextSessionDate: Date,
  newMaterial: String,
  reviewMaterial: String,
  notes: String,
  attended: { type: Boolean, default: false },
}, { timestamps: true });
studentSessionSchema.index({ studentId: 1 });
export const StudentSession = mongoose.model('StudentSession', studentSessionSchema);

// Student Error Schema
const studentErrorSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  sheikhId: { type: Schema.Types.ObjectId, ref: 'User' },
  surahNumber: { type: Number, required: true },
  surahName: { type: String, required: true },
  ayahNumber: { type: Number, required: true },
  wordIndex: Number,
  errorType: { type: String, default: 'recitation' },
  errorDescription: String,
  sheikhNote: String,
  severity: { type: String, default: 'medium' },
  isResolved: { type: Boolean, default: false },
  resolvedDate: Date,
}, { timestamps: true });
studentErrorSchema.index({ studentId: 1 });
studentErrorSchema.index({ surahNumber: 1, ayahNumber: 1 });
export const StudentError = mongoose.model('StudentError', studentErrorSchema);

// Student Payment Schema
const studentPaymentSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'SAR' },
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, default: 'whatsapp' },
  subscriptionPeriod: { type: String, default: 'monthly' },
  sessionsIncluded: { type: Number, required: true },
  sessionsRemaining: { type: Number, required: true },
  expiryDate: Date,
  status: { type: String, default: 'active' },
  notes: String,
}, { timestamps: true });
export const StudentPayment = mongoose.model('StudentPayment', studentPaymentSchema);

// Class Schedule Schema
const classScheduleSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  dayOfWeek: { type: Number, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const ClassSchedule = mongoose.model('ClassSchedule', classScheduleSchema);

// Supervisor Schema
const supervisorSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  whatsappNumber: { type: String, required: true },
  specialization: String,
  experience: String,
  qualifications: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const Supervisor = mongoose.model('Supervisor', supervisorSchema);

// Student Note Schema
const studentNoteSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: String, required: true },
  noteType: { type: String, default: 'general' },
  isPrivate: { type: Boolean, default: false },
}, { timestamps: true });
export const StudentNote = mongoose.model('StudentNote', studentNoteSchema);

// Certificate Schema
const certificateSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
  studentName: { type: String, required: true },
  courseName: String,
  achievementType: { type: String, required: true },
  achievementDetails: String,
  verificationToken: { type: String, required: true, unique: true },
  issueDate: { type: Date, default: Date.now },
  expiryDate: Date,
  sheikhName: String,
  sheikhSignature: String,
  organizationName: String,
  certificateUrl: String,
  isValid: { type: Boolean, default: true },
}, { timestamps: true });
certificateSchema.index({ verificationToken: 1 });
export const Certificate = mongoose.model('Certificate', certificateSchema);

// Quran Progress Schema
const quranProgressSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  lastSurah: { type: Number, default: 1 },
  lastAyah: { type: Number, default: 1 },
  bookmarkedVerses: String,
}, { timestamps: true });
export const QuranProgress = mongoose.model('QuranProgress', quranProgressSchema);

// Quran Word Highlight Schema
const quranWordHighlightSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  surahNumber: { type: Number, required: true },
  ayahNumber: { type: Number, required: true },
  wordIndex: { type: Number, required: true },
  highlightType: { type: String, default: 'highlight' },
  color: { type: String, default: '#ffd700' },
  note: String,
}, { timestamps: true });
quranWordHighlightSchema.index({ studentId: 1, surahNumber: 1, ayahNumber: 1 });
export const QuranWordHighlight = mongoose.model('QuranWordHighlight', quranWordHighlightSchema);

// Quran Memorization Schema
const quranMemorizationSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  surahNumber: { type: Number, required: true },
  startAyah: { type: Number, required: true },
  endAyah: { type: Number, required: true },
  status: { type: String, default: 'learning' },
  masteryLevel: { type: Number, default: 0 },
  lastReviewed: Date,
  nextReviewDate: Date,
  reviewCount: { type: Number, default: 0 },
  notes: String,
}, { timestamps: true });
quranMemorizationSchema.index({ studentId: 1, surahNumber: 1 });
export const QuranMemorization = mongoose.model('QuranMemorization', quranMemorizationSchema);

// Quran Reading Stats Schema
const quranReadingStatsSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  versesRead: { type: Number, default: 0 },
  pagesRead: { type: Number, default: 0 },
  minutesSpent: { type: Number, default: 0 },
  surahsCompleted: [Number],
}, { timestamps: true });
quranReadingStatsSchema.index({ studentId: 1, date: 1 }, { unique: true });
export const QuranReadingStats = mongoose.model('QuranReadingStats', quranReadingStatsSchema);

// Quran Ayah Marker Schema
const quranAyahMarkerSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  surahNumber: { type: Number, required: true },
  ayahNumber: { type: Number, required: true },
  markerType: { type: String, required: true },
  color: String,
  note: String,
}, { timestamps: true });
quranAyahMarkerSchema.index({ studentId: 1, surahNumber: 1 });
export const QuranAyahMarker = mongoose.model('QuranAyahMarker', quranAyahMarkerSchema);

// Quran Recitation Attempt Schema
const quranRecitationAttemptSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  surahNumber: { type: Number, required: true },
  startAyah: { type: Number, required: true },
  endAyah: { type: Number, required: true },
  audioUrl: String,
  score: Number,
  feedback: String,
  errors: String,
  mode: { type: String, default: 'practice' },
}, { timestamps: true });
export const QuranRecitationAttempt = mongoose.model('QuranRecitationAttempt', quranRecitationAttemptSchema);

// Quran Note Schema
const quranNoteSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sheikhId: { type: Schema.Types.ObjectId, ref: 'User' },
  surahNumber: { type: Number, required: true },
  ayahNumber: { type: Number, required: true },
  note: String,
  noteText: String,
  noteType: { type: String, default: 'student' },
  tags: String,
  isVisible: { type: Boolean, default: true },
}, { timestamps: true });
quranNoteSchema.index({ studentId: 1 });
quranNoteSchema.index({ sheikhId: 1 });
quranNoteSchema.index({ surahNumber: 1, ayahNumber: 1 });
export const QuranNote = mongoose.model('QuranNote', quranNoteSchema);

// Session Access Schema
const sessionAccessSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  scheduleId: { type: Schema.Types.ObjectId, ref: 'ClassSchedule', required: true },
  sessionDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  zoomLink: String,
  isEnabled: { type: Boolean, default: false },
  enabledBy: { type: Schema.Types.ObjectId, ref: 'User' },
  enabledAt: Date,
}, { timestamps: true });
export const SessionAccess = mongoose.model('SessionAccess', sessionAccessSchema);

// Daily Assignment Schema
const dailyAssignmentSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  assignmentDate: { type: Date, required: true },
  memorization: String,
  review: String,
  mistakes: String,
  notes: String,
  assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
dailyAssignmentSchema.index({ studentId: 1, assignmentDate: 1 });
export const DailyAssignment = mongoose.model('DailyAssignment', dailyAssignmentSchema);

// Trip Schema
const tripSchema = new Schema({
  titleAr: { type: String, required: true },
  titleEn: String,
  descriptionAr: String,
  descriptionEn: String,
  tripDate: { type: Date, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, default: 50 },
  currentEnrollments: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  imageUrl: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const Trip = mongoose.model('Trip', tripSchema);

// Trip Enrollment Schema
const tripEnrollmentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
  enrollmentDate: { type: Date, default: Date.now },
  status: { type: String, default: 'enrolled' },
}, { timestamps: true });
tripEnrollmentSchema.index({ userId: 1, tripId: 1 }, { unique: true });
export const TripEnrollment = mongoose.model('TripEnrollment', tripEnrollmentSchema);

// Exam Question Schema
const examQuestionSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  questionType: { type: String, default: 'multiple_choice' },
  questionAr: { type: String, required: true },
  questionEn: String,
  optionsAr: String,
  optionsEn: String,
  correctAnswer: Number,
  explanation: String,
  points: { type: Number, default: 1 },
  gradingType: { type: String, default: 'auto' },
  orderIndex: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const ExamQuestion = mongoose.model('ExamQuestion', examQuestionSchema);

// Exam Attempt Schema
const examAttemptSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  answers: { type: String, required: true },
  score: { type: Number, required: true },
  totalPoints: { type: Number, required: true },
  percentage: { type: Number, required: true },
  manualScore: Number,
  manualFeedback: String,
  gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  gradedAt: Date,
  gradingStatus: { type: String, default: 'auto_graded' },
  passed: { type: Boolean, default: false },
  startTime: { type: Date, required: true },
  submitTime: { type: Date, required: true },
  timeTaken: Number,
  certificateIssued: { type: Boolean, default: false },
}, { timestamps: true });
export const ExamAttempt = mongoose.model('ExamAttempt', examAttemptSchema);

// Shopping Cart Schema
const shoppingCartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  addedAt: { type: Date, default: Date.now },
}, { timestamps: true });
export const ShoppingCart = mongoose.model('ShoppingCart', shoppingCartSchema);

// Course Payment Schema
const coursePaymentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  bankAccountNumber: { type: String, default: 'eg0123456789' },
  ewalletNumber: { type: String, default: '01155201921' },
  receiptUrl: String,
  receiptFilename: String,
  senderPhoneNumber: String,
  status: { type: String, default: 'pending' },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  rejectionReason: String,
  notes: String,
}, { timestamps: true });
export const CoursePayment = mongoose.model('CoursePayment', coursePaymentSchema);

// Course Review Schema
const courseReviewSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: String,
  isApproved: { type: Boolean, default: false },
}, { timestamps: true });
courseReviewSchema.index({ courseId: 1, userId: 1 }, { unique: true });
export const CourseReview = mongoose.model('CourseReview', courseReviewSchema);

// Live Annotation Schema
const liveAnnotationSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sheikhId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  surahNumber: { type: Number, required: true },
  ayahNumber: { type: Number, required: true },
  wordIndex: Number,
  annotationType: { type: String, required: true },
  content: String,
  color: { type: String, default: '#ff0000' },
  positionData: String,
  isActive: { type: Boolean, default: true },
  sessionId: String,
}, { timestamps: true });
liveAnnotationSchema.index({ studentId: 1, surahNumber: 1, ayahNumber: 1 });
export const LiveAnnotation = mongoose.model('LiveAnnotation', liveAnnotationSchema);

// Live Room Schema
const liveRoomSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  sheikhId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  roomToken: { type: String, required: true, unique: true },
  sessionDate: { type: Date, required: true },
  sessionTime: String,
  status: { type: String, default: 'waiting' },
  startedAt: Date,
  endedAt: Date,
  currentSurah: Number,
  currentAyah: Number,
  whiteboardState: String,
}, { timestamps: true });
liveRoomSchema.index({ roomToken: 1 });
export const LiveRoom = mongoose.model('LiveRoom', liveRoomSchema);

// Room Participant Schema
const roomParticipantSchema = new Schema({
  roomId: { type: Schema.Types.ObjectId, ref: 'LiveRoom', required: true },
  odules: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, default: 'participant' },
  joinedAt: { type: Date, default: Date.now },
  leftAt: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const RoomParticipant = mongoose.model('RoomParticipant', roomParticipantSchema);

// Message Schema
const messageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  messageType: { type: String, default: 'text' },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  attachmentUrl: String,
  attachmentType: String,
}, { timestamps: true });
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ receiverId: 1 });
export const Message = mongoose.model('Message', messageSchema);

// Notification Schema
const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'info' },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  actionUrl: String,
  metadata: String,
}, { timestamps: true });
notificationSchema.index({ userId: 1 });
export const Notification = mongoose.model('Notification', notificationSchema);

// Session Access Control Schema
const sessionAccessControlSchema = new Schema({
  sheikhId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  sessionDate: { type: Date, required: true },
  isEnabled: { type: Boolean, default: false },
  enabledAt: Date,
  disabledAt: Date,
  notes: String,
}, { timestamps: true });
sessionAccessControlSchema.index({ sheikhId: 1, studentId: 1, sessionDate: 1 }, { unique: true });
export const SessionAccessControl = mongoose.model('SessionAccessControl', sessionAccessControlSchema);

// Quiz Schema
const quizSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  titleAr: { type: String, required: true },
  titleEn: String,
  passingScore: { type: Number, default: 75 },
  timeLimit: Number,
  questions: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const Quiz = mongoose.model('Quiz', quizSchema);

// Quiz Attempt Schema
const quizAttemptSchema = new Schema({
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  score: { type: Number, required: true },
  answers: String,
  passed: { type: Boolean, default: false },
  attemptDate: { type: Date, default: Date.now },
  completedAt: Date,
  antiCheatLog: String,
}, { timestamps: true });
export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
