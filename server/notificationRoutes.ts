import type { Express } from "express";
import { storage } from "./storage";
import type { AuthenticatedRequest } from "./authMiddleware";
import { requireAuth } from "./authMiddleware";

export function setupNotificationRoutes(app: Express) {
  // Get user notifications
  app.get('/api/notifications', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "خطأ في جلب الإشعارات" });
    }
  });

  // Mark notification as read
  app.post('/api/notifications/:id/read', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      await storage.markNotificationAsRead(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "خطأ في تحديث الإشعار" });
    }
  });

  // Mark all notifications as read
  app.post('/api/notifications/read-all', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "خطأ في تحديث الإشعارات" });
    }
  });

  // Delete notification
  app.delete('/api/notifications/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      await storage.deleteNotification(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "خطأ في حذف الإشعار" });
    }
  });

  // Create notification (for supervisors/admin)
  app.post('/api/notifications', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userRole = req.user!.role;
      if (userRole !== 'supervisor' && userRole !== 'admin') {
        return res.status(403).json({ message: "غير مصرح لك بإنشاء الإشعارات" });
      }

      const notificationData = req.body;
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "خطأ في إنشاء الإشعار" });
    }
  });
}
