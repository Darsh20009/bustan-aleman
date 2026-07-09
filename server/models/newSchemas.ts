/**
 * نماذج MongoDB الجديدة لمنصة بستان الإيمان
 * المرحلة الأولى - البنية الأساسية
 */
import mongoose, { Schema, Document } from 'mongoose';

// ========================
// Teachers (New Schema)
// ========================
const teacherSchema = new Schema({
  userId:           { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId:         { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  specialization:   String,
  experienceYears:  { type: Number, default: 0 },
  rating:           { type: Number, default: 0, min: 0, max: 5 },
  isActive:         { type: Boolean, default: true },
}, { timestamps: true });
teacherSchema.index({ userId: 1, tenantId: 1 }, { unique: true });
export const Teacher = mongoose.model('Teacher', teacherSchema);

// ========================
// Parents (New Schema)
// ========================
const parentSchema = new Schema({
  userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId:   { type: Schema.Types.ObjectId, ref: 'Tenant' },
  childrenIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });
parentSchema.index({ userId: 1 });
export const Parent = mongoose.model('Parent', parentSchema);

// ========================
// Groups / Halaqas (New Schema)
// ========================
const groupSchema = new Schema({
  tenantId:   { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  teacherId:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name:       { type: String, required: true },
  description: String,
  students:   [{ type: Schema.Types.ObjectId, ref: 'User' }],
  maxStudents: { type: Number, default: 30 },
  level:       { type: String, default: 'beginner' },
  schedule:    String,
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });
groupSchema.index({ tenantId: 1 });
groupSchema.index({ teacherId: 1 });
export const Group = mongoose.model('Group', groupSchema);

// ========================
// Sessions (New Schema)
// ========================
const sessionV2Schema = new Schema({
  tenantId:  { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  groupId:   { type: Schema.Types.ObjectId, ref: 'Group' },
  title:     String,
  startAt:   { type: Date, required: true },
  endAt:     Date,
  type:      { type: String, enum: ['live', 'recorded', 'self'], default: 'live' },
  status:    { type: String, enum: ['scheduled', 'active', 'completed', 'cancelled'], default: 'scheduled' },
  roomToken: String,
  notes:     String,
}, { timestamps: true });
sessionV2Schema.index({ tenantId: 1, startAt: -1 });
sessionV2Schema.index({ teacherId: 1 });
export const SessionV2 = mongoose.model('SessionV2', sessionV2Schema);

// ========================
// Attendance (New Schema)
// ========================
const attendanceSchema = new Schema({
  studentId:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId:  { type: Schema.Types.ObjectId, ref: 'SessionV2', required: true },
  status:     { type: String, enum: ['present', 'absent', 'late', 'excused'], default: 'absent' },
  method:     { type: String, enum: ['manual', 'qr', 'gps', 'nfc'], default: 'manual' },
  note:       String,
  markedAt:   { type: Date, default: Date.now },
}, { timestamps: true });
attendanceSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });
export const Attendance = mongoose.model('Attendance', attendanceSchema);

// ========================
// QuranProgress (New Schema)
// ========================
const quranProgressSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId:  { type: Schema.Types.ObjectId, ref: 'Tenant' },
  surah:     { type: Number, required: true, min: 1, max: 114 },
  ayahFrom:  { type: Number, required: true },
  ayahTo:    { type: Number, required: true },
  status:    { type: String, enum: ['memorized', 'review_needed', 'weak', 'in_progress'], default: 'in_progress' },
  score:     { type: Number, default: 0, min: 0, max: 100 },
  reviewCount: { type: Number, default: 0 },
  lastReviewed: Date,
  teacherNote: String,
}, { timestamps: true });
quranProgressSchema.index({ studentId: 1, surah: 1 });
export const QuranProgressV2 = mongoose.model('QuranProgressV2', quranProgressSchema);

// ========================
// QuranMistakes (New Schema)
// ========================
const quranMistakeSchema = new Schema({
  studentId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId:     { type: Schema.Types.ObjectId, ref: 'Tenant' },
  sessionId:    { type: Schema.Types.ObjectId, ref: 'SessionV2' },
  surahNumber:  { type: Number, required: true },
  ayahNumber:   { type: Number, required: true },
  word:         String,
  correction:   String,
  note:         String,
  severity:     { type: String, enum: ['minor', 'moderate', 'major'], default: 'minor' },
  isResolved:   { type: Boolean, default: false },
  source:       { type: String, enum: ['teacher', 'ai'], default: 'teacher' },
}, { timestamps: true });
quranMistakeSchema.index({ studentId: 1, surahNumber: 1 });
export const QuranMistake = mongoose.model('QuranMistake', quranMistakeSchema);

// ========================
// Exams (New Schema)
// ========================
const examSchema = new Schema({
  tenantId:  { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:      { type: String, enum: ['oral', 'written', 'tajweed'], default: 'oral' },
  surahFrom: Number,
  surahTo:   Number,
  score:     { type: Number, min: 0, max: 100 },
  grade:     { type: String, enum: ['ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'ضعيف'] },
  notes:     String,
  conductedAt: { type: Date, default: Date.now },
}, { timestamps: true });
examSchema.index({ tenantId: 1, studentId: 1 });
export const Exam = mongoose.model('Exam', examSchema);

// ========================
// Achievements (New Schema)
// ========================
const achievementSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId:  { type: Schema.Types.ObjectId, ref: 'Tenant' },
  type:      { 
    type: String, 
    enum: ['page', 'hizb', 'juz', 'khatmah', 'week_streak', 'best_review', 'best_attendance'],
    required: true 
  },
  title:     { type: String, required: true },
  points:    { type: Number, default: 0 },
  badge:     String, // URL or emoji
  metadata:  Schema.Types.Mixed,
}, { timestamps: true });
achievementSchema.index({ studentId: 1 });
export const Achievement = mongoose.model('Achievement', achievementSchema);

// ========================
// AIRequests (New Schema)
// ========================
const aiRequestSchema = new Schema({
  userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  type:     { 
    type: String, 
    enum: ['tasmee', 'teacher_assist', 'parent_report', 'review_plan', 'khatmah_predict', 'motivation'],
    required: true 
  },
  request:  Schema.Types.Mixed,
  response: Schema.Types.Mixed,
  tokens:   { type: Number, default: 0 },
  duration: Number, // ms
  success:  { type: Boolean, default: true },
  error:    String,
}, { timestamps: true });
aiRequestSchema.index({ userId: 1, createdAt: -1 });
aiRequestSchema.index({ tenantId: 1 });
export const AIRequest = mongoose.model('AIRequest', aiRequestSchema);
