
import type { Express } from "express";
import { storage } from "./storage";
import { requireAuth, requireSupervisorOrAdmin, type AuthenticatedRequest } from "./authMiddleware";
import { wsService } from "./websocket";
import { z } from "zod";

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
  zoomLink: z.string(),
});

export function setupSheikhRoutes(app: Express) {
  // Get all students for sheikh
  app.get('/api/sheikh/students', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const students = await storage.getAllStudents();
      
      const studentsWithProgress = await Promise.all(
        students.map(async (student) => {
          const user = student.userId ? await storage.getUser(student.userId) : null;
          const progress = student.userId ? await storage.getQuranProgress(student.userId) : null;
          const sessions = await storage.getStudentSessions(student.id);
          const errors = await storage.getStudentErrors(student.id);
          const schedules = await storage.getStudentSchedules(student.id);
          
          return {
            ...student,
            user,
            progress,
            sessions,
            errors,
            schedules,
          };
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
      
      const sessionAccess = await storage.enableSessionAccess({
        ...sessionData,
        isEnabled: true,
        enabledBy: sheikhId,
      });
      
      // Notify student via WebSocket
      wsService.enableSessionAccess(sessionData.studentId, sessionAccess);
      
      res.status(201).json(sessionAccess);
    } catch (error) {
      console.error("Error enabling session:", error);
      res.status(500).json({ message: "خطأ في تفعيل الحصة" });
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
}
