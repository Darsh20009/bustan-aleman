import type { Express } from "express";
import { requireAuth, requireSupervisorOrAdmin, type AuthenticatedRequest } from "./authMiddleware";
import { kiroxService } from "./kiroxService";

export function setupKiroxRoutes(app: Express) {
  app.post('/api/kirox/meetings', requireAuth, requireSupervisorOrAdmin, async (req: any, res) => {
    try {
      const { title, scheduledAt, durationMinutes } = req.body;
      if (!title || !scheduledAt) {
        return res.status(400).json({ message: 'العنوان والموعد مطلوبان' });
      }

      const meeting = await kiroxService.createMeeting({
        title,
        scheduledAt,
        durationMinutes: durationMinutes || 60,
      });

      res.json({
        ...meeting,
        joinUrl: meeting.joinUrl || kiroxService.getJoinUrl(meeting.roomName),
      });
    } catch (error: any) {
      console.error('Kirox create error:', error.message);
      res.status(500).json({ message: 'خطأ في إنشاء الحصة' });
    }
  });

  app.get('/api/kirox/meetings', requireAuth, requireSupervisorOrAdmin, async (_req, res) => {
    try {
      const meetings = await kiroxService.listMeetings();
      res.json(meetings);
    } catch (error: any) {
      console.error('Kirox list error:', error.message);
      res.status(500).json({ message: 'خطأ في جلب الاجتماعات' });
    }
  });

  app.get('/api/kirox/meetings/:roomName', requireAuth, async (req, res) => {
    try {
      const meeting = await kiroxService.getMeeting(req.params.roomName);
      if (!meeting) {
        return res.status(404).json({ message: 'الاجتماع غير موجود' });
      }
      res.json({
        ...meeting,
        joinUrl: meeting.joinUrl || kiroxService.getJoinUrl(req.params.roomName),
      });
    } catch (error: any) {
      res.status(500).json({ message: 'خطأ في جلب تفاصيل الاجتماع' });
    }
  });

  app.delete('/api/kirox/meetings/:roomName', requireAuth, requireSupervisorOrAdmin, async (req, res) => {
    try {
      const success = await kiroxService.deleteMeeting(req.params.roomName);
      if (success) {
        res.json({ message: 'تم إلغاء الاجتماع بنجاح' });
      } else {
        res.status(500).json({ message: 'فشل في إلغاء الاجتماع' });
      }
    } catch (error: any) {
      res.status(500).json({ message: 'خطأ في إلغاء الاجتماع' });
    }
  });

  app.get('/api/kirox/join/:roomName', requireAuth, async (req, res) => {
    try {
      const joinUrl = kiroxService.getJoinUrl(req.params.roomName);
      res.json({ joinUrl });
    } catch (error: any) {
      res.status(500).json({ message: 'خطأ في الحصول على رابط الانضمام' });
    }
  });

  app.get('/api/kirox/status', (_req, res) => {
    res.json({ configured: kiroxService.isConfigured() });
  });

  console.log("✅ Kirox routes setup");
}
