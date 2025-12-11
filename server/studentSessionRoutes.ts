import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { requireAuth, requireStudent, type AuthenticatedRequest } from "./authMiddleware";

export function setupStudentSessionRoutes(app: Express) {
  // Handler for student sessions
  const getStudentSessions = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      
      // Use efficient lookup methods
      let student = await storage.getStudentByUserId(userId);
      
      // Try to find by phone number if not found by userId
      if (!student) {
        const user = await storage.getUser(userId);
        if (user?.phoneNumber) {
          student = await storage.getStudentByPhone(user.phoneNumber);
          // Link the student to this user for future requests
          if (student) {
            try {
              await storage.updateStudent(student.id, { userId: userId });
            } catch (e) { /* ignore linking errors */ }
          }
        }
      }
      
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

  // Helper function to get student record from request using efficient lookups
  const getStudentFromRequest = async (req: Request) => {
    const userId = (req as AuthenticatedRequest).user!.id;
    
    // First try to find by userId (most efficient)
    let student = await storage.getStudentByUserId(userId);
    if (student) return student;
    
    // Try by phone number and link if found
    const user = await storage.getUser(userId);
    if (user?.phoneNumber) {
      student = await storage.getStudentByPhone(user.phoneNumber);
      if (student) {
        // Link to this user
        try {
          await storage.updateStudent(student.id, { userId });
          return { ...student, userId };
        } catch (e) { /* ignore linking error */ }
        return student;
      }
    }
    
    return undefined;
  };

  // Get student's homework
  app.get('/api/homework', requireAuth, requireStudent, async (req: Request, res: Response) => {
    try {
      const student = await getStudentFromRequest(req);
      
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
      const student = await getStudentFromRequest(req);
      
      if (!student) {
        return res.status(404).json({ message: "سجل الطالب غير موجود" });
      }
      
      const today = new Date().toISOString().split('T')[0];
      const assignment = await storage.getDailyAssignment(student.id, today);
      
      if (!assignment) {
        return res.json(null); // Return null instead of 404 for better UX
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
      const student = await getStudentFromRequest(req);
      
      if (!student) {
        return res.json([]);
      }
      
      const assignments = await storage.getDailyAssignments(student.id);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "خطأ في جلب التكاليف" });
    }
  });

  // Get student progress
  app.get('/api/student/progress', requireAuth, async (req: Request, res: Response) => {
    try {
      const student = await getStudentFromRequest(req);
      
      if (!student) {
        return res.json({
          memorizedParts: 0,
          attendanceRate: 0,
          totalSessions: 0,
          completedSessions: 0,
        });
      }
      
      // Get student's session history for attendance
      const sessions = await storage.getAllSessionAccess(student.id);
      const totalSessions = sessions.length;
      const completedSessions = sessions.filter(s => s.isEnabled).length;
      const attendanceRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 100;
      
      // Parse memorized surahs
      let memorizedParts = 0;
      try {
        const memorized = JSON.parse(student.memorizedSurahs || '[]');
        memorizedParts = Math.floor(memorized.length / 3); // Rough estimation
      } catch { /* ignore */ }
      
      res.json({
        memorizedParts,
        attendanceRate,
        totalSessions,
        completedSessions,
        currentLevel: student.currentLevel || 'beginner',
      });
    } catch (error) {
      console.error("Error fetching student progress:", error);
      res.status(500).json({ message: "خطأ في جلب التقدم" });
    }
  });
}
