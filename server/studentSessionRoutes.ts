import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { requireAuth, requireStudent, type AuthenticatedRequest } from "./authMiddleware";

export function setupStudentSessionRoutes(app: Express) {
  // Handler for student sessions
  const getStudentSessions = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      
      // Get all students and find by userId
      const allStudents = await storage.getAllStudents();
      const student = allStudents.find(s => s.userId === userId);
      
      if (!student) {
        // Return empty array instead of 404 for better UX
        return res.json([]);
      }
      
      try {
        const sessions = await storage.getAllSessionAccess(student.id);
        const liveRooms = await storage.getLiveRoomsByStudent(student.id);
        
        // Merge roomToken into sessions
        const sessionsWithRoomInfo = sessions.map(session => {
          const room = liveRooms.find(r => {
            const roomDate = r.sessionDate instanceof Date
              ? r.sessionDate.toISOString().split('T')[0]
              : String(r.sessionDate).split('T')[0];
            return roomDate === session.sessionDate && r.sessionTime === session.startTime;
          });
          
          return {
            ...session,
            roomToken: room?.roomToken || null,
            roomId: room?.id || null,
            roomStatus: room?.status || null,
            roomIsEnabled: room?.isEnabled || false,
            roomEnabledAt: room?.enabledAt || null,
          };
        });
        
        res.json(sessionsWithRoomInfo);
      } catch (error) {
        console.error("Error fetching session access:", error);
        // Return empty array on storage errors
        res.json([]);
      }
    } catch (error) {
      console.error("Error fetching student sessions:", error);
      res.status(500).json({ message: "خطأ في جلب الحصص" });
    }
  };

  // Get student's sessions - support both URL patterns
  app.get('/api/student/sessions', requireAuth, requireStudent, getStudentSessions);
  app.get('/api/student-sessions', requireAuth, requireStudent, getStudentSessions);

  // Get student's homework
  app.get('/api/homework', requireAuth, requireStudent, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      
      // Get student record
      const allStudents = await storage.getAllStudents();
      const student = allStudents.find(s => s.userId === userId);
      
      if (!student) {
        return res.json([]);
      }
      
      try {
        const homework = await storage.getHomeworksForStudent(student.id);
        res.json(homework);
      } catch (error) {
        console.error("Error fetching homework:", error);
        res.json([]);
      }
    } catch (error) {
      console.error("Error in homework route:", error);
      res.status(500).json({ message: "خطأ في جلب الواجبات" });
    }
  });

  // Get teachers list for students
  app.get('/api/teachers', requireAuth, requireStudent, async (req: Request, res: Response) => {
    try {
      const teachers = await storage.getTeachers();
      res.json(teachers.map(t => ({
        id: t.id,
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.email,
      })));
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.json([]);
    }
  });

  // Get today's assignment
  app.get('/api/student/assignment/today', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      
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
  app.get('/api/student/assignments', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      
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
