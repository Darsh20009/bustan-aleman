import type { Express } from "express";
import { storage } from "./storage";
import { requireAuth, requireAdminOrOwner, requireTeacherOrHigher, type AuthenticatedRequest } from "./authMiddleware";

export function setupAdminDashboardRoutes(app: Express) {
  // ==================== Dashboard Statistics ====================

  // Get overall statistics
  app.get('/api/admin/stats', requireAuth, requireAdminOrOwner, async (req: AuthenticatedRequest, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "خطأ في جلب الإحصائيات" });
    }
  });

  // Get students count
  app.get('/api/admin/stats/students', requireAuth, requireTeacherOrHigher, async (req: AuthenticatedRequest, res) => {
    try {
      const count = await storage.getStudentsCount();
      res.json({ count });
    } catch (error) {
      console.error("Error fetching students count:", error);
      res.status(500).json({ message: "خطأ في جلب عدد الطلاب" });
    }
  });

  // Get teachers count
  app.get('/api/admin/stats/teachers', requireAuth, requireAdminOrOwner, async (req: AuthenticatedRequest, res) => {
    try {
      const count = await storage.getTeachersCount();
      res.json({ count });
    } catch (error) {
      console.error("Error fetching teachers count:", error);
      res.status(500).json({ message: "خطأ في جلب عدد المعلمين" });
    }
  });

  // Get groups/classes count
  app.get('/api/admin/stats/groups', requireAuth, requireTeacherOrHigher, async (req: AuthenticatedRequest, res) => {
    try {
      const count = await storage.getGroupsCount();
      res.json({ count });
    } catch (error) {
      console.error("Error fetching groups count:", error);
      res.status(500).json({ message: "خطأ في جلب عدد الحلقات" });
    }
  });

  // Get active subscriptions count
  app.get('/api/admin/stats/subscriptions', requireAuth, requireAdminOrOwner, async (req: AuthenticatedRequest, res) => {
    try {
      const stats = await storage.getSubscriptionStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching subscription stats:", error);
      res.status(500).json({ message: "خطأ في جلب إحصائيات الاشتراكات" });
    }
  });

  // ==================== Reports ====================

  // Get daily attendance report
  app.get('/api/admin/reports/attendance', requireAuth, requireTeacherOrHigher, async (req: AuthenticatedRequest, res) => {
    try {
      const { date, startDate, endDate } = req.query;
      const report = await storage.getAttendanceReport({
        date: date as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      });
      res.json(report);
    } catch (error) {
      console.error("Error fetching attendance report:", error);
      res.status(500).json({ message: "خطأ في جلب تقرير الحضور" });
    }
  });

  // Get revenue report
  app.get('/api/admin/reports/revenue', requireAuth, requireAdminOrOwner, async (req: AuthenticatedRequest, res) => {
    try {
      const { period = 'monthly', startDate, endDate } = req.query;
      const report = await storage.getRevenueReport({
        period: period as string,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      });
      res.json(report);
    } catch (error) {
      console.error("Error fetching revenue report:", error);
      res.status(500).json({ message: "خطأ في جلب تقرير الإيرادات" });
    }
  });

  // Get overdue payments report
  app.get('/api/admin/reports/overdue-payments', requireAuth, requireAdminOrOwner, async (req: AuthenticatedRequest, res) => {
    try {
      const overdueList = await storage.getOverduePayments();
      res.json(overdueList);
    } catch (error) {
      console.error("Error fetching overdue payments:", error);
      res.status(500).json({ message: "خطأ في جلب المتأخرين عن الدفع" });
    }
  });

  // Get student progress report
  app.get('/api/admin/reports/student-progress', requireAuth, requireTeacherOrHigher, async (req: AuthenticatedRequest, res) => {
    try {
      const { studentId, teacherId } = req.query;
      const report = await storage.getStudentProgressReport({
        studentId: studentId as string | undefined,
        teacherId: teacherId as string | undefined,
      });
      res.json(report);
    } catch (error) {
      console.error("Error fetching student progress report:", error);
      res.status(500).json({ message: "خطأ في جلب تقرير تقدم الطلاب" });
    }
  });

  // ==================== User Management ====================

  // Get all users with filters
  app.get('/api/admin/users', requireAuth, requireAdminOrOwner, async (req: AuthenticatedRequest, res) => {
    try {
      const { role, isActive, page = 1, limit = 20 } = req.query;
      const users = await storage.getAllUsers({
        role: role as string | undefined,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        page: Number(page),
        limit: Number(limit),
      });
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "خطأ في جلب المستخدمين" });
    }
  });

  // Update user role
  app.patch('/api/admin/users/:id/role', requireAuth, requireAdminOrOwner, async (req: AuthenticatedRequest, res) => {
    try {
      const { role } = req.body;
      const allowedRoles = ['student', 'teacher', 'supervisor', 'admin', 'owner'];
      
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "الدور غير صحيح" });
      }

      const user = await storage.updateUserRole(req.params.id, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "خطأ في تحديث دور المستخدم" });
    }
  });

  // Activate/Deactivate user
  app.patch('/api/admin/users/:id/status', requireAuth, requireAdminOrOwner, async (req: AuthenticatedRequest, res) => {
    try {
      const { isActive } = req.body;
      const user = await storage.updateUserStatus(req.params.id, isActive);
      res.json(user);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "خطأ في تحديث حالة المستخدم" });
    }
  });

  // ==================== Messages ====================

  // Get all contact messages
  app.get('/api/admin/messages', requireAuth, requireTeacherOrHigher, async (req: AuthenticatedRequest, res) => {
    try {
      const { isRead, page = 1, limit = 20 } = req.query;
      const messages = await storage.getContactMessages({
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
        page: Number(page),
        limit: Number(limit),
      });
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "خطأ في جلب الرسائل" });
    }
  });

  // Mark message as read
  app.patch('/api/admin/messages/:id/read', requireAuth, requireTeacherOrHigher, async (req: AuthenticatedRequest, res) => {
    try {
      const message = await storage.markMessageAsRead(req.params.id);
      res.json(message);
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "خطأ في تحديث الرسالة" });
    }
  });

  // ==================== Teacher Management ====================

  // Get all teachers
  app.get('/api/admin/teachers', requireAuth, requireAdminOrOwner, async (req: AuthenticatedRequest, res) => {
    try {
      const teachers = await storage.getTeachers();
      res.json(teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ message: "خطأ في جلب المعلمين" });
    }
  });

  // Assign student to teacher
  app.post('/api/admin/teachers/:teacherId/assign-student', requireAuth, requireAdminOrOwner, async (req: AuthenticatedRequest, res) => {
    try {
      const { studentId } = req.body;
      const result = await storage.assignStudentToTeacher(req.params.teacherId, studentId);
      res.json(result);
    } catch (error) {
      console.error("Error assigning student to teacher:", error);
      res.status(500).json({ message: "خطأ في تعيين الطالب للمعلم" });
    }
  });

  console.log("✅ Admin dashboard routes setup");
}
