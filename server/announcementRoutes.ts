import { Express } from "express";

export function registerAnnouncementRoutes(app: Express) {
  // Get all announcements
  app.get('/api/announcements', async (req, res) => {
    try {
      // Mock data for now - would come from database in production
      const announcements = [
        {
          id: "1",
          title: "مرحباً بكم في بستان الإيمان",
          content: "نرحب بجميع الطلاب في منصتنا التعليمية. نتمنى لكم رحلة مباركة في حفظ كتاب الله الكريم.",
          type: "announcement",
          authorId: "supervisor1",
          authorName: "الشيخ أحمد عبدالعزيز",
          createdAt: new Date().toISOString(),
          isRead: false
        },
        {
          id: "2",
          title: "بدء دورة تجويد جديدة",
          content: "سيتم بدء دورة تجويد جديدة للمستوى المتقدم يوم الأحد القادم. التسجيل متاح الآن.",
          type: "news",
          authorId: "supervisor1",
          authorName: "الشيخ أحمد عبدالعزيز",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          isRead: false
        },
        {
          id: "3",
          title: "موعد الاختبارات الشهرية",
          content: "تنبيه هام: ستبدأ الاختبارات الشهرية يوم الخميس القادم. يرجى المراجعة والاستعداد الجيد.",
          type: "important",
          authorId: "supervisor1",
          authorName: "الشيخ أحمد عبدالعزيز",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          isRead: true
        }
      ];

      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "خطأ في جلب الإعلانات" });
    }
  });

  // Mark announcement as read
  app.post('/api/announcements/:id/read', async (req, res) => {
    try {
      const { id } = req.params;
      // In production, update database
      res.json({ message: "تم تحديث حالة القراءة" });
    } catch (error) {
      console.error("Error marking announcement as read:", error);
      res.status(500).json({ message: "خطأ في تحديث الإعلان" });
    }
  });
}
