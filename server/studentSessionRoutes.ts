import type { Express } from "express";
import { storage } from "./storage";
import { requireAuth, type AuthenticatedRequest } from "./authMiddleware";

export function setupStudentSessionRoutes(app: Express) {
  // Get student's sessions
  app.get('/api/student/sessions', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      
      // Get student record from userId
      const students = await storage.getAllStudents();
      const student = students.find(s => s.userId === userId);
      
      if (!student) {
        return res.status(404).json({ message: "سجل الطالب غير موجود" });
      }
      
      const sessions = await storage.getAllSessionAccess(student.id);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching student sessions:", error);
      res.status(500).json({ message: "خطأ في جلب الحصص" });
    }
  });

  // Get today's assignment
  app.get('/api/student/assignment/today', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      
      // Get student record from userId
      const students = await storage.getAllStudents();
      const student = students.find(s => s.userId === userId);
      
      if (!student) {
        return res.status(404).json({ message: "سجل الطالب غير موجود" });
      }
      
      const today = new Date().toISOString().split('T')[0];
      const assignment = await storage.getDailyAssignment(student.id, today);
      
      if (!assignment) {
        return res.status(404).json({ message: "لا يوجد تكليف اليوم" });
      }
      
      res.json(assignment);
    } catch (error) {
      console.error("Error fetching today's assignment:", error);
      res.status(500).json({ message: "خطأ في جلب التكليف" });
    }
  });

  // Get all assignments
  app.get('/api/student/assignments', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      
      // Get student record from userId
      const students = await storage.getAllStudents();
      const student = students.find(s => s.userId === userId);
      
      if (!student) {
        return res.status(404).json({ message: "سجل الطالب غير موجود" });
      }
      
      const assignments = await storage.getDailyAssignments(student.id);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "خطأ في جلب التكاليف" });
    }
  });
}
