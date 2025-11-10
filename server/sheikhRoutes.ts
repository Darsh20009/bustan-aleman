
import type { Express } from "express";
import { storage } from "./storage";
import { requireAuth, requireSupervisorOrAdmin, type AuthenticatedRequest } from "./authMiddleware";
import { wsService } from "./websocket";
import { z } from "zod";
import { studentUpdateSchema } from "@shared/schema";

const assignmentSchema = z.object({
  studentId: z.string(),
  assignmentDate: z.string(),
  memorization: z.string(),
  review: z.string(),
  mistakes: z.string().optional(),
  notes: z.string().optional(),
});

const sessionEnableSchema = z.object({
  studentId: z.string(),
  scheduleId: z.string(),
  sessionDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

const createStudentSchema = z.object({
  studentName: z.string(),
  phoneNumber: z.string(),
  password: z.string(),
  currentLevel: z.string().optional(),
  monthlyPrice: z.coerce.number().nonnegative().optional(),
});

const paymentSchema = z.object({
  studentId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('SAR'),
  paymentMethod: z.string().default('whatsapp'),
  subscriptionPeriod: z.string().default('monthly'),
  sessionsIncluded: z.number().int().positive(),
  expiryDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const scheduleSchema = z.object({
  studentId: z.string(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{1,2}:\d{2}$/),
  endTime: z.string().regex(/^\d{1,2}:\d{2}$/),
});

const meetingSchema = z.object({
  studentId: z.string(),
  scheduledTime: z.string(),
  duration: z.number().int().positive().default(60),
});

const studentErrorSchema = z.object({
  studentId: z.string(),
  surahNumber: z.number().int().min(1).max(114),
  ayahNumber: z.number().int().min(1),
  errorType: z.enum(['pronunciation', 'tajweed', 'memorization']),
  errorDescription: z.string(),
});

export function setupSheikhRoutes(app: Express) {
  // Create new student
  app.post('/api/sheikh/students/create', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const studentData = createStudentSchema.parse(req.body);
      const bcrypt = await import('bcrypt');
      
      const passwordHash = await bcrypt.hash(studentData.password, 10);
      
      const student = await storage.createStudent({
        studentName: studentData.studentName,
        passwordHash,
        phoneNumber: studentData.phoneNumber,
        sheikhId: req.user!.id, // Assign the creating sheikh as the student's sheikh
        currentLevel: studentData.currentLevel || 'beginner',
        monthlySessionsCount: 0,
        monthlyPrice: studentData.monthlyPrice !== undefined ? String(studentData.monthlyPrice) : '0',
        isPaid: false,
        isActive: true,
        memorizedSurahs: '[]',
        notes: null,
        whatsappContact: studentData.phoneNumber,
        dateOfBirth: null,
        grade: null,
        userId: null,
      });
      
      wsService.notifySheikhOfNewStudent(student);
      
      res.status(201).json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ message: "خطأ في إضافة الطالب" });
    }
  });

  // Get all students for sheikh
  app.get('/api/sheikh/students', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const students = await storage.getAllStudents();
      
      const studentsWithProgress = await Promise.all(
        students.map(async (student) => {
          try {
            const user = student.userId ? await storage.getUser(student.userId) : null;
            const progress = student.userId ? await storage.getQuranProgress(student.userId) : null;
            const sessions = await storage.getStudentSessions(student.id);
            const errors = await storage.getStudentErrors(student.id).catch(err => {
              console.error(`Error fetching errors for student ${student.id}:`, err.message);
              return [];
            });
            const schedules = await storage.getStudentSchedules(student.id);
            
            return {
              ...student,
              user,
              progress,
              sessions,
              errors,
              schedules,
            };
          } catch (error) {
            console.error(`Error processing student ${student.id}:`, error);
            return {
              ...student,
              user: null,
              progress: null,
              sessions: [],
              errors: [],
              schedules: [],
            };
          }
        })
      );
      
      res.json(studentsWithProgress);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات الطلاب" });
    }
  });

  // Create daily assignment for student
  app.post('/api/sheikh/assignments', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const assignmentData = assignmentSchema.parse(req.body);
      const sheikhId = req.user!.id;
      
      const assignment = await storage.createDailyAssignment({
        ...assignmentData,
        assignedBy: sheikhId,
      });
      
      // Notify student via WebSocket
      wsService.notifyStudentOfAssignment(assignmentData.studentId, assignment);
      
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(500).json({ message: "خطأ في إنشاء التكليف" });
    }
  });

  // Enable session access for student
  app.post('/api/sheikh/enable-session', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionData = sessionEnableSchema.parse(req.body);
      const sheikhId = req.user!.id;
      
      // Create or get live room with unique roomToken
      const liveRoom = await storage.createOrGetLiveRoom(
        sessionData.studentId,
        sheikhId,
        new Date(sessionData.sessionDate),
        sessionData.startTime
      );
      
      // Update room to enabled status
      await storage.updateLiveRoomStatus(liveRoom.id, 'active');
      
      const sessionAccess = await storage.enableSessionAccess({
        ...sessionData,
        zoomLink: "", // Default zoom link (will be added later if needed)
        isEnabled: true,
        enabledBy: sheikhId,
      });
      
      // Notify student via WebSocket
      wsService.enableSessionAccess(sessionData.studentId, {
        ...sessionAccess,
        roomToken: liveRoom.roomToken,
        roomId: liveRoom.id,
      });
      
      res.status(201).json({
        ...sessionAccess,
        roomToken: liveRoom.roomToken,
        roomId: liveRoom.id,
      });
    } catch (error) {
      console.error("Error enabling session:", error);
      res.status(500).json({ message: "خطأ في تفعيل الحصة" });
    }
  });

  // Get sheikh's sessions
  app.get('/api/sheikh/sessions', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const sheikhId = req.user!.id;
      const range = req.query.range as 'upcoming' | 'past' | 'today' | undefined;
      
      const sessions = await storage.getSheikhSessions(sheikhId, range);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sheikh sessions:", error);
      res.status(500).json({ message: "خطأ في جلب الحصص" });
    }
  });

  // Update student memorization and errors
  app.post('/api/sheikh/update-student-progress', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { studentId, memorizedSurahs, errors, notes } = req.body;
      
      // Update student data
      const updatedStudent = await storage.updateStudent(studentId, {
        memorizedSurahs: JSON.stringify(memorizedSurahs),
        notes,
      });
      
      // Add errors if any
      if (errors && errors.length > 0) {
        for (const error of errors) {
          await storage.createStudentError({
            studentId,
            ...error
          });
        }
      }
      
      // Notify student via WebSocket
      wsService.notifyStudentOfAssignment(studentId, {
        type: 'progress_update',
        data: updatedStudent
      });
      
      res.json(updatedStudent);
    } catch (error) {
      console.error("Error updating student progress:", error);
      res.status(500).json({ message: "خطأ في تحديث تقدم الطالب" });
    }
  });

  // Get student's today assignment
  app.get('/api/sheikh/assignments/:studentId/today', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const studentId = req.params.studentId;
      const today = new Date().toISOString().split('T')[0];
      
      const assignment = await storage.getDailyAssignment(studentId, today);
      res.json(assignment);
    } catch (error) {
      console.error("Error fetching assignment:", error);
      res.status(500).json({ message: "خطأ في جلب التكليف" });
    }
  });

  // Get all assignments
  app.get('/api/sheikh/assignments', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const assignments = await storage.getAllDailyAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "خطأ في جلب التكاليف" });
    }
  });

  // Create payment for student
  app.post('/api/sheikh/payments', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const paymentData = paymentSchema.parse(req.body);
      
      const payment = await storage.createStudentPayment({
        studentId: paymentData.studentId,
        amount: paymentData.amount.toString(),
        currency: paymentData.currency,
        paymentMethod: paymentData.paymentMethod,
        subscriptionPeriod: paymentData.subscriptionPeriod,
        sessionsIncluded: paymentData.sessionsIncluded,
        sessionsRemaining: paymentData.sessionsIncluded,
        expiryDate: paymentData.expiryDate || null,
        status: 'active',
        notes: paymentData.notes || null,
      });
      
      wsService.notifyStudentOfPayment(paymentData.studentId, payment);
      
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صالحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في إنشاء الدفعة" });
    }
  });

  // Get student payments
  app.get('/api/sheikh/payments/:studentId', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const studentId = req.params.studentId;
      const payments = await storage.getStudentPayments(studentId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "خطأ في جلب الدفعات" });
    }
  });

  // Update student information
  app.patch('/api/sheikh/students/:id', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const studentId = req.params.id;
      const updateData = studentUpdateSchema.parse(req.body);
      
      // Convert monthlyPrice to string if it's a number
      if (typeof updateData.monthlyPrice === 'number') {
        updateData.monthlyPrice = updateData.monthlyPrice.toString();
      }
      
      const updatedStudent = await storage.updateStudent(studentId, updateData);
      
      res.json(updatedStudent);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "خطأ في تحديث بيانات الطالب" });
    }
  });

  // Delete student
  app.delete('/api/sheikh/students/:id', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const studentId = req.params.id;
      await storage.deleteStudent(studentId);
      
      res.json({ message: "تم حذف الطالب بنجاح" });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "خطأ في حذف الطالب" });
    }
  });

  // Create class schedule
  app.post('/api/sheikh/schedules', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const scheduleData = scheduleSchema.parse(req.body);
      
      const schedule = await storage.createClassSchedule({
        studentId: scheduleData.studentId,
        dayOfWeek: scheduleData.dayOfWeek,
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
        isActive: true,
      });
      
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error creating schedule:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صالحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في إنشاء الجدول" });
    }
  });

  // Get schedules for a specific student
  app.get('/api/sheikh/students/:studentId/schedules', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const studentId = req.params.studentId;
      const schedules = await storage.getStudentSchedules(studentId);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      res.status(500).json({ message: "خطأ في جلب الجدول" });
    }
  });

  // Update schedule
  app.put('/api/sheikh/schedules/:id', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const scheduleId = req.params.id;
      const scheduleData = req.body;
      
      const updatedSchedule = await storage.updateClassSchedule(scheduleId, {
        dayOfWeek: scheduleData.dayOfWeek,
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
        isActive: scheduleData.isActive !== undefined ? scheduleData.isActive : true,
      });
      
      res.json(updatedSchedule);
    } catch (error) {
      console.error("Error updating schedule:", error);
      res.status(500).json({ message: "خطأ في تحديث الجدول" });
    }
  });

  // Delete schedule
  app.delete('/api/sheikh/schedules/:id', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const scheduleId = req.params.id;
      await storage.deleteClassSchedule(scheduleId);
      res.json({ message: "تم حذف الجدول بنجاح" });
    } catch (error) {
      console.error("Error deleting schedule:", error);
      res.status(500).json({ message: "خطأ في حذف الجدول" });
    }
  });

  // Create live meeting room
  app.post('/api/sheikh/create-meeting', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const meetingData = meetingSchema.parse(req.body);
      const sheikhId = req.user!.id;
      
      const meetingId = `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const meetingLink = `/meeting/${meetingId}`;
      
      const meeting = {
        id: meetingId,
        sheikhId,
        studentId: meetingData.studentId,
        scheduledTime: meetingData.scheduledTime,
        duration: meetingData.duration,
        meetingLink,
        status: 'scheduled',
        createdAt: new Date(),
      };
      
      wsService.notifyStudentOfMeeting(meetingData.studentId, meeting);
      
      res.status(201).json(meeting);
    } catch (error) {
      console.error("Error creating meeting:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صالحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في إنشاء الحصة" });
    }
  });

  // Student errors management
  app.get('/api/sheikh/student-errors/:studentId', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { studentId } = req.params;
      const errors = await storage.getStudentErrors(studentId);
      res.json(errors);
    } catch (error) {
      console.error("Error fetching student errors:", error);
      res.status(500).json({ message: "خطأ في جلب الأخطاء" });
    }
  });

  app.post('/api/sheikh/student-errors', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const errorData = studentErrorSchema.parse(req.body);
      const sheikhId = req.user!.id;
      
      const error = await storage.createStudentError({
        studentId: errorData.studentId,
        surahNumber: errorData.surahNumber,
        surahName: errorData.surahName,
        ayahNumber: errorData.ayahNumber,
        errorType: errorData.errorType,
        errorDescription: errorData.errorDescription,
      });
      
      wsService.notifyStudentOfNewError(errorData.studentId, error);
      
      res.status(201).json(error);
    } catch (error) {
      console.error("Error creating student error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات غير صالحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في تسجيل الخطأ" });
    }
  });

  app.delete('/api/sheikh/student-errors/:errorId', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { errorId } = req.params;
      await storage.deleteStudentError(errorId);
      res.json({ message: "تم حذف الخطأ بنجاح" });
    } catch (error) {
      console.error("Error deleting student error:", error);
      res.status(500).json({ message: "خطأ في حذف الخطأ" });
    }
  });
}
